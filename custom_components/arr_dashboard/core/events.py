"""Event payload helpers (spec §12)."""

from __future__ import annotations

from typing import Any

from ..const import MEDIA_TYPE_MOVIE


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
    data: dict[str, Any] = {
        "instance": instance,
        "media_type": MEDIA_TYPE_MOVIE,
        "title": title,
        "year": year,
    }
    if quality is not None:
        data["quality"] = quality
    if size is not None:
        data["size"] = size
    if reason is not None:
        data["reason"] = reason
    return data