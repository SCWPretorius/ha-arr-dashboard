"""Extended §12 event behaviour."""

from __future__ import annotations

from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.arr_dashboard.const import (
    EVENT_DOWNLOAD_COMPLETED,
    EVENT_DOWNLOAD_FAILED,
    EVENT_HEALTH_ISSUE,
)
from custom_components.arr_dashboard.core.events import movie_event_base
from custom_components.arr_dashboard.radarr.client import RadarrClient
from custom_components.arr_dashboard.radarr.coordinator import (
    RadarrDataUpdateCoordinator,
    _QueueSnap,
)


def test_event_payload_always_seven_keys() -> None:
    payload = movie_event_base("radarr", "X", 2020, quality="1080p")
    assert set(payload.keys()) == {
        "instance",
        "media_type",
        "title",
        "year",
        "quality",
        "size",
        "reason",
    }


async def test_failed_seeded_without_fire_on_first_poll(
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
    assert fired == []
    coord._process_queue_events([item], [])
    assert fired.count(EVENT_DOWNLOAD_FAILED) == 0


async def test_failed_fires_on_new_failure_after_seed(
    hass: HomeAssistant, radarr_config: dict
) -> None:
    client = RadarrClient(hass, radarr_config["url"], radarr_config["api_key"], True)
    entry = MockConfigEntry(domain="arr_dashboard", data=radarr_config, title="Radarr")
    entry.add_to_hass(hass)
    coord = RadarrDataUpdateCoordinator(hass, client, entry)
    fired: list[str] = []
    coord._fire = lambda et, data: fired.append(et)  # type: ignore[method-assign]
    coord._process_queue_events(
        [{"id": 1, "status": "queued", "movie": {"id": 2, "title": "A"}}],
        [],
    )
    coord._process_queue_events(
        [
            {
                "id": 2,
                "status": "failed",
                "movie": {"title": "Y", "year": 2021, "id": 3},
            }
        ],
        [],
    )
    assert fired.count(EVENT_DOWNLOAD_FAILED) == 1


async def test_completed_skipped_when_movie_had_file(
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
        1: _QueueSnap(1, 9, "Upgrade", 2020, "1080p", 1_000_000, True, True)
    }
    movies = [{"id": 9, "title": "Upgrade", "year": 2020, "hasFile": True}]
    coord._process_queue_events([], movies)
    assert EVENT_DOWNLOAD_COMPLETED not in fired


async def test_health_refires_after_clear(
    hass: HomeAssistant, radarr_config: dict
) -> None:
    client = RadarrClient(hass, radarr_config["url"], radarr_config["api_key"], True)
    entry = MockConfigEntry(domain="arr_dashboard", data=radarr_config, title="Radarr")
    entry.add_to_hass(hass)
    coord = RadarrDataUpdateCoordinator(hass, client, entry)
    fired: list[str] = []
    coord._fire = lambda et, data: fired.append(et)  # type: ignore[method-assign]
    issue = [{"type": "warning", "source": "Disk", "message": "Low space"}]
    coord._process_health_events(issue)
    assert fired.count(EVENT_HEALTH_ISSUE) == 0
    coord._process_health_events(issue)
    assert fired.count(EVENT_HEALTH_ISSUE) == 0
    coord._process_health_events([])
    coord._process_health_events(issue)
    assert fired.count(EVENT_HEALTH_ISSUE) == 1