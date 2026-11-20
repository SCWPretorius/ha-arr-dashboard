"""WebSocket command tests."""

from __future__ import annotations

from unittest.mock import AsyncMock, patch

from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.arr_dashboard.const import DOMAIN, EVENT_MOVIE_ADDED
from custom_components.arr_dashboard.radarr.client import RadarrClient
from custom_components.arr_dashboard.radarr.coordinator import RadarrDataUpdateCoordinator


async def test_add_movie_fires_event_once(hass: HomeAssistant, radarr_config: dict) -> None:
    client = RadarrClient(hass, radarr_config["url"], radarr_config["api_key"], True)
    entry = MockConfigEntry(domain=DOMAIN, data=radarr_config, title="Radarr")
    entry.add_to_hass(hass)
    coord = RadarrDataUpdateCoordinator(hass, client, entry)
    hass.data.setdefault(DOMAIN, {})[entry.entry_id] = {
        "client": client,
        "coordinator": coord,
    }
    coord.async_request_refresh = AsyncMock()

    with (
        patch.object(hass.bus, "async_fire") as fire_mock,
        patch(
            "custom_components.arr_dashboard.radarr.actions.async_add_movie",
            new_callable=AsyncMock,
            return_value={"title": "Inception", "year": 2010},
        ),
    ):
        from custom_components.arr_dashboard.websocket_api import _handle_command

        await _handle_command(
            hass,
            coord,
            client,
            "add_movie",
            {
                "title": "Inception",
                "year": 2010,
                "tmdbId": 1,
                "quality_profile_id": 1,
                "root_folder_path": "/movies",
            },
        )

    fire_mock.assert_called_once()
    assert fire_mock.call_args.args[0] == EVENT_MOVIE_ADDED