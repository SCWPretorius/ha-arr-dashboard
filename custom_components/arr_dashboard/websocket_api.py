"""WebSocket API for the Arr Dashboard card (no admin required)."""

from __future__ import annotations

import logging
from typing import Any

import voluptuous as vol
from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback

from .const import WS_TYPE_ARR_DASHBOARD
from .core.client import ArrNotFound
from .helpers import get_coordinator_for_entry, get_radarr_client

_LOGGER = logging.getLogger(__name__)


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
        entry_id = msg["entry_id"]
        command = msg["command"]
        data = msg.get("data") or {}

        coordinator = get_coordinator_for_entry(hass, entry_id)
        if not coordinator:
            connection.send_error(msg["id"], "not_found", "Unknown instance")
            return

        client = get_radarr_client(hass, entry_id)
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
    match command:
        case "get_state":
            cd = coordinator.data
            return {
                "reachable": cd.reachable,
                "movies": cd.movies,
                "queue": cd.queue,
                "queue_count": cd.queue_count,
                "health": cd.health,
                "disk_space": cd.disk_space,
                "root_folders": cd.root_folders,
                "quality_profiles": cd.quality_profiles,
                "system": cd.system,
                "last_success": (
                    cd.last_success.isoformat() if cd.last_success else None
                ),
            }
        case "lookup":
            return {"results": await client.lookup(data["term"])}
        case "add_movie":
            from .radarr.actions import async_add_movie

            movie = await async_add_movie(client, data)
            await coordinator.async_request_refresh()
            return {"movie": movie}
        case "movie_search":
            await client.release_search(int(data["movie_id"]))
            return {"ok": True}
        case "release_search":
            releases = await client.movie_search_manual(int(data["movie_id"]))
            return {"releases": releases}
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
            from .radarr.actions import async_retry_import

            return await async_retry_import(client, data)
        case "delete_file_redownload":
            from .radarr.actions import async_delete_file_redownload

            await async_delete_file_redownload(client, data)
            await coordinator.async_request_refresh()
            return {"ok": True}
        case "remove_movie":
            await client.delete_movie(
                int(data["movie_id"]),
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
        case "get_movie":
            movie = await client.get_movie(int(data["movie_id"]))
            history = await client.get_history_grabbed(movie["id"])
            return {"movie": movie, "grabbed_history": history}
        case "refresh":
            await coordinator.async_request_refresh()
            return {"ok": True}
        case _:
            raise ValueError(f"Unknown command: {command}")