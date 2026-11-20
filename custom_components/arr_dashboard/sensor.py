"""Sensors for Arr Dashboard."""

from __future__ import annotations

from homeassistant.components.sensor import SensorEntity, SensorStateClass
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity import EntityCategory
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import DOMAIN
from .radarr.coordinator import RadarrDataUpdateCoordinator


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    coordinator: RadarrDataUpdateCoordinator = hass.data[DOMAIN][entry.entry_id][
        "coordinator"
    ]
    async_add_entities(
        [
            ArrQueueCountSensor(coordinator, entry),
            ArrHealthSensor(coordinator, entry),
        ]
    )


class ArrQueueCountSensor(CoordinatorEntity, SensorEntity):
    """Active download queue count."""

    _attr_state_class = SensorStateClass.MEASUREMENT
    _attr_icon = "mdi:download"

    def __init__(
        self,
        coordinator: RadarrDataUpdateCoordinator,
        entry: ConfigEntry,
    ) -> None:
        super().__init__(coordinator)
        self._attr_unique_id = f"{entry.entry_id}_queue_count"
        self._attr_name = f"{entry.title} queue"
        self._attr_device_info = {"identifiers": {(DOMAIN, entry.entry_id)}}

    @property
    def native_value(self) -> int:
        return self.coordinator.data.queue_count


class ArrHealthSensor(CoordinatorEntity, SensorEntity):
    """Radarr health summary."""

    _attr_icon = "mdi:heart-pulse"
    _attr_entity_category = EntityCategory.DIAGNOSTIC

    def __init__(
        self,
        coordinator: RadarrDataUpdateCoordinator,
        entry: ConfigEntry,
    ) -> None:
        super().__init__(coordinator)
        self._attr_unique_id = f"{entry.entry_id}_health"
        self._attr_name = f"{entry.title} health"
        self._attr_device_info = {"identifiers": {(DOMAIN, entry.entry_id)}}

    @property
    def native_value(self) -> str:
        issues = [
            h
            for h in self.coordinator.data.health
            if h.get("type") in ("warning", "error")
        ]
        if not self.coordinator.data.reachable:
            return "offline"
        return "healthy" if not issues else f"{len(issues)} issue(s)"