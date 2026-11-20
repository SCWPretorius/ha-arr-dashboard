"""Radarr data update coordinator."""

from __future__ import annotations

import logging
from dataclasses import dataclass, field
from datetime import UTC, datetime
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed

from ..const import (
    DOMAIN,
    EVENT_DOWNLOAD_COMPLETED,
    EVENT_DOWNLOAD_FAILED,
    EVENT_HEALTH_ISSUE,
)
from ..core.client import ArrCannotConnect, ArrClientError, ArrInvalidAuth
from ..core.events import movie_event_base
from .client import RadarrClient

_LOGGER = logging.getLogger(__name__)


@dataclass
class ArrDashboardData:
    """Coordinator data payload."""

    movies: list[dict[str, Any]] = field(default_factory=list)
    queue: dict[str, Any] = field(default_factory=dict)
    queue_count: int = 0
    health: list[dict[str, Any]] = field(default_factory=list)
    disk_space: list[dict[str, Any]] = field(default_factory=list)
    root_folders: list[dict[str, Any]] = field(default_factory=list)
    quality_profiles: list[dict[str, Any]] = field(default_factory=list)
    system: dict[str, Any] = field(default_factory=dict)
    reachable: bool = True
    last_success: datetime | None = None


@dataclass(frozen=True)
class _QueueSnap:
    queue_id: int
    movie_id: int | None
    title: str | None
    year: int | None
    quality: str | None
    size: int | None
    active: bool


def _slim_movie(movie: dict[str, Any], entry_id: str) -> dict[str, Any]:
    images = movie.get("images") or []
    remote_poster = None
    for img in images:
        if img.get("coverType") == "poster" and img.get("remoteUrl"):
            remote_poster = img["remoteUrl"]
            break
    poster_url = remote_poster or f"/api/arr_dashboard/{entry_id}/poster/{movie['id']}"
    has_file = movie.get("movieFile") is not None
    return {
        "id": movie["id"],
        "title": movie.get("title"),
        "year": movie.get("year"),
        "tmdbId": movie.get("tmdbId"),
        "imdbId": movie.get("imdbId"),
        "status": movie.get("status"),
        "monitored": movie.get("monitored"),
        "hasFile": has_file,
        "quality": (
            movie.get("movieFile", {}).get("quality", {}).get("quality", {}).get("name")
        ),
        "sizeOnDisk": movie.get("sizeOnDisk", 0),
        "added": movie.get("added"),
        "posterUrl": poster_url,
        "qualityProfileId": movie.get("qualityProfileId"),
        "path": movie.get("path"),
        "overview": movie.get("overview"),
        "runtime": movie.get("runtime"),
        "certification": movie.get("certification"),
        "movieFile": movie.get("movieFile"),
    }


def _queue_snap(item: dict[str, Any]) -> _QueueSnap:
    movie = item.get("movie") or {}
    st = (item.get("status") or "").lower()
    tracked = (
        item.get("trackedDownloadState")
        or item.get("trackedDownloadStatus")
        or ""
    ).lower()
    active = st in {"downloading", "queued", "warning"} or tracked in {
        "importing",
        "importpending",
        "importblocked",
    }
    quality = (item.get("quality") or {}).get("quality", {}).get("name")
    return _QueueSnap(
        queue_id=int(item["id"]),
        movie_id=movie.get("id"),
        title=movie.get("title"),
        year=movie.get("year"),
        quality=quality,
        size=item.get("size"),
        active=active,
    )


def _is_failed(item: dict[str, Any]) -> bool:
    status = (item.get("status") or "").lower()
    tracked = (
        item.get("trackedDownloadState")
        or item.get("trackedDownloadStatus")
        or ""
    ).lower()
    return status == "failed" or tracked in ("failed", "failedpending")


def _health_key(item: dict[str, Any]) -> str:
    return f"{item.get('source', '')}:{item.get('message', '')}"


