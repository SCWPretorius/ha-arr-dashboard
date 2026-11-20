"""Radarr action helpers."""

from __future__ import annotations

import asyncio
from typing import Any

from .client import RadarrClient


async def async_add_movie(client: RadarrClient, data: dict[str, Any]) -> dict[str, Any]:
    """Add a movie from lookup payload."""
    payload = {
        "title": data["title"],
        "tmdbId": data["tmdbId"],
        "year": data.get("year"),
        "qualityProfileId": int(data["quality_profile_id"]),
        "rootFolderPath": data["root_folder_path"],
        "monitored": data.get("monitored", True),
        "minimumAvailability": data.get("minimum_availability", "released"),
        "addOptions": {
            "searchForMovie": bool(data.get("search_on_add", True)),
        },
    }
    if data.get("imdbId"):
        payload["imdbId"] = data["imdbId"]
    return await client.add_movie(payload)


async def async_retry_import(
    client: RadarrClient, data: dict[str, Any]
) -> dict[str, Any]:
    """Retry import for a queue item."""
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


async def async_delete_file_redownload(
    client: RadarrClient, data: dict[str, Any]
) -> dict[str, Any]:
    """Delete movie file, optionally blocklist, then search."""
    movie = await client.get_movie(int(data["movie_id"]))
    blocked = False
    if data.get("block_release"):
        history = await client.get_history_grabbed(movie["id"])
        if history:
            await client.mark_history_failed(history[0]["id"])
            blocked = True
    movie_file = movie.get("movieFile")
    if movie_file:
        await client.delete_movie_file(movie_file["id"])
    if not movie.get("monitored"):
        movie["monitored"] = True
        await client.update_movie(movie)
    await client.release_search(movie["id"])
    return {"blocked_release": blocked}