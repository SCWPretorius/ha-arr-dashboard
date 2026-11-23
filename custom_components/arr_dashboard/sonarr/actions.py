"""Sonarr action helpers."""

from __future__ import annotations

import asyncio
from typing import Any

from ..core.client import ArrClientError
from .client import MONITOR_OPTIONS, SonarrClient


async def async_add_series(
    client: SonarrClient, data: dict[str, Any]
) -> dict[str, Any]:
    """Add a series from a lookup payload."""
    monitor = data.get("monitor", "all")
    if monitor not in MONITOR_OPTIONS:
        raise ArrClientError(f"Unsupported monitor option: {monitor}")
    search = data.get("search_on_add", data.get("search_for_missing", True))
    payload: dict[str, Any] = {
        "title": data["title"],
        "tvdbId": int(data["tvdbId"]),
        "qualityProfileId": int(data["quality_profile_id"]),
        "rootFolderPath": data["root_folder_path"],
        "seasonFolder": True,
        "monitored": monitor != "none",
        "addOptions": {
            "monitor": monitor,
            "searchForMissingEpisodes": bool(search),
        },
    }
    if data.get("year") is not None:
        payload["year"] = data["year"]
    if data.get("imdbId"):
        payload["imdbId"] = data["imdbId"]
    return await client.add_series(payload)


async def async_retry_import(
    client: SonarrClient, data: dict[str, Any]
) -> dict[str, Any]:
    """Retry import for a queue item via DownloadedEpisodesScan."""
    output_path = data.get("output_path")
    download_id = data.get("download_client_id")
    if not output_path or not download_id:
        return {"error": "no_path", "message": "Missing output path for retry"}
    cmd = await client.retry_import(output_path, download_id)
    command_id = cmd.get("id")
    for _ in range(30):
        await asyncio.sleep(1)
        status = await client.get_command(command_id)
        if status.get("status") == "completed":
            break
    return {"command": cmd, "ok": True}
