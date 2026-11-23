"""Websocket scope for Sonarr commands."""

from __future__ import annotations

from unittest.mock import AsyncMock, MagicMock

import pytest
from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.arr_dashboard.const import DOMAIN, EVENT_MOVIE_ADDED
from custom_components.arr_dashboard.radarr.client import RadarrClient
from custom_components.arr_dashboard.radarr.coordinator import (
    RadarrDataUpdateCoordinator,
)
from custom_components.arr_dashboard.websocket_api import (
    _handle_command,
    list_arr_instances,
)


async def test_series_commands_rejected_on_radarr(
    hass: HomeAssistant, radarr_config: dict
) -> None:
    client = RadarrClient(hass, radarr_config["url"], radarr_config["api_key"], True)
    entry = MockConfigEntry(domain=DOMAIN, data=radarr_config, title="Radarr")
    entry.add_to_hass(hass)
    coord = RadarrDataUpdateCoordinator(hass, client, entry)
    with pytest.raises(ValueError, match="Sonarr"):
        await _handle_command(hass, coord, client, "add_series", {"title": "Show"})


async def test_movie_commands_still_work_on_radarr() -> None:
    hass = MagicMock()
    coordinator = MagicMock()
    coordinator.config_entry.title = "Radarr"
    coordinator.async_request_refresh = AsyncMock()
    client = AsyncMock()
    client.release_search = AsyncMock()
    await _handle_command(hass, coordinator, client, "movie_search", {"movie_id": 4})
    client.release_search.assert_awaited_once_with(4)

    with pytest.MonkeyPatch.context() as mp:
        mp.setattr(
            "custom_components.arr_dashboard.websocket_api.async_add_movie",
            AsyncMock(return_value={"title": "New", "year": 2024}),
        )
        result = await _handle_command(
            hass, coordinator, client, "add_movie", {"title": "New"}
        )
    assert result["movie"]["title"] == "New"
    event_type = hass.bus.async_fire.call_args.args[0]
    assert event_type == EVENT_MOVIE_ADDED


async def test_get_state_series_shape(hass: HomeAssistant) -> None:
    client = AsyncMock()
    entry = MockConfigEntry(
        domain=DOMAIN,
        data={"app": "sonarr", "url": "http://sonarr.local:8989", "api_key": "key"},
        title="Sonarr",
    )
    entry.add_to_hass(hass)
    coordinator = MagicMock()
    coordinator.config_entry = entry
    series = {
        "id": 1,
        "title": "Alpha",
        "year": 2020,
        "hasFile": True,
        "added": "2024-01-01",
        "posterUrl": "/api/arr_dashboard/x/poster/1",
    }
    coordinator.data.app = "sonarr"
    coordinator.data.reachable = True
    coordinator.data.last_success = None
    coordinator.data.series = [series]
    coordinator.data.upcoming = [{"seriesTitle": "Alpha", "seasonNumber": 1}]
    coordinator.data.queue = {"records": [], "totalRecords": 0}
    coordinator.data.queue_count = 0
    coordinator.data.health = []
    coordinator.data.disk_space = []
    coordinator.data.root_folders = []
    coordinator.data.quality_profiles = []
    coordinator.data.system = {}

    state = await _handle_command(hass, coordinator, client, "get_state", {})
    assert state["app"] == "sonarr"
    assert state["series"][0]["title"] == "Alpha"
    assert "movies" not in state
    assert state["upcoming"][0]["seriesTitle"] == "Alpha"

    core = await _handle_command(
        hass, coordinator, client, "get_state", {"scope": "core"}
    )
    assert "series" not in core
    assert core["app"] == "sonarr"
    assert "library_revision" in core


async def test_list_instances_has_no_secrets(hass: HomeAssistant) -> None:
    MockConfigEntry(
        domain=DOMAIN,
        data={
            "app": "sonarr",
            "url": "http://sonarr.local:8989",
            "api_key": "super-secret",
            "name": "Sonarr",
        },
        title="Sonarr",
        entry_id="sonarr-1",
    ).add_to_hass(hass)
    MockConfigEntry(
        domain=DOMAIN,
        data={"url": "http://radarr.local:7878", "api_key": "also-secret"},
        title="Radarr",
        entry_id="radarr-1",
    ).add_to_hass(hass)
    rows = sorted(list_arr_instances(hass), key=lambda row: row["entry_id"])
    assert rows == [
        {"entry_id": "radarr-1", "title": "Radarr", "app": "radarr"},
        {"entry_id": "sonarr-1", "title": "Sonarr", "app": "sonarr"},
    ]
    blob = str(rows)
    assert "secret" not in blob
    assert "http" not in blob
    result = await _handle_command(
        hass, MagicMock(), MagicMock(), "list_instances", {}
    )
    assert {row["app"] for row in result["instances"]} == {"radarr", "sonarr"}
