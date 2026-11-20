"""Pytest fixtures for Arr Dashboard tests."""

from __future__ import annotations

import pytest
from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.arr_dashboard.const import DOMAIN

pytest_plugins = "pytest_homeassistant_custom_component"


@pytest.fixture(autouse=True)
def auto_enable_custom_integrations(enable_custom_integrations):
    """Enable custom integrations for all tests."""
    return


@pytest.fixture
def expected_lingering_timers():
    """Polling coordinators and HTTP client shutdown."""
    return True


@pytest.fixture
def expected_lingering_tasks():
    """Background coordinator tasks during tests."""
    return True




@pytest.fixture
def aioresponses():
    from aioresponses import aioresponses as m

    with m() as mocked:
        yield mocked


@pytest.fixture
def radarr_config() -> dict:
    return {
        "url": "http://radarr.local:7878",
        "api_key": "test-api-key",
        "verify_ssl": True,
        "name": "Radarr",
    }


@pytest.fixture
async def integration_setup(
    hass: HomeAssistant,
    radarr_config: dict,
    aioresponses,
) -> MockConfigEntry:
    aioresponses.get(
        "http://radarr.local:7878/api/v3/system/status",
        payload={"version": "5.0.0.0"},
        repeat=True,
    )
    aioresponses.get(
        "http://radarr.local:7878/api/v3/movie",
        payload=[],
        repeat=True,
    )
    aioresponses.get(
        "http://radarr.local:7878/api/v3/queue?includeMovie=true",
        payload={"records": [], "totalRecords": 0},
        repeat=True,
    )
    aioresponses.get(
        "http://radarr.local:7878/api/v3/health",
        payload=[],
        repeat=True,
    )
    aioresponses.get(
        "http://radarr.local:7878/api/v3/diskspace",
        payload=[{"path": "/movies", "freeSpace": 100e9, "totalSpace": 1e12}],
        repeat=True,
    )
    aioresponses.get(
        "http://radarr.local:7878/api/v3/rootfolder",
        payload=[{"id": 1, "path": "/movies", "freeSpace": 100e9}],
        repeat=True,
    )
    aioresponses.get(
        "http://radarr.local:7878/api/v3/qualityprofile",
        payload=[{"id": 1, "name": "HD-1080p"}],
        repeat=True,
    )

    entry = MockConfigEntry(
        domain=DOMAIN,
        data=radarr_config,
        title="Radarr",
        unique_id="http://radarr.local:7878",
    )
    entry.add_to_hass(hass)
    from custom_components.arr_dashboard import async_setup

    assert await async_setup(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    yield entry
    await hass.config_entries.async_unload(entry.entry_id)
    await hass.async_block_till_done()