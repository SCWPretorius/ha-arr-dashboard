"""Event payload helpers (spec §12)."""

from __future__ import annotations

from typing import Any

from ..const import MEDIA_TYPE_MOVIE, MEDIA_TYPE_SERIES


def movie_event_base(
    instance: str,
    title: str | None,
    year: int | None,
    *,
    quality: str | None = None,
    size: int | None = None,
    reason: str | None = None,
) -> dict[str, Any]:
    """Build the standard Arr card event payload."""
    return {
        "instance": instance,
        "media_type": MEDIA_TYPE_MOVIE,
        "title": title,
        "year": year,
        "quality": quality,
        "size": size,
        "reason": reason,
    }


def series_event_base(
    instance: str,
    title: str | None,
    year: int | None,
    *,
    season: int | None = None,
    episode: int | None = None,
    episode_title: str | None = None,
    quality: str | None = None,
    size: int | None = None,
    reason: str | None = None,
) -> dict[str, Any]:
    """Build a series event payload. Movie events stay on movie_event_base."""
    payload: dict[str, Any] = {
        "instance": instance,
        "media_type": MEDIA_TYPE_SERIES,
        "title": title,
        "year": year,
        "series": {"title": title, "year": year},
        "quality": quality,
        "size": size,
        "reason": reason,
    }
    if season is not None or episode is not None or episode_title is not None:
        payload["episode"] = {
            "season": season,
            "episode": episode,
            "title": episode_title,
        }
    return payload