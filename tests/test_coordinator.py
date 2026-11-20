"""Coordinator tests."""

from __future__ import annotations

from homeassistant.core import HomeAssistant

from custom_components.arr_dashboard.const import DOMAIN


async def test_coordinator_loads_data(
    hass: HomeAssistant, integration_setup, aioresponses
) -> None:
    entry = integration_setup
    coord = hass.data[DOMAIN][entry.entry_id]["coordinator"]
    assert coord.data.reachable
    assert coord.data.queue_count == 0
    assert len(coord.data.quality_profiles) == 1