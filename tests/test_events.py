"""Coordinator event transition tests (spec §12)."""

from __future__ import annotations

from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.arr_dashboard.const import (
    EVENT_DOWNLOAD_COMPLETED,
    EVENT_DOWNLOAD_FAILED,
    EVENT_HEALTH_ISSUE,
    EVENT_MOVIE_ADDED,
)
from custom_components.arr_dashboard.radarr.client import RadarrClient
from custom_components.arr_dashboard.radarr.coordinator import (
    RadarrDataUpdateCoordinator,
    _QueueSnap,
)


async def test_failed_event_once_per_queue_id(
    hass: HomeAssistant, radarr_config: dict
) -> None:
    client = RadarrClient(hass, radarr_config["url"], radarr_config["api_key"], True)
    entry = MockConfigEntry(domain="arr_dashboard", data=radarr_config, title="Radarr")
    entry.add_to_hass(hass)
    coord = RadarrDataUpdateCoordinator(hass, client, entry)
    fired: list[str] = []
    coord._fire = lambda et, data: fired.append(et)  # type: ignore[method-assign]
    item = {
        "id": 5,
        "status": "failed",
        "movie": {"title": "X", "year": 2020, "id": 1},
        "quality": {"quality": {"name": "1080p"}},
    }
    coord._process_queue_events([item], [])
    coord._process_queue_events([item], [])
    assert fired.count(EVENT_DOWNLOAD_FAILED) == 0
    item2 = {
        **item,
        "id": 6,
    }
    coord._process_queue_events([item, item2], [])
    assert fired.count(EVENT_DOWNLOAD_FAILED) == 1


async def test_completed_event_on_queue_removal(
    hass: HomeAssistant, radarr_config: dict
) -> None:
    client = RadarrClient(hass, radarr_config["url"], radarr_config["api_key"], True)
    entry = MockConfigEntry(domain="arr_dashboard", data=radarr_config, title="Radarr")
    entry.add_to_hass(hass)
    coord = RadarrDataUpdateCoordinator(hass, client, entry)
    fired: list[str] = []
    coord._fire = lambda et, data: fired.append(et)  # type: ignore[method-assign]
    coord._queue_events_seeded = True
    coord._prev_queue = {
        1: _QueueSnap(1, 9, "Done", 2020, "1080p", 1_000_000, True, False)
    }
    movies = [
        {"id": 9, "title": "Done", "year": 2020, "hasFile": True, "quality": "1080p"}
    ]
    coord._process_queue_events([], movies)
    assert EVENT_DOWNLOAD_COMPLETED in fired
    coord._process_queue_events([], movies)
    assert fired.count(EVENT_DOWNLOAD_COMPLETED) == 1


async def test_health_issue_once(hass: HomeAssistant, radarr_config: dict) -> None:
    client = RadarrClient(hass, radarr_config["url"], radarr_config["api_key"], True)
    entry = MockConfigEntry(domain="arr_dashboard", data=radarr_config, title="Radarr")
    entry.add_to_hass(hass)
    coord = RadarrDataUpdateCoordinator(hass, client, entry)
    fired: list[str] = []
    coord._fire = lambda et, data: fired.append(et)  # type: ignore[method-assign]
    health = [{"type": "warning", "source": "System", "message": "Disk almost full"}]
    coord._process_health_events(health)
    coord._process_health_events(health)
    assert fired.count(EVENT_HEALTH_ISSUE) == 0
    coord._process_health_events([])
    coord._process_health_events(health)
    assert fired.count(EVENT_HEALTH_ISSUE) == 1


def test_movie_added_constant() -> None:
    assert EVENT_MOVIE_ADDED == "arr_movie_added"