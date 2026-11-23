"""WebSocket API for the Arr Dashboard card (no admin required)."""

from __future__ import annotations

import logging
from collections.abc import Mapping
from typing import Any, assert_never

import voluptuous as vol
from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback

from .const import (
    APP_RADARR,
    APP_SONARR,
    CONF_APP,
    DOMAIN,
    EVENT_MOVIE_ADDED,
    EVENT_SERIES_ADDED,
    WS_TYPE_ARR_DASHBOARD,
    AppKind,
)
from .core.client import ArrNotFound
from .core.events import movie_event_base, series_event_base
from .core.schemas import (
    LIBRARY_MATCH_SCHEMA,
    LIBRARY_PAGE_SCHEMA,
    LIBRARY_UPCOMING_SCHEMA,
)
from .helpers import get_arr_client, get_coordinator_for_entry, stored_app
from .library_logic import (
    library_match,
    library_page_slice,
    library_revision,
    library_source,
    library_upcoming,
)
from .radarr.actions import async_add_movie
from .radarr.actions import async_delete_file_redownload as async_delete_movie_file
from .radarr.actions import async_retry_import as async_retry_movie_import
from .sonarr.actions import async_add_series
from .sonarr.actions import async_retry_import as async_retry_series_import
from .sonarr.coordinator import slim_calendar_episode, slim_series

_LOGGER = logging.getLogger(__name__)

_SONARR_ONLY = frozenset(
    {
        "add_series",
        "get_series",
        "series_search",
        "season_search",
        "remove_series",
        "set_series_monitored",
        "set_series_quality_profile",
        "set_season_monitored",
    }
)
_RADARR_ONLY = frozenset(
    {
        "add_movie",
        "movie_search",
        "remove_movie",
        "set_monitored",
        "set_quality_profile",
        "get_movie",
        "delete_file_redownload",
    }
)


def list_arr_instances(hass: HomeAssistant) -> list[dict[str, str]]:
    """Public instance list. Titles and app only; no URLs or API keys."""
    rows: list[dict[str, str]] = []
    for entry in hass.config_entries.async_entries(DOMAIN):
        raw = entry.data.get(CONF_APP) if isinstance(entry.data, Mapping) else None
        rows.append(
            {
                "entry_id": entry.entry_id,
                "title": entry.title,
                "app": stored_app(raw),
            }
        )
    return rows


def coordinator_app(coordinator: Any) -> AppKind:
    """App for a coordinator. Missing or non-mapping entry data stays Radarr."""
    entry = getattr(coordinator, "config_entry", None)
    data = getattr(entry, "data", None)
    if not isinstance(data, Mapping):
        return APP_RADARR
    return stored_app(data.get(CONF_APP))


def command_app(coordinator: Any) -> AppKind:
    """Prefer the coordinator payload, then the config entry."""
    raw = getattr(getattr(coordinator, "data", None), "app", None)
    if raw == APP_SONARR or raw == APP_RADARR:
        return stored_app(raw)
    return coordinator_app(coordinator)


def _require_command_app(command: str, app: AppKind) -> None:
    if command in _SONARR_ONLY and app != APP_SONARR:
        raise ValueError("Series commands require a Sonarr entry")
    if command in _RADARR_ONLY and app != APP_RADARR:
        raise ValueError("Movie commands require a Radarr entry")


def _state_base(coordinator_data: Any, app: AppKind) -> dict[str, Any]:
    return {
        "reachable": coordinator_data.reachable,
        "last_success": (
            coordinator_data.last_success.isoformat()
            if coordinator_data.last_success
            else None
        ),
        "app": app,
    }


def _system_fields(coordinator_data: Any) -> dict[str, Any]:
    return {
        "queue": coordinator_data.queue,
        "queue_count": coordinator_data.queue_count,
        "health": coordinator_data.health,
        "disk_space": coordinator_data.disk_space,
        "root_folders": coordinator_data.root_folders,
        "quality_profiles": coordinator_data.quality_profiles,
        "system": coordinator_data.system,
    }


@callback
def async_register_websocket_handlers(hass: HomeAssistant) -> None:
    """Register websocket commands."""

    @websocket_api.websocket_command(
        {
            vol.Required("type"): WS_TYPE_ARR_DASHBOARD,
            vol.Required("entry_id"): str,
            vol.Required("command"): str,
            vol.Optional("data"): dict,
        }
    )
    @websocket_api.async_response
    async def arr_dashboard_command(
        hass: HomeAssistant,
        connection: websocket_api.ActiveConnection,
        msg: dict[str, Any],
    ) -> None:
        command = msg["command"]
        if command == "list_instances":
            connection.send_result(
                msg["id"], {"instances": list_arr_instances(hass)}
            )
            return

        entry_id = msg["entry_id"]
        data = msg.get("data") or {}

        coordinator = get_coordinator_for_entry(hass, entry_id)
        if not coordinator:
            connection.send_error(msg["id"], "not_found", "Unknown instance")
            return

        client = get_arr_client(hass, entry_id)
        if not client:
            connection.send_error(msg["id"], "not_found", "Client unavailable")
            return

        try:
            result = await _handle_command(hass, coordinator, client, command, data)
        except ArrNotFound:
            connection.send_result(msg["id"], {"error": "not_found", "message": "gone"})
            return
        except Exception as err:
            _LOGGER.debug("Command %s failed: %s", command, err)
            connection.send_error(msg["id"], "command_failed", str(err))
            return

        connection.send_result(msg["id"], result)

    websocket_api.async_register_command(hass, arr_dashboard_command)


