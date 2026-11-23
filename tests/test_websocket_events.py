"""Websocket command events (spec §12)."""

from __future__ import annotations

from unittest.mock import AsyncMock, MagicMock

import pytest

from custom_components.arr_dashboard.const import EVENT_MOVIE_ADDED


@pytest.mark.asyncio
async def test_add_movie_fires_arr_movie_added_once() -> None:
    from custom_components.arr_dashboard.websocket_api import _handle_command

    hass = MagicMock()
    fired: list[tuple[str, dict]] = []

    def _fire(event_type: str, data: dict) -> None:
        fired.append((event_type, data))

    hass.bus.async_fire = _fire  # type: ignore[method-assign]
    coordinator = MagicMock()
    coordinator.config_entry.title = "radarr"
    coordinator.async_request_refresh = AsyncMock()
    client = AsyncMock()
    client.lookup = AsyncMock(return_value=[])
    client.add_movie = AsyncMock(
        return_value={"title": "New", "year": 2024, "id": 9}
    )

    with pytest.MonkeyPatch.context() as mp:
        mp.setattr(
            "custom_components.arr_dashboard.websocket_api.async_add_movie",
            AsyncMock(return_value={"title": "New", "year": 2024}),
        )
        await _handle_command(hass, coordinator, client, "add_movie", {"title": "New"})

    assert len(fired) == 1
    assert fired[0][0] == EVENT_MOVIE_ADDED
    assert fired[0][1]["media_type"] == "movie"
    assert fired[0][1]["title"] == "New"