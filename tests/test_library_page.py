"""Websocket library_page, library_match, and get_state core scope."""

from __future__ import annotations

from datetime import UTC, datetime

import pytest
import voluptuous as vol
from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.arr_dashboard.library_logic import library_revision
from custom_components.arr_dashboard.radarr.client import RadarrClient
from custom_components.arr_dashboard.radarr.coordinator import (
    RadarrDataUpdateCoordinator,
)
from custom_components.arr_dashboard.websocket_api import _handle_command


def _movies() -> list[dict]:
    return [
        {
            "id": 1,
            "title": "Alpha",
            "year": 2020,
            "hasFile": True,
            "added": "2020-01-01",
            "tmdbId": 101,
        },
        {
            "id": 2,
            "title": "Beta",
            "year": 2021,
            "hasFile": False,
            "added": "2021-01-01",
            "tmdbId": 102,
        },
        {
            "id": 3,
            "title": "Gamma",
            "year": 2022,
            "hasFile": True,
            "added": "2022-01-01",
            "tmdbId": 103,
        },
    ]


async def _coord(
    hass: HomeAssistant, radarr_config: dict
) -> RadarrDataUpdateCoordinator:
    client = RadarrClient(hass, radarr_config["url"], radarr_config["api_key"], True)
    entry = MockConfigEntry(domain="arr_dashboard", data=radarr_config, title="Radarr")
    entry.add_to_hass(hass)
    coord = RadarrDataUpdateCoordinator(hass, client, entry)
    coord.data.movies = _movies()
    coord.data.queue = {"records": [], "totalRecords": 0}
    coord.data.queue_count = 0
    coord.data.health = []
    coord.data.disk_space = []
    coord.data.root_folders = []
    coord.data.quality_profiles = []
    coord.data.system = {}
    coord.data.reachable = True
    return coord


async def test_get_state_core_omits_movies(
    hass: HomeAssistant, radarr_config: dict
) -> None:
    client = RadarrClient(hass, radarr_config["url"], radarr_config["api_key"], True)
    coord = await _coord(hass, radarr_config)
    result = await _handle_command(hass, coord, client, "get_state", {"scope": "core"})
    assert "movies" not in result
    assert "library_revision" in result
    assert result["queue_count"] == 0


async def test_library_page_downloaded_only_and_pagination(
    hass: HomeAssistant, radarr_config: dict
) -> None:
    client = RadarrClient(hass, radarr_config["url"], radarr_config["api_key"], True)
    coord = await _coord(hass, radarr_config)
    result = await _handle_command(
        hass,
        coord,
        client,
        "library_page",
        {"offset": 0, "limit": 1, "sort": "title"},
    )
    assert result["total"] == 2
    assert len(result["items"]) == 1
    assert result["items"][0]["title"] == "Alpha"
    page2 = await _handle_command(
        hass,
        coord,
        client,
        "library_page",
        {"offset": 1, "limit": 1, "sort": "title"},
    )
    assert page2["items"][0]["title"] == "Gamma"


async def test_library_page_search_and_sort_added(
    hass: HomeAssistant, radarr_config: dict
) -> None:
    client = RadarrClient(hass, radarr_config["url"], radarr_config["api_key"], True)
    coord = await _coord(hass, radarr_config)
    result = await _handle_command(
        hass,
        coord,
        client,
        "library_page",
        {"search": "gam", "sort": "added"},
    )
    assert result["total"] == 1
    assert result["items"][0]["title"] == "Gamma"


async def test_library_match_by_tmdb(
    hass: HomeAssistant, radarr_config: dict
) -> None:
    client = RadarrClient(hass, radarr_config["url"], radarr_config["api_key"], True)
    coord = await _coord(hass, radarr_config)
    hit = await _handle_command(
        hass, coord, client, "library_match", {"tmdbId": 102}
    )
    assert hit["movie"]["title"] == "Beta"
    miss = await _handle_command(
        hass, coord, client, "library_match", {"title": "Nope", "year": 1999}
    )
    assert miss["movie"] is None


def test_library_revision_ignores_poll_timestamp() -> None:
    movies = _movies()

    class Data:
        def __init__(self, last: datetime | None) -> None:
            self.movies = movies
            self.last_success = last

    rev_a = library_revision(Data(datetime(2020, 1, 1, tzinfo=UTC)))
    rev_b = library_revision(Data(datetime(2025, 6, 1, tzinfo=UTC)))
    assert rev_a == rev_b


def test_library_revision_changes_when_file_set_changes() -> None:
    class Data:
        movies: list[dict]
        last_success = None

    data = Data()
    data.movies = _movies()
    rev_before = library_revision(data)
    data.movies = [{**m, "hasFile": not m["hasFile"]} for m in _movies()]
    rev_after = library_revision(data)
    assert rev_before != rev_after


async def test_library_page_rejects_bad_offset(
    hass: HomeAssistant, radarr_config: dict
) -> None:
    client = RadarrClient(hass, radarr_config["url"], radarr_config["api_key"], True)
    coord = await _coord(hass, radarr_config)
    with pytest.raises((vol.Invalid, ValueError)):
        await _handle_command(
            hass,
            coord,
            client,
            "library_page",
            {"offset": -1},
        )


async def test_library_page_rejects_invalid_offset_type(
    hass: HomeAssistant, radarr_config: dict
) -> None:
    client = RadarrClient(hass, radarr_config["url"], radarr_config["api_key"], True)
    coord = await _coord(hass, radarr_config)
    with pytest.raises(vol.Invalid):
        await _handle_command(
            hass,
            coord,
            client,
            "library_page",
            {"offset": "abc"},
        )


async def test_library_match_coerces_tmdb_id(
    hass: HomeAssistant, radarr_config: dict
) -> None:
    client = RadarrClient(hass, radarr_config["url"], radarr_config["api_key"], True)
    coord = await _coord(hass, radarr_config)
    hit = await _handle_command(
        hass, coord, client, "library_match", {"tmdbId": "102"}
    )
    assert hit["movie"]["title"] == "Beta"


async def test_library_upcoming_rejects_bad_days(
    hass: HomeAssistant, radarr_config: dict
) -> None:
    client = RadarrClient(hass, radarr_config["url"], radarr_config["api_key"], True)
    coord = await _coord(hass, radarr_config)
    with pytest.raises(vol.Invalid):
        await _handle_command(
            hass,
            coord,
            client,
            "library_upcoming",
            {"days": "x"},
        )