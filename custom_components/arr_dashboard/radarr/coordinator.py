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
    had_file: bool


def _tmdb_tile_poster(url: str | None) -> str | None:
    """Use a smaller TMDb profile for list/grid payloads when Radarr sends originals."""
    if not url or not url.startswith("https://image.tmdb.org/t/p/"):
        return url
    rest = url.removeprefix("https://image.tmdb.org/t/p/")
    if "/" not in rest:
        return url
    _size, path = rest.split("/", 1)
    return f"https://image.tmdb.org/t/p/w185/{path}"


def _slim_movie(movie: dict[str, Any], entry_id: str) -> dict[str, Any]:
    images = movie.get("images") or []
    remote_poster = None
    for img in images:
        if img.get("coverType") == "poster" and img.get("remoteUrl"):
            remote_poster = img["remoteUrl"]
            break
    raw_poster = remote_poster or f"/api/arr_dashboard/{entry_id}/poster/{movie['id']}"
    poster_url = _tmdb_tile_poster(raw_poster) or raw_poster
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
    }


def _queue_snap(
    item: dict[str, Any], movies_by_id: dict[int, dict[str, Any]]
) -> _QueueSnap:
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
    movie_id = movie.get("id")
    had_file = bool(
        movies_by_id.get(int(movie_id or 0), {}).get("hasFile")
    )
    return _QueueSnap(
        queue_id=int(item["id"]),
        movie_id=movie_id,
        title=movie.get("title"),
        year=movie.get("year"),
        quality=quality,
        size=item.get("size"),
        active=active,
        had_file=had_file,
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
        self._queue_events_seeded = False
        self._health_events_seeded = False
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
        except (ArrCannotConnect, ArrClientError):
            previous = self.data or ArrDashboardData()
            data.reachable = False
            data.movies = previous.movies
            data.queue = previous.queue
            data.queue_count = previous.queue_count
            data.health = previous.health
            data.disk_space = previous.disk_space
            data.system = previous.system
            data.root_folders = previous.root_folders
            data.quality_profiles = previous.quality_profiles
            data.last_success = previous.last_success
            return data
        return data

    @callback
    def _fire(self, event_type: str, data: dict[str, Any]) -> None:
        self.hass.bus.async_fire(event_type, data)

    def _process_queue_events(
        self,
        records: list[dict[str, Any]],
        movies: list[dict[str, Any]],
    ) -> None:
        movies_by_id = {m["id"]: m for m in movies}
        current: dict[int, _QueueSnap] = {}
        for item in records:
            qid = item.get("id")
            if qid is None:
                continue
            snap = _queue_snap(item, movies_by_id)
            current[int(qid)] = snap

        if not self._queue_events_seeded:
            for qid in current:
                item = next((r for r in records if int(r["id"]) == qid), None)
                if item and _is_failed(item):
                    self._seen_failed.add(qid)
            self._prev_queue = current
            self._queue_events_seeded = True
            return

        for item in records:
            qid = item.get("id")
            if qid is None:
                continue
            qid = int(qid)
            snap = current[qid]
            if _is_failed(item) and qid not in self._seen_failed:
                self._seen_failed.add(qid)
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
        for qid in removed:
            prev = self._prev_queue[qid]
            if not prev.active or qid in self._seen_completed:
                continue
            if prev.had_file:
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

        if not self._health_events_seeded:
            self._active_health = current_keys
            self._seen_health.update(current_keys)
            self._health_events_seeded = True
            return

        cleared = self._active_health - current_keys
        for key in cleared:
            self._seen_health.discard(key)

        for item in health:
            if item.get("type") not in ("warning", "error"):
                continue
            key = _health_key(item)
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