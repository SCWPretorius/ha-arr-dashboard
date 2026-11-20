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
    return {
        "instance": instance,
        "media_type": MEDIA_TYPE_MOVIE,
        "title": title,
        "year": year,
        "quality": quality,
        "size": size,
        "reason": reason,
    }