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