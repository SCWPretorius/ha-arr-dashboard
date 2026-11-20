"""Action and websocket behaviour tests."""

from __future__ import annotations

from unittest.mock import AsyncMock, patch

from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.arr_dashboard.const import DOMAIN, EVENT_DOWNLOAD_FAILED
from custom_components.arr_dashboard.radarr.actions import (
    async_delete_file_redownload,
    async_retry_import,
)
from custom_components.arr_dashboard.radarr.client import RadarrClient
from custom_components.arr_dashboard.radarr.coordinator import (
    RadarrDataUpdateCoordinator,
)


async def test_remove_movie_delete_files_default_false(hass: HomeAssistant) -> None:
    client = RadarrClient(hass, "http://radarr.local:7878", "key", True)
    captured: list[dict] = []

    async def fake_delete(path: str, *, params: dict | None = None):
        captured.append(params or {})

    client.delete = fake_delete  # type: ignore[method-assign]
    await client.delete_movie(7, delete_files=False)
    assert captured[0]["deleteFiles"] == "false"
    assert captured[0]["addImportExclusion"] == "false"


async def test_retry_import_command(hass: HomeAssistant) -> None:
    client = RadarrClient(hass, "http://radarr.local:7878", "key", True)
    client.post_command = AsyncMock(return_value={"id": 99, "status": "queued"})  # type: ignore[method-assign]
    client.get_command = AsyncMock(  # type: ignore[method-assign]
        return_value={"id": 99, "status": "completed"}
    )
    with patch("asyncio.sleep", new_callable=AsyncMock):
        result = await async_retry_import(
            client,
            {
                "output_path": "/downloads/movie",
                "download_client_id": "sab-1",
            },
        )
    assert result["ok"] is True


async def test_retry_import_no_path(hass: HomeAssistant) -> None:
    client = RadarrClient(hass, "http://radarr.local:7878", "key", True)
    result = await async_retry_import(client, {})
    assert result["error"] == "no_path"


async def test_blocklist_delete_redownload_with_grabbed(hass: HomeAssistant) -> None:
    client = RadarrClient(hass, "http://radarr.local:7878", "key", True)
    client.get_movie = AsyncMock(  # type: ignore[method-assign]
        return_value={"id": 5, "monitored": True, "movieFile": {"id": 12}}
    )
    client.get_history_grabbed = AsyncMock(return_value=[{"id": 44}])  # type: ignore[method-assign]
    client.mark_history_failed = AsyncMock()  # type: ignore[method-assign]
    client.delete_movie_file = AsyncMock()  # type: ignore[method-assign]
    client.release_search = AsyncMock()  # type: ignore[method-assign]
    await async_delete_file_redownload(
        client, {"movie_id": 5, "block_release": True}
    )
    client.mark_history_failed.assert_awaited_once_with(44)


async def test_blocklist_without_grabbed(hass: HomeAssistant) -> None:
    client = RadarrClient(hass, "http://radarr.local:7878", "key", True)
    client.get_movie = AsyncMock(  # type: ignore[method-assign]
        return_value={"id": 5, "monitored": False, "movieFile": {"id": 12}}
    )
    client.get_history_grabbed = AsyncMock(return_value=[])  # type: ignore[method-assign]
    client.mark_history_failed = AsyncMock()  # type: ignore[method-assign]
    client.delete_movie_file = AsyncMock()  # type: ignore[method-assign]
    client.update_movie = AsyncMock()  # type: ignore[method-assign]
    client.release_search = AsyncMock()  # type: ignore[method-assign]
    await async_delete_file_redownload(
        client, {"movie_id": 5, "block_release": True}
    )
    client.mark_history_failed.assert_not_called()


async def test_download_failed_event(hass: HomeAssistant, radarr_config: dict) -> None:
    client = RadarrClient(hass, radarr_config["url"], radarr_config["api_key"], True)
    entry = MockConfigEntry(domain=DOMAIN, data=radarr_config, title="Radarr")
    entry.add_to_hass(hass)
    coord = RadarrDataUpdateCoordinator(hass, client, entry)
    coord._seen_failed.clear()
    await coord._detect_failed_downloads(
        [
            {
                "id": 101,
                "status": "failed",
                "movie": {"title": "Bad Movie", "year": 2020},
                "quality": {"quality": {"name": "1080p"}},
            }
        ]
    )
    assert 101 in coord._seen_failed
    assert EVENT_DOWNLOAD_FAILED == "arr_dashboard_download_failed"