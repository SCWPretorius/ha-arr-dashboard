"""Sonarr data update coordinator."""

from __future__ import annotations

import logging
from dataclasses import dataclass, field
from datetime import UTC, datetime
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed

from ..const import (
    APP_SONARR,
    DOMAIN,
    EVENT_DOWNLOAD_COMPLETED,
    EVENT_DOWNLOAD_FAILED,
    EVENT_HEALTH_ISSUE,
)
from ..core.client import ArrCannotConnect, ArrClientError, ArrInvalidAuth
from ..core.events import series_event_base
from .client import SonarrClient

_LOGGER = logging.getLogger(__name__)

UPCOMING_DAYS = 30


@dataclass
class SonarrDashboardData:
    """Coordinator data payload for a Sonarr entry."""

    app: str = APP_SONARR
    series: list[dict[str, Any]] = field(default_factory=list)
    upcoming: list[dict[str, Any]] = field(default_factory=list)
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
    series_id: int | None
    title: str | None
    year: int | None
    season: int | None
    episode: int | None
    episode_title: str | None
    quality: str | None
    size: int | None
    active: bool
    had_file: bool


def _remote_tile_poster(url: str | None) -> str | None:
    """Use a smaller TMDb profile when Sonarr sends an original-size URL."""
    if not url or not url.startswith("https://image.tmdb.org/t/p/"):
        return url
    rest = url.removeprefix("https://image.tmdb.org/t/p/")
    if "/" not in rest:
        return url
    _size, path = rest.split("/", 1)
    return f"https://image.tmdb.org/t/p/w185/{path}"


def _count(value: Any, fallback: int = 0) -> int:
    try:
        return int(value)
    except (TypeError, ValueError):
        return fallback


def _slim_seasons(series: dict[str, Any]) -> list[dict[str, Any]]:
    seasons: list[dict[str, Any]] = []
    for season in series.get("seasons") or []:
        number = season.get("seasonNumber")
        if number is None:
            continue
        stats = season.get("statistics") or {}
        episode_count = stats.get("totalEpisodeCount", stats.get("episodeCount"))
        seasons.append(
            {
                "seasonNumber": number,
                "monitored": season.get("monitored"),
                "episodeCount": _count(episode_count),
                "episodeFileCount": _count(stats.get("episodeFileCount")),
            }
        )
    return seasons


def slim_series(series: dict[str, Any], entry_id: str) -> dict[str, Any]:
    """Slim a Sonarr series resource for the card."""
    images = series.get("images") or []
    remote_poster = None
    for img in images:
        if img.get("coverType") == "poster" and img.get("remoteUrl"):
            remote_poster = img["remoteUrl"]
            break
    raw_poster = remote_poster or (
        f"/api/arr_dashboard/{entry_id}/poster/{series['id']}"
    )
    poster = _remote_tile_poster(raw_poster) or raw_poster
    stats = series.get("statistics") or {}
    episode_file_count = _count(
        series.get("episodeFileCount", stats.get("episodeFileCount"))
    )
    episode_count = _count(
        series.get("episodeCount")
        or stats.get("totalEpisodeCount")
        or stats.get("episodeCount")
    )
    season_count = _count(
        series.get("seasonCount")
        or stats.get("seasonCount")
        or len(series.get("seasons") or [])
    )
    return {
        "id": series["id"],
        "title": series.get("title"),
        "year": series.get("year"),
        "tvdbId": series.get("tvdbId"),
        "network": series.get("network"),
        "status": series.get("status"),
        "seasonCount": season_count,
        "episodeCount": episode_count,
        "episodeFileCount": episode_file_count,
        "hasFile": episode_file_count > 0,
        "monitored": series.get("monitored"),
        "added": series.get("added"),
        "poster": poster,
        "posterUrl": poster,
        "qualityProfileId": series.get("qualityProfileId"),
        "path": series.get("path"),
        "overview": series.get("overview"),
        "seasons": _slim_seasons(series),
    }


