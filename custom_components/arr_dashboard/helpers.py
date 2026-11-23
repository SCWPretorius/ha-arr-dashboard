"""Integration helpers."""

from __future__ import annotations

from typing import assert_never

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .const import APP_RADARR, APP_SONARR, DOMAIN, AppKind
from .core.client import ArrClientBase
from .radarr.client import RadarrClient
from .radarr.coordinator import RadarrDataUpdateCoordinator
from .sonarr.client import SonarrClient
from .sonarr.coordinator import SonarrDataUpdateCoordinator

ArrCoordinator = RadarrDataUpdateCoordinator | SonarrDataUpdateCoordinator


def stored_app(raw: object) -> AppKind:
    """Resolve the entry app. Missing values stay Radarr."""
    if raw == APP_SONARR:
        return APP_SONARR
    return APP_RADARR


def app_display_name(app: AppKind) -> str:
    """User-facing product name for config-flow copy."""
    match app:
        case "radarr":
            return "Radarr"
        case "sonarr":
            return "Sonarr"
        case _ as unexpected:
            assert_never(unexpected)


def build_arr_client(
    hass: HomeAssistant,
    app: AppKind,
    url: str,
    api_key: str,
    verify_ssl: bool,
) -> ArrClientBase:
    """Build the client for a config entry."""
    match app:
        case "radarr":
            return RadarrClient(hass, url, api_key, verify_ssl)
        case "sonarr":
            return SonarrClient(hass, url, api_key, verify_ssl)
        case _ as unexpected:
            assert_never(unexpected)


def build_coordinator(
    hass: HomeAssistant,
    app: AppKind,
    client: ArrClientBase,
    entry: ConfigEntry,
) -> ArrCoordinator:
    """Build the coordinator that matches the entry app."""
    match app:
        case "radarr":
            if not isinstance(client, RadarrClient):
                raise TypeError("Radarr entries require a Radarr client")
            return RadarrDataUpdateCoordinator(hass, client, entry)
        case "sonarr":
            if not isinstance(client, SonarrClient):
                raise TypeError("Sonarr entries require a Sonarr client")
            return SonarrDataUpdateCoordinator(hass, client, entry)
        case _ as unexpected:
            assert_never(unexpected)


def get_coordinator_for_entry(
    hass: HomeAssistant, entry_id: str
) -> ArrCoordinator | None:
    entry = hass.data.get(DOMAIN, {}).get(entry_id)
    if not entry:
        return None
    return entry.get("coordinator")


def get_arr_client(hass: HomeAssistant, entry_id: str) -> ArrClientBase | None:
    entry = hass.data.get(DOMAIN, {}).get(entry_id)
    if not entry:
        return None
    client = entry.get("client")
    if isinstance(client, ArrClientBase):
        return client
    return None


def get_radarr_client(hass: HomeAssistant, entry_id: str) -> RadarrClient | None:
    client = get_arr_client(hass, entry_id)
    if isinstance(client, RadarrClient):
        return client
    return None
