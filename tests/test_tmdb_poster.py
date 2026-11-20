"""Poster URL helpers for coordinator payloads."""

from custom_components.arr_dashboard.radarr.coordinator import _tmdb_tile_poster


def test_tmdb_tile_poster_replaces_original() -> None:
    url = "https://image.tmdb.org/t/p/original/poster.jpg"
    assert _tmdb_tile_poster(url) == "https://image.tmdb.org/t/p/w185/poster.jpg"


def test_tmdb_tile_poster_replaces_other_sizes() -> None:
    url = "https://image.tmdb.org/t/p/w500/poster.jpg"
    assert _tmdb_tile_poster(url) == "https://image.tmdb.org/t/p/w185/poster.jpg"


def test_tmdb_tile_poster_passthrough() -> None:
    local = "/api/arr_dashboard/entry/poster/42"
    assert _tmdb_tile_poster(local) == local
    assert _tmdb_tile_poster(None) is None