async def _handle_command(
    hass: HomeAssistant,
    coordinator: Any,
    client: Any,
    command: str,
    data: dict[str, Any],
) -> dict[str, Any]:
    if command == "list_instances":
        return {"instances": list_arr_instances(hass)}

    app = command_app(coordinator)
    _require_command_app(command, app)
    entry_id = coordinator.config_entry.entry_id

    match command:
        case "get_state":
            return _get_state(coordinator, app, data.get("scope", "full"))
        case "library_page":
            return _library_page(coordinator, app, data)
        case "library_match":
            return _library_match(coordinator, app, data)
        case "library_upcoming":
            return await _library_upcoming(coordinator, client, app, data)
        case "lookup":
            return {"results": await client.lookup(data["term"])}
        case "add_movie":
            movie = await async_add_movie(client, data)
            hass.bus.async_fire(
                EVENT_MOVIE_ADDED,
                movie_event_base(
                    coordinator.config_entry.title,
                    movie.get("title"),
                    movie.get("year"),
                ),
            )
            await coordinator.async_request_refresh()
            return {"movie": movie}
        case "add_series":
            series = await async_add_series(client, data)
            hass.bus.async_fire(
                EVENT_SERIES_ADDED,
                series_event_base(
                    coordinator.config_entry.title,
                    series.get("title"),
                    series.get("year"),
                ),
            )
            await coordinator.async_request_refresh()
            if series.get("id") is not None:
                return {"series": slim_series(series, entry_id)}
            return {"series": series}
        case "movie_search":
            await client.release_search(int(data["movie_id"]))
            return {"ok": True}
        case "series_search":
            await client.series_search(int(data["series_id"]))
            return {"ok": True}
        case "season_search":
            await client.season_search(
                int(data["series_id"]), int(data["season_number"])
            )
            return {"ok": True}
        case "release_search":
            return await _release_search(client, app, data)
        case "grab_release":
            await client.grab_release(data["release"])
            await coordinator.async_request_refresh()
            return {"ok": True}
        case "queue_remove":
            await client.remove_queue_item(
                int(data["queue_id"]),
                remove_from_client=data.get("remove_from_client", True),
                blocklist=False,
                skip_redownload=True,
            )
            await coordinator.async_request_refresh()
            return {"ok": True}
        case "queue_remove_blocklist":
            await client.remove_queue_item(
                int(data["queue_id"]),
                remove_from_client=data.get("remove_from_client", True),
                blocklist=True,
                skip_redownload=not data.get("search_again", True),
            )
            await coordinator.async_request_refresh()
            return {"ok": True}
        case "queue_remove_search_again":
            await client.remove_queue_item(
                int(data["queue_id"]),
                remove_from_client=True,
                blocklist=True,
                skip_redownload=False,
            )
            await coordinator.async_request_refresh()
            return {"ok": True}
        case "retry_import":
            return await _retry_import(client, app, data)
        case "delete_file_redownload":
            result = await async_delete_movie_file(client, data)
            await coordinator.async_request_refresh()
            return {"ok": True, **result}
        case "remove_movie":
            await client.delete_movie(
                int(data["movie_id"]),
                delete_files=bool(data.get("delete_files", False)),
                add_import_exclusion=bool(data.get("add_import_exclusion", False)),
            )
            await coordinator.async_request_refresh()
            return {"ok": True}
        case "remove_series":
            await client.delete_series(
                int(data["series_id"]),
                delete_files=bool(data.get("delete_files", False)),
                add_import_exclusion=bool(data.get("add_import_exclusion", False)),
            )
            await coordinator.async_request_refresh()
            return {"ok": True}
        case "set_monitored":
            movie = await client.get_movie(int(data["movie_id"]))
            movie["monitored"] = bool(data["monitored"])
            updated = await client.update_movie(movie)
            await coordinator.async_request_refresh()
            return {"movie": updated}
        case "set_series_monitored":
            series = await client.get_series(int(data["series_id"]))
            series["monitored"] = bool(data["monitored"])
            updated = await client.update_series(series)
            await coordinator.async_request_refresh()
            return {"series": slim_series(updated, entry_id)}
        case "set_quality_profile":
            movie = await client.get_movie(int(data["movie_id"]))
            movie["qualityProfileId"] = int(data["quality_profile_id"])
            if data.get("search"):
                movie["monitored"] = True
            updated = await client.update_movie(movie)
            if data.get("search"):
                await client.release_search(movie["id"])
            await coordinator.async_request_refresh()
            return {"movie": updated}
        case "set_series_quality_profile":
            series = await client.get_series(int(data["series_id"]))
            series["qualityProfileId"] = int(data["quality_profile_id"])
            if data.get("search"):
                series["monitored"] = True
            updated = await client.update_series(series)
            if data.get("search"):
                await client.series_search(int(series["id"]))
            await coordinator.async_request_refresh()
            return {"series": slim_series(updated, entry_id)}
        case "set_season_monitored":
            updated = await client.set_season_monitored(
                int(data["series_id"]),
                int(data["season_number"]),
                bool(data["monitored"]),
            )
            await coordinator.async_request_refresh()
            return {"series": slim_series(updated, entry_id)}
        case "get_movie":
            movie = await client.get_movie(int(data["movie_id"]))
            history = await client.get_history_grabbed(movie["id"])
            return {"movie": movie, "grabbed_history": history}
        case "get_series":
            series = await client.get_series(int(data["series_id"]))
            slimmed = slim_series(series, entry_id)
            return {
                "series": slimmed,
                "seasons": slimmed.get("seasons") or [],
                "grabbed_history": [],
            }
        case "refresh":
            await coordinator.async_request_refresh()
            return {"ok": True}
        case _:
            raise ValueError(f"Unknown command: {command}")


