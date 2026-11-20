"""Integration helpers."""

from __future__ import annotations

from homeassistant.core import HomeAssistant

from .const import DOMAIN
from .radarr.client import RadarrClient
from .radarr.coordinator import RadarrDataUpdateCoordinator


def get_coordinator_for_entry(
    hass: HomeAssistant, entry_id: str
) -> RadarrDataUpdateCoordinator | None:
    entry = hass.data.get(DOMAIN, {}).get(entry_id)
    if not entry:
        return None
    return entry.get("coordinator")


def get_radarr_client(hass: HomeAssistant, entry_id: str) -> RadarrClient | None:
    entry = hass.data.get(DOMAIN, {}).get(entry_id)
    if not entry:
        return None
    return entry.get("client")