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
def expected_lingering_threads():
    """HTTP shutdown helpers during tests."""
    return True




@pytest.fixture
def radarr_config() -> dict:
    return {
        "url": "http://radarr.local:7878",
        "api_key": "test-api-key",
        "verify_ssl": True,
        "name": "Radarr",
    }


def _mock_radarr_poll(aioclient_mock, base: str = "http://radarr.local:7878") -> None:
    aioclient_mock.get(f"{base}/api/v3/system/status", json={"version": "5.0.0.0"})
    aioclient_mock.get(f"{base}/api/v3/movie", json=[])
    aioclient_mock.get(
        f"{base}/api/v3/queue?includeMovie=true&page=1&pageSize=100",
        json={"records": [], "totalRecords": 0},
    )
    aioclient_mock.get(f"{base}/api/v3/health", json=[])
    aioclient_mock.get(
        f"{base}/api/v3/diskspace",
        json=[{"path": "/movies", "freeSpace": 100e9, "totalSpace": 1e12}],
    )
    aioclient_mock.get(
        f"{base}/api/v3/rootfolder",
        json=[{"id": 1, "path": "/movies", "freeSpace": 100e9}],
    )
    aioclient_mock.get(
        f"{base}/api/v3/qualityprofile",
        json=[{"id": 1, "name": "HD-1080p"}],
    )


@pytest.fixture
async def integration_setup(
    hass: HomeAssistant,
    radarr_config: dict,
    aioclient_mock,
) -> MockConfigEntry:
    _mock_radarr_poll(aioclient_mock)

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
    data = hass.data.get(DOMAIN, {}).get(entry.entry_id)
    if data and (coord := data.get("coordinator")):
        unsub = getattr(coord, "_unsub_refresh", None)
        if callable(unsub):
            unsub()
    await hass.config_entries.async_unload(entry.entry_id)
    await hass.async_block_till_done()