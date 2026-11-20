"""Library filter, sort, and pagination for the Arr Dashboard card."""

from __future__ import annotations

import hashlib
from typing import Any

LibrarySort = str  # "title" | "added" | "year"


def library_revision(coordinator_data: Any) -> str:
    """Stable revision string when on-disk library content changes."""
    movies = coordinator_data.movies or []
    parts: list[str] = []
    for m in sorted(movies, key=lambda x: x.get("id") or 0):
        parts.append(
            f"{m.get('id')}:{int(bool(m.get('hasFile')))}:{m.get('added') or ''}"
        )
    digest = hashlib.sha256("|".join(parts).encode()).hexdigest()[:16]
    return f"{digest}:{len(movies)}"


def filter_library_downloaded(
    movies: list[dict[str, Any]], search: str
) -> list[dict[str, Any]]:
    """On-disk movies matching optional search (library tab default)."""
    list_ = [m for m in movies if m.get("hasFile")]
    q = (search or "").strip().lower()
    if q:
        list_ = [
            m
            for m in list_
            if q in (m.get("title") or "").lower()
        ]
    return list_


def sort_library(
    movies: list[dict[str, Any]], sort: LibrarySort
) -> list[dict[str, Any]]:
    """Sort movies like the card library tab."""
    list_ = list(movies)
    if sort == "added":
        list_.sort(key=lambda m: m.get("added") or "", reverse=True)
    elif sort == "year":
        list_.sort(key=lambda m: m.get("year") or 0, reverse=True)
    else:
        list_.sort(key=lambda m: (m.get("title") or "").lower())
    return list_


def library_page_slice(
    movies: list[dict[str, Any]],
    *,
    offset: int,
    limit: int,
    sort: LibrarySort,
    search: str,
) -> tuple[int, list[dict[str, Any]]]:
    """Filter, sort, and return one page."""
    filtered = filter_library_downloaded(movies, search)
    sorted_ = sort_library(filtered, sort)
    total = len(sorted_)
    offset = max(0, offset)
    limit = max(1, min(limit, 200))
    return total, sorted_[offset : offset + limit]


def library_match(
    movies: list[dict[str, Any]],
    *,
    tmdb_id: int | None,
    title: str | None,
    year: int | None,
) -> dict[str, Any] | None:
    """Find a library movie for Add-tab lookup."""
    if tmdb_id is not None:
        for m in movies:
            if m.get("tmdbId") == tmdb_id:
                return m
    t = (title or "").lower()
    if not t:
        return None
    for m in movies:
        if (m.get("title") or "").lower() == t and m.get("year") == year:
            return m
    return None


def library_upcoming(
    movies: list[dict[str, Any]], _days: int = 14, cap: int = 12
) -> list[dict[str, Any]]:
    """Upcoming / in-cinemas movies for the Add tab."""
    out: list[dict[str, Any]] = []
    for m in movies:
        st = (m.get("status") or "").lower()
        if st in ("incinemas", "announced", "in cinemas"):
            out.append(m)
            if len(out) >= cap:
                break
    return out