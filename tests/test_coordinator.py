"""Coordinator tests."""

from __future__ import annotations

from unittest.mock import AsyncMock

from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.arr_dashboard.const import DOMAIN
from custom_components.arr_dashboard.radarr.client import RadarrClient
from custom_components.arr_dashboard.radarr.coordinator import (
    RadarrDataUpdateCoordinator,
)


async def test_coordinator_loads_data(
    hass: HomeAssistant, radarr_config: dict
) -> None:
    client = RadarrClient(
        hass, radarr_config["url"], radarr_config["api_key"], True
    )
    client.get_system_status = AsyncMock(return_value={"version": "5.0.0.0"})
    client.get_movies = AsyncMock(return_value=[])
    client.get_queue = AsyncMock(return_value={"records": [], "totalRecords": 0})
    client.get_health = AsyncMock(return_value=[])
    client.get_disk_space = AsyncMock(
        return_value=[{"path": "/movies", "freeSpace": 1, "totalSpace": 1}]
    )
    client.get_root_folders = AsyncMock(
        return_value=[{"id": 1, "path": "/movies", "freeSpace": 1}]
    )
    client.get_quality_profiles = AsyncMock(return_value=[{"id": 1, "name": "HD"}])
    entry = MockConfigEntry(
        domain=DOMAIN, data=radarr_config, title="Radarr", entry_id="test-coord"
    )
    entry.add_to_hass(hass)
    coord = RadarrDataUpdateCoordinator(hass, client, entry)
    await coord.async_request_refresh()
    assert coord.data.reachable
    assert coord.data.queue_count == 0
    assert len(coord.data.quality_profiles) == 1