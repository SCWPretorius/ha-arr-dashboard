"""Radarr data update coordinator."""

from __future__ import annotations

import logging
from dataclasses import dataclass, field
from datetime import UTC, datetime
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed

from ..const import DOMAIN, EVENT_DOWNLOAD_FAILED, MEDIA_TYPE_MOVIE
from ..core.client import ArrCannotConnect, ArrClientError, ArrInvalidAuth
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
    }


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
            await self._detect_failed_downloads(records)
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

    async def _detect_failed_downloads(self, records: list[dict[str, Any]]) -> None:
        for item in records:
            status = item.get("status")
            tracked = (
                item.get("trackedDownloadState")
                or item.get("trackedDownloadStatus")
                or ""
            ).lower()
            qid = item.get("id")
            if qid is None:
                continue
            failed = status == "failed" or tracked in (
                "failed",
                "failedpending",
            )
            if not failed or qid in self._seen_failed:
                continue
            self._seen_failed.add(qid)
            movie = item.get("movie") or {}
            self.hass.bus.async_fire(
                EVENT_DOWNLOAD_FAILED,
                {
                    "instance": self.config_entry.title,
                    "entry_id": self.config_entry.entry_id,
                    "media_type": MEDIA_TYPE_MOVIE,
                    "title": movie.get("title"),
                    "year": movie.get("year"),
                    "quality": (item.get("quality") or {}).get("quality", {}).get(
                        "name"
                    ),
                    "reason": item.get("statusMessages") or item.get("errorMessage"),
                },
            )

    async def async_request_refresh_movies(self) -> None:
        await self.async_request_refresh()