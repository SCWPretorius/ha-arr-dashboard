"""Voluptuous schemas for Arr Dashboard services."""

from __future__ import annotations

import voluptuous as vol

from ..const import ATTR_INSTANCE

SERVICE_SCHEMA_BASE = {vol.Required(ATTR_INSTANCE): str}

REMOVE_MOVIE_SCHEMA = {
    **SERVICE_SCHEMA_BASE,
    vol.Required("movie_id"): vol.Coerce(int),
    vol.Optional("delete_files", default=False): bool,
    vol.Optional("add_import_exclusion", default=False): bool,
}

QUEUE_REMOVE_SCHEMA = {
    **SERVICE_SCHEMA_BASE,
    vol.Required("queue_id"): vol.Coerce(int),
    vol.Optional("remove_from_client", default=True): bool,
}

LIBRARY_PAGE_SCHEMA = vol.Schema(
    {
        vol.Optional("offset", default=0): vol.All(
            vol.Coerce(int), vol.Range(min=0, max=1_000_000)
        ),
        vol.Optional("limit", default=48): vol.All(
            vol.Coerce(int), vol.Range(min=1, max=200)
        ),
        vol.Optional("sort", default="title"): vol.In(["title", "added", "year"]),
        vol.Optional("search", default=""): vol.All(
            vol.Coerce(str), vol.Length(max=500)
        ),
    }
)

LIBRARY_MATCH_SCHEMA = vol.Schema(
    {
        vol.Optional("tmdbId"): vol.All(vol.Coerce(int), vol.Range(min=0)),
        vol.Optional("title"): vol.Coerce(str),
        vol.Optional("year"): vol.Coerce(int),
    }
)

LIBRARY_UPCOMING_SCHEMA = vol.Schema(
    {
        vol.Optional("days", default=14): vol.All(
            vol.Coerce(int), vol.Range(min=1, max=365)
        ),
    }
)