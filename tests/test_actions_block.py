"""Delete/redownload blocklist behaviour."""

from __future__ import annotations

from unittest.mock import AsyncMock

from homeassistant.core import HomeAssistant

from custom_components.arr_dashboard.radarr.actions import async_delete_file_redownload
from custom_components.arr_dashboard.radarr.client import RadarrClient


async def test_block_skipped_without_grabbed_history(hass: HomeAssistant) -> None:
    client = RadarrClient(hass, "http://radarr.local:7878", "key", True)
    client.get_movie = AsyncMock(  # type: ignore[method-assign]
        return_value={"id": 5, "monitored": True, "movieFile": {"id": 12}}
    )
    client.get_history_grabbed = AsyncMock(return_value=[])  # type: ignore[method-assign]
    client.mark_history_failed = AsyncMock()  # type: ignore[method-assign]
    client.delete_movie_file = AsyncMock()  # type: ignore[method-assign]
    client.release_search = AsyncMock()  # type: ignore[method-assign]
    result = await async_delete_file_redownload(
        client, {"movie_id": 5, "block_release": True}
    )
    assert result["blocked_release"] is False
    client.mark_history_failed.assert_not_called()