class RadarrDataUpdateCoordinator(DataUpdateCoordinator[ArrDashboardData]):
    """Poll Radarr for library, queue, and system data."""

    config_entry: ConfigEntry

    def __init__(
        self,
        hass: HomeAssistant,
        client: RadarrClient,
        entry: ConfigEntry,
    ) -> None:
        self.client = client
        self._seen_failed: set[int] = set()
        self._seen_completed: set[int] = set()
        self._seen_health: set[str] = set()
        self._prev_queue: dict[int, _QueueSnap] = {}
        self._active_health: set[str] = set()
        super().__init__(
            hass,
            _LOGGER,
            name=f"{DOMAIN}_{entry.entry_id}",
            update_interval=None,
        )
        self.config_entry = entry
        self.data = ArrDashboardData()

    async def _async_update_data(self) -> ArrDashboardData:
        data = ArrDashboardData()
        try:
            movies_raw = await self.client.get_movies()
            queue = await self.client.get_queue()
            health = await self.client.get_health()
            disk = await self.client.get_disk_space()
            system = await self.client.get_system_status()
            roots = await self.client.get_root_folders()
            profiles = await self.client.get_quality_profiles()

            data.movies = [
                _slim_movie(m, self.config_entry.entry_id) for m in movies_raw
            ]
            data.queue = queue
            records = queue.get("records") or []
            data.queue_count = queue.get("totalRecords", len(records))
            data.health = health
            data.disk_space = disk
            data.system = system
            data.root_folders = roots
            data.quality_profiles = profiles
            data.reachable = True
            data.last_success = datetime.now(UTC)
            self._process_queue_events(records, data.movies)
            self._process_health_events(health)
        except ArrInvalidAuth as err:
            self.config_entry.async_start_reauth(self.hass)
            raise UpdateFailed("Authentication failed") from err
        except (ArrCannotConnect, ArrClientError) as err:
            data.reachable = False
            if self.data:
                data.movies = self.data.movies
                data.queue = self.data.queue
                data.queue_count = self.data.queue_count
            raise UpdateFailed(str(err)) from err
        return data

    @callback
    def _fire(self, event_type: str, data: dict[str, Any]) -> None:
        self.hass.bus.async_fire(event_type, data)

    def _process_queue_events(
        self,
        records: list[dict[str, Any]],
        movies: list[dict[str, Any]],
    ) -> None:
        current: dict[int, _QueueSnap] = {}
        for item in records:
            qid = item.get("id")
            if qid is None:
                continue
            snap = _queue_snap(item)
            current[int(qid)] = snap
            if _is_failed(item) and int(qid) not in self._seen_failed:
                self._seen_failed.add(int(qid))
                reason = item.get("statusMessages") or item.get("errorMessage")
                if isinstance(reason, list):
                    reason = ", ".join(str(r) for r in reason)
                self._fire(
                    EVENT_DOWNLOAD_FAILED,
                    movie_event_base(
                        self.config_entry.title,
                        snap.title,
                        snap.year,
                        quality=snap.quality,
                        size=snap.size,
                        reason=str(reason) if reason else None,
                    ),
                )

        removed = set(self._prev_queue.keys()) - set(current.keys())
        movies_by_id = {m["id"]: m for m in movies}
        for qid in removed:
            prev = self._prev_queue[qid]
            if not prev.active or qid in self._seen_completed:
                continue
            movie = movies_by_id.get(prev.movie_id or 0)
            if movie and movie.get("hasFile"):
                self._seen_completed.add(qid)
                size = movie.get("sizeOnDisk")
                self._fire(
                    EVENT_DOWNLOAD_COMPLETED,
                    movie_event_base(
                        self.config_entry.title,
                        prev.title,
                        prev.year,
                        quality=movie.get("quality") or prev.quality,
                        size=size,
                    ),
                )

        self._prev_queue = current

    def _process_health_events(self, health: list[dict[str, Any]]) -> None:
        current_keys: set[str] = set()
        for item in health:
            if item.get("type") not in ("warning", "error"):
                continue
            key = _health_key(item)
            current_keys.add(key)
            if key not in self._active_health and key not in self._seen_health:
                self._seen_health.add(key)
                self._fire(
                    EVENT_HEALTH_ISSUE,
                    movie_event_base(
                        self.config_entry.title,
                        item.get("source"),
                        None,
                        reason=item.get("message"),
                    ),
                )
        self._active_health = current_keys

    async def async_request_refresh_movies(self) -> None:
        await self.async_request_refresh()