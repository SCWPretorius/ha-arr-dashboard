"""Unreachable state survives coordinator refresh failures."""

from __future__ import annotations

from unittest.mock import AsyncMock

from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.arr_dashboard.core.client import ArrCannotConnect
from custom_components.arr_dashboard.radarr.client import RadarrClient
from custom_components.arr_dashboard.radarr.coordinator import (
    RadarrDataUpdateCoordinator,
)
from custom_components.arr_dashboard.websocket_api import _handle_command


async def test_unreachable_persisted_in_data(
    hass: HomeAssistant, radarr_config: dict
) -> None:
    client = RadarrClient(hass, radarr_config["url"], radarr_config["api_key"], True)
    entry = MockConfigEntry(domain="arr_dashboard", data=radarr_config, title="Radarr")
    entry.add_to_hass(hass)
    coord = RadarrDataUpdateCoordinator(hass, client, entry)
    coord.data.movies = [{"id": 1, "title": "Cached", "hasFile": True}]
    client.get_movies = AsyncMock(side_effect=ArrCannotConnect("down"))  # type: ignore[method-assign]
    data = await coord._async_update_data()
    assert data.reachable is False
    assert data.movies[0]["title"] == "Cached"


async def test_get_state_reports_unreachable(
    hass: HomeAssistant, radarr_config: dict
) -> None:
    client = RadarrClient(hass, radarr_config["url"], radarr_config["api_key"], True)
    entry = MockConfigEntry(domain="arr_dashboard", data=radarr_config, title="Radarr")
    entry.add_to_hass(hass)
    coord = RadarrDataUpdateCoordinator(hass, client, entry)
    coord.data.reachable = False
    coord.data.movies = []
    result = await _handle_command(hass, coord, client, "get_state", {})
    assert result["reachable"] is False