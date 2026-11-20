"""The Arr Dashboard integration."""

from __future__ import annotations

import json
import logging
from datetime import timedelta
from pathlib import Path
from typing import Any

from homeassistant.components.frontend import DATA_EXTRA_MODULE_URL, add_extra_js_url
from homeassistant.components.http import StaticPathConfig
from homeassistant.components.lovelace.const import MODE_STORAGE
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import (
    CONF_API_KEY,
    CONF_URL,
    EVENT_HOMEASSISTANT_STARTED,
    Platform,
)
from homeassistant.core import HomeAssistant
from homeassistant.helpers import config_validation as cv

from .const import CONF_POLL_INTERVAL, CONF_VERIFY_SSL, DEFAULT_POLL_INTERVAL, DOMAIN
from .radarr.client import RadarrClient
from .radarr.coordinator import RadarrDataUpdateCoordinator
from .views import ArrDashboardPosterView
from .websocket_api import async_register_websocket_handlers

_LOGGER = logging.getLogger(__name__)

PLATFORMS: list[Platform] = [Platform.SENSOR]

CARD_PATH = "/arr_dashboard/frontend/arr-dashboard-card.js"
_MANIFEST = json.loads(
    (Path(__file__).parent / "manifest.json").read_text(encoding="utf-8")
)
CARD_MODULE_URL = f"{CARD_PATH}?v={_MANIFEST['version']}"
CARD_JS_REGISTERED = "arr_dashboard_card_js_registered"

CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)


def _lovelace_resource_mode(lovelace: Any) -> str | None:
    """Resource mode for Lovelace (storage vs yaml), across HA versions."""
    if lovelace is None:
        return None
    if isinstance(lovelace, dict):
        return lovelace.get("mode")
    mode = getattr(lovelace, "resource_mode", None)
    if mode is not None:
        return mode
    return getattr(lovelace, "mode", None)


def _lovelace_resources(lovelace: Any) -> Any | None:
    if lovelace is None:
        return None
    if isinstance(lovelace, dict):
        return lovelace.get("resources")
    return getattr(lovelace, "resources", None)


async def _async_ensure_lovelace_resources(resources: Any) -> bool:
    """Load the resources collection when it is not ready yet."""
    if getattr(resources, "loaded", False):
        return True
    get_info = getattr(resources, "async_get_info", None)
    if callable(get_info):
        await get_info()
    return bool(getattr(resources, "loaded", False))


async def _async_register_lovelace_module(hass: HomeAssistant) -> bool:
    """Register or refresh the Lovelace module URL in storage mode."""
    lovelace = hass.data.get("lovelace")
    if _lovelace_resource_mode(lovelace) != MODE_STORAGE:
        return False
    resources = _lovelace_resources(lovelace)
    if resources is None:
        return False
    if not await _async_ensure_lovelace_resources(resources):
        return False
    for item in resources.async_items():
        url = str(item.get("url", ""))
        if CARD_PATH in url:
            if url != CARD_MODULE_URL:
                await resources.async_update_item(item["id"], {"url": CARD_MODULE_URL})
            return True
    await resources.async_create_item({"res_type": "module", "url": CARD_MODULE_URL})
    return True


async def _async_register_card(hass: HomeAssistant) -> None:
    if hass.data.get(CARD_JS_REGISTERED):
        return

    frontend_dir = Path(__path__[0]) / "frontend"
    card_js = frontend_dir / "arr-dashboard-card.js"
    if not card_js.is_file():
        _LOGGER.error("Arr Dashboard card bundle missing at %s", card_js)
        return
    if not hass.http:
        _LOGGER.warning("HTTP component not ready; skipping card registration")
        return

    try:
        await hass.http.async_register_static_paths(
            [
                StaticPathConfig(
                    "/arr_dashboard/frontend",
                    str(frontend_dir),
                    cache_headers=True,
                )
            ]
        )
    except ValueError:
        pass

    loaded_via_extra = False
    if DATA_EXTRA_MODULE_URL in hass.data:
        add_extra_js_url(hass, CARD_MODULE_URL)
        loaded_via_extra = True

    loaded_via_lovelace = False
    try:
        loaded_via_lovelace = await _async_register_lovelace_module(hass)
    except Exception:  # noqa: BLE001
        _LOGGER.debug(
            "Could not register Lovelace resource for Arr Dashboard card", exc_info=True
        )

    if loaded_via_extra or loaded_via_lovelace:
        hass.data[CARD_JS_REGISTERED] = True
        _LOGGER.debug("Registered Arr Dashboard card module at %s", CARD_MODULE_URL)
    else:
        _LOGGER.debug(
            "Arr Dashboard card module not loaded yet (frontend or resources pending)"
        )


def _schedule_card_registration(hass: HomeAssistant) -> None:
    async def _on_started(_event) -> None:
        await _async_register_card(hass)

    if hass.is_running:
        hass.async_create_task(_async_register_card(hass))
    else:
        hass.bus.async_listen_once(EVENT_HOMEASSISTANT_STARTED, _on_started)


async def async_setup(hass: HomeAssistant, _config: dict | None = None) -> bool:
    """Set up the Arr Dashboard integration."""
    hass.data.setdefault(DOMAIN, {})
    async_register_websocket_handlers(hass)
    if hass.http:
        hass.http.register_view(ArrDashboardPosterView())
    _schedule_card_registration(hass)
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Arr Dashboard from a config entry."""
    client = RadarrClient(
        hass,
        entry.data[CONF_URL],
        entry.data[CONF_API_KEY],
        entry.data.get(CONF_VERIFY_SSL, True),
    )
    coordinator = RadarrDataUpdateCoordinator(hass, client, entry)
    poll = entry.options.get(CONF_POLL_INTERVAL, DEFAULT_POLL_INTERVAL)
    coordinator.update_interval = timedelta(seconds=poll)

    await coordinator.async_config_entry_first_refresh()

    hass.data[DOMAIN][entry.entry_id] = {
        "client": client,
        "coordinator": coordinator,
    }

    if not hass.data.get(CARD_JS_REGISTERED):
        await _async_register_card(hass)

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    entry.async_on_unload(entry.add_update_listener(_async_update_listener))
    return True


async def _async_update_listener(hass: HomeAssistant, entry: ConfigEntry) -> None:
    coordinator = hass.data[DOMAIN][entry.entry_id]["coordinator"]
    poll = entry.options.get(CONF_POLL_INTERVAL, DEFAULT_POLL_INTERVAL)
    coordinator.update_interval = timedelta(seconds=poll)
    await coordinator.async_request_refresh()


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    data = hass.data.get(DOMAIN, {}).get(entry.entry_id)
    if data and (coordinator := data.get("coordinator")):
        unsub = getattr(coordinator, "_unsub_refresh", None)
        if callable(unsub):
            unsub()
    if unload_ok := await hass.config_entries.async_unload_platforms(entry, PLATFORMS):
        hass.data[DOMAIN].pop(entry.entry_id, None)
    return unload_ok