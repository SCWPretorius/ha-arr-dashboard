"""Sonarr client tests with mocked HTTP."""

from __future__ import annotations

from unittest.mock import AsyncMock, MagicMock

import pytest

from custom_components.arr_dashboard.core.client import ArrClientError, ArrWrongApp
from custom_components.arr_dashboard.sonarr.actions import async_add_series
from custom_components.arr_dashboard.sonarr.client import SonarrClient


def _client() -> SonarrClient:
    return SonarrClient(MagicMock(), "http://sonarr.local:8989", "key", True)


async def test_validate_requires_sonarr_v4() -> None:
    client = _client()
    client.get = AsyncMock(  # type: ignore[method-assign]
        return_value={"appName": "Sonarr", "version": "4.0.1.2000"}
    )
    status = await client.validate_connection()
    assert status["appName"] == "Sonarr"
    client.get.assert_awaited_with("/api/v3/system/status")


async def test_validate_rejects_radarr() -> None:
    client = _client()
    client.get = AsyncMock(  # type: ignore[method-assign]
        return_value={"appName": "Radarr", "version": "5.0.0.0"}
    )
    with pytest.raises(ArrWrongApp):
        await client.validate_connection()


async def test_validate_rejects_version_below_4() -> None:
    client = _client()
    client.get = AsyncMock(  # type: ignore[method-assign]
        return_value={"appName": "Sonarr", "version": "3.0.9.0"}
    )
    with pytest.raises(ArrClientError, match="below 4"):
        await client.validate_connection()


async def test_add_series_payload() -> None:
    client = _client()
    client.lookup = AsyncMock(  # type: ignore[method-assign]
        return_value=[
            {
                "tvdbId": 42,
                "title": "Show",
                "year": 2019,
                "titleSlug": "show",
                "seasons": [{"seasonNumber": 1, "monitored": False}],
            }
        ]
    )
    client.post = AsyncMock(return_value={"id": 9, "title": "Show", "year": 2020})  # type: ignore[method-assign]
    await async_add_series(
        client,
        {
            "title": "Show",
            "year": 2020,
            "tvdbId": 42,
            "imdbId": "tt1",
            "quality_profile_id": 3,
            "root_folder_path": "/tv",
            "search_on_add": False,
            "monitor": "future",
        },
    )
    client.lookup.assert_awaited_once_with("tvdb:42")
    body = client.post.await_args.kwargs["json"]
    assert client.post.await_args.args[0] == "/api/v3/series"
    assert body["seasonFolder"] is True
    assert body["qualityProfileId"] == 3
    assert body["rootFolderPath"] == "/tv"
    assert body["addOptions"]["monitor"] == "future"
    assert body["addOptions"]["searchForMissingEpisodes"] is False
    assert body["tvdbId"] == 42
    assert body["imdbId"] == "tt1"
    assert body["titleSlug"] == "show"
    assert body["seasons"] == [{"seasonNumber": 1, "monitored": False}]
    assert body["year"] == 2020
    assert "id" not in body


async def test_delete_and_searches() -> None:
    client = _client()
    client.delete = AsyncMock()  # type: ignore[method-assign]
    client.post = AsyncMock(return_value={"id": 1})  # type: ignore[method-assign]
    client.get = AsyncMock(return_value=[{"guid": "abc"}])  # type: ignore[method-assign]

    await client.delete_series(7, delete_files=True, add_import_exclusion=True)
    assert client.delete.await_args.args[0] == "/api/v3/series/7"
    assert client.delete.await_args.kwargs["params"]["deleteFiles"] == "true"
    assert client.delete.await_args.kwargs["params"]["addImportExclusion"] == "true"

    await client.series_search(7)
    assert client.post.await_args.kwargs["json"]["name"] == "SeriesSearch"
    await client.season_search(7, 2)
    command = client.post.await_args.kwargs["json"]
    assert command["name"] == "SeasonSearch"
    assert command["seasonNumber"] == 2

    episodes = await client.get_episodes(7)
    assert client.get.await_args.args[0] == "/api/v3/episode"
    assert client.get.await_args.kwargs["params"] == {"seriesId": 7}
    assert episodes == [{"guid": "abc"}]

    await client.episode_releases(15)
    assert client.get.await_args.args[0] == "/api/v3/release"
    assert client.get.await_args.kwargs["params"] == {"episodeId": 15}

    client.post = AsyncMock(return_value={"id": 4, "name": "DownloadedEpisodesScan"})  # type: ignore[method-assign]
    await client.retry_import("/downloads/show", "sab-1")
    scan = client.post.await_args.kwargs["json"]
    assert scan["name"] == "DownloadedEpisodesScan"
    assert scan["path"] == "/downloads/show"


async def test_queue_includes_series_and_episode() -> None:
    client = _client()
    client.get = AsyncMock(  # type: ignore[method-assign]
        return_value={
            "records": [
                {
                    "id": 1,
                    "series": {"id": 8, "title": "Show"},
                    "episode": {
                        "title": "Pilot",
                        "seasonNumber": 1,
                        "episodeNumber": 2,
                    },
                }
            ],
            "totalRecords": 1,
        }
    )
    queue = await client.get_queue()
    row = queue["records"][0]
    assert row["series"]["title"] == "Show"
    assert row["seasonNumber"] == 1
    assert row["episodeNumber"] == 2
    assert row["episode"]["title"] == "Pilot"
    params = client.get.await_args.kwargs["params"]
    assert params["includeSeries"] == "true"
    assert params["includeEpisode"] == "true"