def slim_calendar_episode(episode: dict[str, Any]) -> dict[str, Any]:
    """Slim a calendar episode for the Add tab."""
    series = episode.get("series") if isinstance(episode.get("series"), dict) else {}
    return {
        "id": episode.get("id"),
        "seriesId": episode.get("seriesId") or series.get("id"),
        "seriesTitle": series.get("title") or "",
        "seasonNumber": episode.get("seasonNumber"),
        "episodeNumber": episode.get("episodeNumber"),
        "title": episode.get("title") or "",
        "airDateUtc": episode.get("airDateUtc") or episode.get("airDate"),
        "hasFile": episode.get("hasFile"),
        "monitored": episode.get("monitored"),
    }


def _queue_snap(item: dict[str, Any]) -> _QueueSnap:
    series = item.get("series") if isinstance(item.get("series"), dict) else {}
    episode = item.get("episode") if isinstance(item.get("episode"), dict) else {}
    status = (item.get("status") or "").lower()
    tracked = (
        item.get("trackedDownloadState") or item.get("trackedDownloadStatus") or ""
    ).lower()
    active = status in {"downloading", "queued", "warning"} or tracked in {
        "importing",
        "importpending",
        "importblocked",
    }
    quality = (item.get("quality") or {}).get("quality", {}).get("name")
    series_id = series.get("id", item.get("seriesId"))
    season = item.get("seasonNumber", episode.get("seasonNumber"))
    episode_number = item.get("episodeNumber", episode.get("episodeNumber"))
    return _QueueSnap(
        queue_id=int(item["id"]),
        series_id=int(series_id) if series_id is not None else None,
        title=series.get("title"),
        year=series.get("year"),
        season=int(season) if season is not None else None,
        episode=int(episode_number) if episode_number is not None else None,
        episode_title=episode.get("title"),
        quality=quality,
        size=item.get("size"),
        active=active,
        had_file=bool(episode.get("hasFile")),
    )


def _is_failed(item: dict[str, Any]) -> bool:
    status = (item.get("status") or "").lower()
    tracked = (
        item.get("trackedDownloadState") or item.get("trackedDownloadStatus") or ""
    ).lower()
    return status == "failed" or tracked in ("failed", "failedpending")


def _health_key(item: dict[str, Any]) -> str:
    return f"{item.get('source', '')}:{item.get('message', '')}"


def _file_counts(series: list[dict[str, Any]]) -> dict[int, int]:
    counts: dict[int, int] = {}
    for item in series:
        series_id = item.get("id")
        if series_id is None:
            continue
        counts[int(series_id)] = _count(item.get("episodeFileCount"))
    return counts


