"""The Arr Dashboard integration."""

from __future__ import annotations

import json
import logging
from datetime import timedelta
from pathlib import Path

from homeassistant.components.frontend import DATA_EXTRA_MODULE_URL, add_extra_js_url
from homeassistant.components.http import StaticPathConfig
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


async def _async_register_lovelace_module(hass: HomeAssistant) -> None:
    lovelace = hass.data.get("lovelace")
    if not lovelace or lovelace.mode != "storage":
        return
    resources = lovelace.resources
    if not resources.loaded:
        return
    for item in resources.async_items():
        url = str(item.get("url", ""))
        if CARD_PATH in url:
            if url != CARD_MODULE_URL:
                await resources.async_update_item(item["id"], {"url": CARD_MODULE_URL})
            return
    await resources.async_create_item({"res_type": "module", "url": CARD_MODULE_URL})


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

    try:
        await _async_register_lovelace_module(hass)
    except Exception:  # noqa: BLE001
        _LOGGER.debug("Could not register Lovelace resource for Arr Dashboard card")

    hass.data[CARD_JS_REGISTERED] = True
    _LOGGER.debug("Registered Arr Dashboard card module at %s", CARD_MODULE_URL)


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