def _get_state(coordinator: Any, app: AppKind, scope: str) -> dict[str, Any]:
    coordinator_data = coordinator.data
    base = _state_base(coordinator_data, app)
    if scope == "queue":
        return {
            **base,
            "queue": coordinator_data.queue,
            "queue_count": coordinator_data.queue_count,
            "health": coordinator_data.health,
            "disk_space": coordinator_data.disk_space,
        }
    system = _system_fields(coordinator_data)
    if scope == "core":
        payload = {
            **base,
            "library_revision": library_revision(coordinator_data),
            **system,
        }
        if app == APP_SONARR:
            payload["upcoming"] = coordinator_data.upcoming
        return payload
    match app:
        case "radarr":
            return {**base, "movies": coordinator_data.movies, **system}
        case "sonarr":
            return {
                **base,
                "series": coordinator_data.series,
                "upcoming": coordinator_data.upcoming,
                **system,
            }
        case _ as unexpected:
            assert_never(unexpected)


def _library_page(
    coordinator: Any, app: AppKind, data: dict[str, Any]
) -> dict[str, Any]:
    coordinator_data = coordinator.data
    page_data = LIBRARY_PAGE_SCHEMA(data)
    total, items = library_page_slice(
        library_source(coordinator_data),
        offset=page_data["offset"],
        limit=page_data["limit"],
        sort=page_data["sort"],
        search=page_data["search"],
    )
    result = {
        "total": total,
        "revision": library_revision(coordinator_data),
        "offset": page_data["offset"],
        "items": items,
    }
    if app == APP_SONARR:
        result["series"] = items
    return result


def _library_match(
    coordinator: Any, app: AppKind, data: dict[str, Any]
) -> dict[str, Any]:
    match_data = LIBRARY_MATCH_SCHEMA(data)
    item = library_match(
        library_source(coordinator.data),
        tmdb_id=match_data.get("tmdbId"),
        tvdb_id=match_data.get("tvdbId"),
        title=match_data.get("title"),
        year=match_data.get("year"),
    )
    match app:
        case "sonarr":
            return {"series": item}
        case "radarr":
            return {"movie": item}
        case _ as unexpected:
            assert_never(unexpected)


async def _library_upcoming(
    coordinator: Any, client: Any, app: AppKind, data: dict[str, Any]
) -> dict[str, Any]:
    upcoming_data = LIBRARY_UPCOMING_SCHEMA(data)
    match app:
        case "radarr":
            items = library_upcoming(coordinator.data.movies, upcoming_data["days"])
            return {"items": items, "revision": library_revision(coordinator.data)}
        case "sonarr":
            raw = await client.get_calendar(days=upcoming_data["days"])
            items = sorted(
                (slim_calendar_episode(episode) for episode in raw),
                key=lambda episode: episode.get("airDateUtc") or "",
            )
            return {"items": items, "revision": library_revision(coordinator.data)}
        case _ as unexpected:
            assert_never(unexpected)


async def _release_search(
    client: Any, app: AppKind, data: dict[str, Any]
) -> dict[str, Any]:
    match app:
        case "sonarr":
            releases = await client.series_releases(int(data["series_id"]))
            return {"releases": releases}
        case "radarr":
            releases = await client.movie_search_manual(int(data["movie_id"]))
            return {"releases": releases}
        case _ as unexpected:
            assert_never(unexpected)


async def _retry_import(
    client: Any, app: AppKind, data: dict[str, Any]
) -> dict[str, Any]:
    match app:
        case "radarr":
            return await async_retry_movie_import(client, data)
        case "sonarr":
            return await async_retry_series_import(client, data)
        case _ as unexpected:
            assert_never(unexpected)