class SonarrDataUpdateCoordinator(DataUpdateCoordinator[SonarrDashboardData]):
    """Poll Sonarr for library, queue, calendar, and system data."""

    config_entry: ConfigEntry

    def __init__(
        self,
        hass: HomeAssistant,
        client: SonarrClient,
        entry: ConfigEntry,
    ) -> None:
        self.client = client
        self._seen_failed: set[int] = set()
        self._seen_completed: set[int] = set()
        self._seen_health: set[str] = set()
        self._prev_queue: dict[int, _QueueSnap] = {}
        self._prev_file_counts: dict[int, int] = {}
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
        self.data = SonarrDashboardData()

    async def _async_update_data(self) -> SonarrDashboardData:
        data = SonarrDashboardData()
        try:
            series_raw = await self.client.get_series_list()
            queue = await self.client.get_queue()
            health = await self.client.get_health()
            disk = await self.client.get_disk_space()
            system = await self.client.get_system_status()
            roots = await self.client.get_root_folders()
            profiles = await self.client.get_quality_profiles()
            calendar = await self.client.get_calendar(days=UPCOMING_DAYS)

            data.series = [
                slim_series(item, self.config_entry.entry_id) for item in series_raw
            ]
            data.upcoming = sorted(
                (slim_calendar_episode(item) for item in calendar),
                key=lambda episode: episode.get("airDateUtc") or "",
            )
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
            self._process_queue_events(records, data.series)
            self._process_health_events(health)
        except ArrInvalidAuth as err:
            self.config_entry.async_start_reauth(self.hass)
            raise UpdateFailed("Authentication failed") from err
        except (ArrCannotConnect, ArrClientError):
            previous = self.data or SonarrDashboardData()
            data.reachable = False
            data.series = previous.series
            data.upcoming = previous.upcoming
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
        series: list[dict[str, Any]],
    ) -> None:
        current: dict[int, _QueueSnap] = {}
        for item in records:
            queue_id = item.get("id")
            if queue_id is None:
                continue
            current[int(queue_id)] = _queue_snap(item)
        file_counts = _file_counts(series)

        if not self._queue_events_seeded:
            for queue_id, _snap in current.items():
                item = next(
                    (row for row in records if int(row["id"]) == queue_id), None
                )
                if item and _is_failed(item):
                    self._seen_failed.add(queue_id)
            self._prev_queue = current
            self._prev_file_counts = file_counts
            self._queue_events_seeded = True
            return

        for item in records:
            queue_id = item.get("id")
            if queue_id is None:
                continue
            queue_id = int(queue_id)
            snap = current[queue_id]
            if _is_failed(item) and queue_id not in self._seen_failed:
                self._seen_failed.add(queue_id)
                reason = item.get("statusMessages") or item.get("errorMessage")
                if isinstance(reason, list):
                    reason = ", ".join(str(part) for part in reason)
                self._fire(
                    EVENT_DOWNLOAD_FAILED,
                    series_event_base(
                        self.config_entry.title,
                        snap.title,
                        snap.year,
                        season=snap.season,
                        episode=snap.episode,
                        episode_title=snap.episode_title,
                        quality=snap.quality,
                        size=snap.size,
                        reason=str(reason) if reason else None,
                    ),
                )

        gained = {
            series_id: max(
                0,
                file_counts.get(series_id, 0)
                - self._prev_file_counts.get(series_id, 0),
            )
            for series_id in set(file_counts) | set(self._prev_file_counts)
        }
        removed = set(self._prev_queue) - set(current)
        for queue_id in removed:
            prev = self._prev_queue[queue_id]
            if not prev.active or queue_id in self._seen_completed or prev.had_file:
                continue
            series_id = prev.series_id or 0
            if gained.get(series_id, 0) <= 0:
                continue
            gained[series_id] -= 1
            self._seen_completed.add(queue_id)
            self._fire(
                EVENT_DOWNLOAD_COMPLETED,
                series_event_base(
                    self.config_entry.title,
                    prev.title,
                    prev.year,
                    season=prev.season,
                    episode=prev.episode,
                    episode_title=prev.episode_title,
                    quality=prev.quality,
                    size=prev.size,
                ),
            )

        self._prev_queue = current
        self._prev_file_counts = file_counts

    def _process_health_events(self, health: list[dict[str, Any]]) -> None:
        current_keys: set[str] = set()
        for item in health:
            if item.get("type") not in ("warning", "error"):
                continue
            current_keys.add(_health_key(item))

        if not self._health_events_seeded:
            self._active_health = current_keys
            self._seen_health.update(current_keys)
            self._health_events_seeded = True
            return

        for key in self._active_health - current_keys:
            self._seen_health.discard(key)

        for item in health:
            if item.get("type") not in ("warning", "error"):
                continue
            key = _health_key(item)
            if key not in self._active_health and key not in self._seen_health:
                self._seen_health.add(key)
                self._fire(
                    EVENT_HEALTH_ISSUE,
                    series_event_base(
                        self.config_entry.title,
                        item.get("source"),
                        None,
                        reason=item.get("message"),
                    ),
                )
        self._active_health = current_keys
