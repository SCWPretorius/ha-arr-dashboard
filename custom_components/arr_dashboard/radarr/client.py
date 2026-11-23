"""Radarr-specific API client."""

from __future__ import annotations

from typing import Any

from ..core.client import (
    ArrClientBase,
    async_validate_arr_status,
    parse_arr_version,
)

MOVIE_ADDED = 1
EVENT_GRABBED = 1


def parse_radarr_version(version: str) -> tuple[int, ...]:
    """Parse Radarr version string into a tuple."""
    return parse_arr_version(version)


class RadarrClient(ArrClientBase):
    """Radarr REST client."""

    async def get_system_status(self) -> dict[str, Any]:
        return await self.get("/api/v3/system/status")

    async def validate_connection(self) -> dict[str, Any]:
        """Validate URL, auth, app name, and minimum version."""
        return await async_validate_arr_status(self, expected_app="Radarr")

    async def get_health(self) -> list[dict[str, Any]]:
        return await self.get("/api/v3/health")

    async def get_disk_space(self) -> list[dict[str, Any]]:
        return await self.get("/api/v3/diskspace")

    async def get_root_folders(self) -> list[dict[str, Any]]:
        return await self.get("/api/v3/rootfolder")

    async def get_quality_profiles(self) -> list[dict[str, Any]]:
        return await self.get("/api/v3/qualityprofile")

    async def get_movies(self) -> list[dict[str, Any]]:
        return await self.get("/api/v3/movie")

    async def get_movie(self, movie_id: int) -> dict[str, Any]:
        return await self.get(f"/api/v3/movie/{movie_id}")

    async def lookup(self, term: str) -> list[dict[str, Any]]:
        return await self.get("/api/v3/movie/lookup", params={"term": term})

    async def lookup_tmdb(self, tmdb_id: int) -> dict[str, Any]:
        return await self.get(f"/api/v3/movie/lookup/tmdb?tmdbId={tmdb_id}")

    async def add_movie(self, payload: dict[str, Any]) -> dict[str, Any]:
        return await self.post("/api/v3/movie", json=payload)

    async def update_movie(self, movie: dict[str, Any]) -> dict[str, Any]:
        return await self.put("/api/v3/movie", json=movie)

    async def delete_movie(
        self,
        movie_id: int,
        *,
        delete_files: bool = False,
        add_import_exclusion: bool = False,
    ) -> None:
        await self.delete(
            f"/api/v3/movie/{movie_id}",
            params={
                "deleteFiles": str(delete_files).lower(),
                "addImportExclusion": str(add_import_exclusion).lower(),
            },
        )

    async def get_queue(self) -> dict[str, Any]:
        page_size = 100
        page = 1
        all_records: list[dict[str, Any]] = []
        total = 0
        while True:
            chunk = await self.get(
                "/api/v3/queue",
                params={
                    "includeMovie": "true",
                    "page": page,
                    "pageSize": page_size,
                },
            )
            records = chunk.get("records") or []
            all_records.extend(records)
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

    async def release_search(self, movie_id: int) -> dict[str, Any]:
        return await self.post_command({"name": "MoviesSearch", "movieIds": [movie_id]})

    async def movie_search_manual(self, movie_id: int) -> list[dict[str, Any]]:
        return await self.get("/api/v3/release", params={"movieId": movie_id})

    async def grab_release(self, payload: dict[str, Any]) -> dict[str, Any]:
        return await self.post("/api/v3/release", json=payload)

    async def get_history_grabbed(self, movie_id: int) -> list[dict[str, Any]]:
        return await self.get(
            "/api/v3/history/movie",
            params={"movieId": movie_id, "eventType": str(EVENT_GRABBED)},
        )

    async def mark_history_failed(self, history_id: int) -> None:
        await self.post(f"/api/v3/history/failed/{history_id}")

    async def delete_movie_file(self, file_id: int) -> None:
        await self.delete(f"/api/v3/moviefile/{file_id}")

    async def retry_import(
        self,
        output_path: str,
        download_client_id: str,
    ) -> dict[str, Any]:
        return await self.post_command(
            {
                "name": "DownloadedMoviesScan",
                "path": output_path,
                "downloadClientId": download_client_id,
                "importMode": "Auto",
            }
        )
