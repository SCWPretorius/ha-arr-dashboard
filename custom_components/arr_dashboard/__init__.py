"""The Arr Dashboard integration."""

from __future__ import annotations

import logging
from datetime import timedelta
from pathlib import Path

from homeassistant.components.frontend import add_extra_js_url
from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import CONF_API_KEY, CONF_URL, Platform
from homeassistant.core import HomeAssistant
from homeassistant.helpers import config_validation as cv

from .const import CONF_POLL_INTERVAL, CONF_VERIFY_SSL, DEFAULT_POLL_INTERVAL, DOMAIN
from .radarr.client import RadarrClient
from .radarr.coordinator import RadarrDataUpdateCoordinator
from .views import ArrDashboardPosterView
from .websocket_api import async_register_websocket_handlers

_LOGGER = logging.getLogger(__name__)

PLATFORMS: list[Platform] = [Platform.SENSOR]

CARD_URL = "/arr_dashboard/frontend/arr-dashboard-card.js"
CARD_JS_REGISTERED = "arr_dashboard_card_js_registered"

CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)


async def async_setup(hass: HomeAssistant, _config: dict | None = None) -> bool:
    """Set up the Arr Dashboard integration."""
    hass.data.setdefault(DOMAIN, {})
    async_register_websocket_handlers(hass)
    if hass.http:
        hass.http.register_view(ArrDashboardPosterView())
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

    frontend_dir = Path(__path__[0]) / "frontend"
    card_js = frontend_dir / "arr-dashboard-card.js"
    if card_js.is_file() and hass.http:
        await hass.http.async_register_static_paths(
            [
                StaticPathConfig(
                    "/arr_dashboard/frontend",
                    str(frontend_dir),
                    cache_headers=True,
                )
            ]
        )
        hass.data[CARD_JS_REGISTERED] = True
        if "frontend_extra_module_url" in hass.data:
            add_extra_js_url(hass, CARD_URL)

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