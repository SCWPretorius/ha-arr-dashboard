"""Sonarr-specific API client."""

from __future__ import annotations

from datetime import UTC, datetime, timedelta
from typing import Any

from ..core.client import ArrClientBase, ArrNotFound, async_validate_arr_status

MONITOR_OPTIONS = (
    "all",
    "future",
    "missing",
    "existing",
    "firstSeason",
    "latestSeason",
    "none",
)


def _with_queue_fields(item: dict[str, Any]) -> dict[str, Any]:
    """Keep Sonarr queue objects and fill season/episode numbers the card reads."""
    episode = item.get("episode") if isinstance(item.get("episode"), dict) else {}
    row = dict(item)
    if row.get("seasonNumber") is None and episode.get("seasonNumber") is not None:
        row["seasonNumber"] = episode.get("seasonNumber")
    if row.get("episodeNumber") is None and episode.get("episodeNumber") is not None:
        row["episodeNumber"] = episode.get("episodeNumber")
    return row


class SonarrClient(ArrClientBase):
    """Sonarr REST client (v4, /api/v3)."""

    async def get_system_status(self) -> dict[str, Any]:
        return await self.get("/api/v3/system/status")

    async def validate_connection(self) -> dict[str, Any]:
        """Validate URL, auth, app name, and minimum version."""
        return await async_validate_arr_status(self, expected_app="Sonarr")

    async def get_health(self) -> list[dict[str, Any]]:
        return await self.get("/api/v3/health")

    async def get_disk_space(self) -> list[dict[str, Any]]:
        return await self.get("/api/v3/diskspace")

    async def get_root_folders(self) -> list[dict[str, Any]]:
        return await self.get("/api/v3/rootfolder")

    async def get_quality_profiles(self) -> list[dict[str, Any]]:
        return await self.get("/api/v3/qualityprofile")

    async def get_series_list(self) -> list[dict[str, Any]]:
        return await self.get("/api/v3/series")

    async def get_series(self, series_id: int) -> dict[str, Any]:
        return await self.get(f"/api/v3/series/{series_id}")

    async def lookup(self, term: str) -> list[dict[str, Any]]:
        return await self.get("/api/v3/series/lookup", params={"term": term})

    async def add_series(self, payload: dict[str, Any]) -> dict[str, Any]:
        return await self.post("/api/v3/series", json=payload)

    async def update_series(self, series: dict[str, Any]) -> dict[str, Any]:
        series_id = int(series["id"])
        return await self.put(f"/api/v3/series/{series_id}", json=series)

    async def delete_series(
        self,
        series_id: int,
        *,
        delete_files: bool = False,
        add_import_exclusion: bool = False,
    ) -> None:
        await self.delete(
            f"/api/v3/series/{series_id}",
            params={
                "deleteFiles": str(delete_files).lower(),
                "addImportExclusion": str(add_import_exclusion).lower(),
            },
        )

    async def get_calendar(self, *, days: int) -> list[dict[str, Any]]:
        start = datetime.now(UTC).date()
        end = start + timedelta(days=days)
        result = await self.get(
            "/api/v3/calendar",
            params={
                "start": start.isoformat(),
                "end": end.isoformat(),
                "unmonitored": "true",
                "includeSeries": "true",
            },
        )
        if not isinstance(result, list):
            return []
        return result

    async def get_queue(self) -> dict[str, Any]:
        page_size = 100
        page = 1
        all_records: list[dict[str, Any]] = []
        total = 0
        while True:
            chunk = await self.get(
                "/api/v3/queue",
                params={
                    "includeSeries": "true",
                    "includeEpisode": "true",
                    "page": page,
                    "pageSize": page_size,
                },
            )
            if isinstance(chunk, list):
                records = [_with_queue_fields(item) for item in chunk]
                return {"records": records, "totalRecords": len(records)}
            records = chunk.get("records") or []
            all_records.extend(_with_queue_fields(item) for item in records)
            total = int(chunk.get("totalRecords") or len(all_records))
            if len(all_records) >= total or not records:
                break
            page += 1
        return {"records": all_records, "totalRecords": total}

    async def remove_queue_item(
        self,
        queue_id: int,
        *,
        remove_from_client: bool = True,
        blocklist: bool = False,
        skip_redownload: bool = True,
    ) -> None:
        await self.delete(
            f"/api/v3/queue/{queue_id}",
            params={
                "removeFromClient": str(remove_from_client).lower(),
                "blocklist": str(blocklist).lower(),
                "skipRedownload": str(skip_redownload).lower(),
            },
        )

    async def post_command(self, body: dict[str, Any]) -> dict[str, Any]:
        return await self.post("/api/v3/command", json=body)

    async def get_command(self, command_id: int) -> dict[str, Any]:
        return await self.get(f"/api/v3/command/{command_id}")

    async def series_search(self, series_id: int) -> dict[str, Any]:
        return await self.post_command({"name": "SeriesSearch", "seriesId": series_id})

    async def season_search(self, series_id: int, season_number: int) -> dict[str, Any]:
        return await self.post_command(
            {
                "name": "SeasonSearch",
                "seriesId": series_id,
                "seasonNumber": season_number,
            }
        )

    async def get_episodes(self, series_id: int) -> list[dict[str, Any]]:
        result = await self.get("/api/v3/episode", params={"seriesId": series_id})
        if not isinstance(result, list):
            return []
        return result

    async def episode_releases(self, episode_id: int) -> list[dict[str, Any]]:
        """Interactive search. Sonarr requires an episode id, not a series id."""
        return await self.get("/api/v3/release", params={"episodeId": episode_id})

    async def grab_release(self, payload: dict[str, Any]) -> dict[str, Any]:
        return await self.post("/api/v3/release", json=payload)

    async def retry_import(
        self,
        output_path: str,
        download_client_id: str,
    ) -> dict[str, Any]:
        return await self.post_command(
            {
                "name": "DownloadedEpisodesScan",
                "path": output_path,
                "downloadClientId": download_client_id,
                "importMode": "Auto",
            }
        )

    async def set_season_monitored(
        self,
        series_id: int,
        season_number: int,
        monitored: bool,
    ) -> dict[str, Any]:
        series = await self.get_series(series_id)
        found = False
        for season in series.get("seasons") or []:
            if season.get("seasonNumber") == season_number:
                season["monitored"] = monitored
                found = True
                break
        if not found:
            raise ArrNotFound
        return await self.update_series(series)
