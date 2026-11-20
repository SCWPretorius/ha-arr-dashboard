"""Websocket get_state scopes."""

from __future__ import annotations

from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.arr_dashboard.radarr.client import RadarrClient
from custom_components.arr_dashboard.radarr.coordinator import (
    RadarrDataUpdateCoordinator,
)
from custom_components.arr_dashboard.websocket_api import _handle_command


async def test_get_state_queue_scope_omits_movies(
    hass: HomeAssistant, radarr_config: dict
) -> None:
    client = RadarrClient(hass, radarr_config["url"], radarr_config["api_key"], True)
    entry = MockConfigEntry(domain="arr_dashboard", data=radarr_config, title="Radarr")
    entry.add_to_hass(hass)
    coord = RadarrDataUpdateCoordinator(hass, client, entry)
    coord.data.movies = [{"id": 1, "title": "X"}]
    coord.data.queue = {"records": [{"id": 1}], "totalRecords": 1}
    coord.data.queue_count = 1
    result = await _handle_command(hass, coord, client, "get_state", {"scope": "queue"})
    assert "movies" not in result
    assert result["queue_count"] == 1