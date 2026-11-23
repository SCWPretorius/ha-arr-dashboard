"""Sonarr coordinator and library paging."""

from __future__ import annotations

from unittest.mock import AsyncMock

from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.arr_dashboard.const import (
    DOMAIN,
    EVENT_DOWNLOAD_COMPLETED,
    EVENT_DOWNLOAD_FAILED,
)
from custom_components.arr_dashboard.sensor import ArrHealthSensor, ArrQueueCountSensor
from custom_components.arr_dashboard.sonarr.client import SonarrClient
from custom_components.arr_dashboard.sonarr.coordinator import (
    SonarrDataUpdateCoordinator,
    _QueueSnap,
)
from custom_components.arr_dashboard.websocket_api import _handle_command


def _series_payload(series_id: int, title: str, files: int) -> dict:
    return {
        "id": series_id,
        "title": title,
        "year": 2020 + series_id,
        "tvdbId": 100 + series_id,
        "network": "HBO",
        "status": "continuing",
        "monitored": True,
        "added": f"2024-0{series_id}-01T00:00:00Z",
        "overview": "Plot",
        "path": f"/tv/{title}",
        "qualityProfileId": 1,
        "statistics": {
            "seasonCount": 1,
            "episodeCount": 4,
            "totalEpisodeCount": 4,
            "episodeFileCount": files,
        },
        "seasons": [
            {
                "seasonNumber": 1,
                "monitored": True,
                "statistics": {
                    "episodeFileCount": files,
                    "totalEpisodeCount": 4,
                },
            }
        ],
        "images": [
            {
                "coverType": "poster",
                "remoteUrl": "https://artworks.thetvdb.com/banners/posters/1.jpg",
            }
        ],
    }


def _mock_client(hass: HomeAssistant) -> SonarrClient:
    client = SonarrClient(hass, "http://sonarr.local:8989", "key", True)
    client.get_series_list = AsyncMock(  # type: ignore[method-assign]
        return_value=[
            _series_payload(1, "Alpha", 2),
            _series_payload(2, "Beta", 0),
        ]
    )
    client.get_queue = AsyncMock(  # type: ignore[method-assign]
        return_value={"records": [], "totalRecords": 0}
    )
    client.get_health = AsyncMock(return_value=[])  # type: ignore[method-assign]
    client.get_disk_space = AsyncMock(return_value=[])  # type: ignore[method-assign]
    client.get_system_status = AsyncMock(  # type: ignore[method-assign]
        return_value={"appName": "Sonarr", "version": "4.0.9.2244"}
    )
    client.get_root_folders = AsyncMock(  # type: ignore[method-assign]
        return_value=[{"id": 1, "path": "/tv", "freeSpace": 1}]
    )
    client.get_quality_profiles = AsyncMock(  # type: ignore[method-assign]
        return_value=[{"id": 1, "name": "HD-1080p"}]
    )
    client.get_calendar = AsyncMock(  # type: ignore[method-assign]
        return_value=[
            {
                "id": 50,
                "seriesId": 1,
                "seasonNumber": 1,
                "episodeNumber": 3,
                "title": "Next",
                "airDateUtc": "2026-11-24T00:00:00Z",
                "series": {"id": 1, "title": "Alpha"},
            }
        ]
    )
    return client


async def _coordinator(
    hass: HomeAssistant,
) -> tuple[SonarrClient, SonarrDataUpdateCoordinator]:
    client = _mock_client(hass)
    entry = MockConfigEntry(
        domain=DOMAIN,
        data={"app": "sonarr", "url": "http://sonarr.local:8989", "api_key": "key"},
        title="Sonarr",
        entry_id="sonarr-entry",
    )
    entry.add_to_hass(hass)
    coord = SonarrDataUpdateCoordinator(hass, client, entry)
    return client, coord


async def test_coordinator_slims_series_and_calendar(hass: HomeAssistant) -> None:
    _client, coord = await _coordinator(hass)
    await coord.async_refresh()
    assert coord.data.reachable is True
    assert coord.data.app == "sonarr"
    alpha = coord.data.series[0]
    assert alpha["title"] == "Alpha"
    assert alpha["tvdbId"] == 101
    assert alpha["network"] == "HBO"
    assert alpha["hasFile"] is True
    assert alpha["episodeFileCount"] == 2
    assert alpha["posterUrl"] == alpha["poster"]
    assert alpha["posterUrl"].startswith("https://artworks.thetvdb.com/")
    assert alpha["seasons"][0]["seasonNumber"] == 1
    assert alpha["seasons"][0]["episodeFileCount"] == 2
    assert coord.data.series[1]["hasFile"] is False
    assert coord.data.upcoming[0]["seriesTitle"] == "Alpha"
    assert coord.data.upcoming[0]["seasonNumber"] == 1
    assert coord.data.upcoming[0]["episodeNumber"] == 3
    assert coord.data.queue_count == 0


async def test_library_page_skips_series_without_files(hass: HomeAssistant) -> None:
    client, coord = await _coordinator(hass)
    await coord.async_refresh()
    page = await _handle_command(
        hass,
        coord,
        client,
        "library_page",
        {"offset": 0, "limit": 10, "sort": "title"},
    )
    assert page["total"] == 1
    assert page["items"][0]["title"] == "Alpha"
    assert page["series"][0]["title"] == "Alpha"
    assert page["items"][0]["hasFile"] is True


async def test_download_events_include_series_and_episode(hass: HomeAssistant) -> None:
    _client, coord = await _coordinator(hass)
    fired: list[tuple[str, dict]] = []
    coord._fire = lambda event, data: fired.append((event, data))  # type: ignore[method-assign]
    coord._queue_events_seeded = True
    item = {
        "id": 5,
        "status": "failed",
        "size": 20,
        "series": {"id": 1, "title": "Alpha", "year": 2021},
        "seasonNumber": 1,
        "episode": {"title": "Pilot", "seasonNumber": 1, "episodeNumber": 2},
        "quality": {"quality": {"name": "HDTV-720p"}},
    }
    coord._process_queue_events([item], [])
    assert fired[0][0] == EVENT_DOWNLOAD_FAILED
    payload = fired[0][1]
    assert payload["series"]["title"] == "Alpha"
    assert payload["episode"]["season"] == 1
    assert payload["episode"]["episode"] == 2
    assert payload["episode"]["title"] == "Pilot"
    assert payload["media_type"] == "series"

    coord._prev_queue = {
        9: _QueueSnap(9, 1, "Alpha", 2021, 1, 4, "Finale", "HDTV-720p", 30, True, False)
    }
    coord._prev_file_counts = {1: 1}
    coord._process_queue_events(
        [],
        [{"id": 1, "episodeFileCount": 2, "title": "Alpha", "hasFile": True}],
    )
    assert fired[1][0] == EVENT_DOWNLOAD_COMPLETED
    assert fired[1][1]["episode"]["title"] == "Finale"
    assert fired[1][1]["series"]["title"] == "Alpha"


async def test_sensors_read_sonarr_coordinator(hass: HomeAssistant) -> None:
    _client, coord = await _coordinator(hass)
    await coord.async_refresh()
    coord.data.queue_count = 4
    coord.data.health = [{"type": "warning", "source": "Disk", "message": "low"}]
    entry = coord.config_entry
    queue = ArrQueueCountSensor(coord, entry)
    health = ArrHealthSensor(coord, entry)
    assert queue.native_value == 4
    assert queue.name == "Sonarr queue"
    assert health.native_value == "1 issue(s)"
    assert health.name == "Sonarr health"
