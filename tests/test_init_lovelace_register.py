"""Lovelace and extra-js card registration (HA 2026.2 resource_mode compat)."""

from __future__ import annotations

from types import SimpleNamespace

from homeassistant.components import http as http_cmp
from homeassistant.components.frontend import DATA_EXTRA_MODULE_URL, UrlManager
from homeassistant.core import HomeAssistant

from custom_components.arr_dashboard import (
    CARD_JS_REGISTERED,
    CARD_MODULE_URL,
    CARD_PATH,
    _async_register_card,
    _async_register_lovelace_module,
    async_setup,
)


class MockLovelaceResources:
    """Minimal Lovelace resources collection."""

    def __init__(
        self,
        items: list[dict] | None = None,
        *,
        loaded: bool = True,
    ) -> None:
        self.loaded = loaded
        self._items = list(items or [])
        self.created: list[dict] = []
        self.updated: list[tuple[str, dict]] = []

    async def async_get_info(self) -> dict:
        self.loaded = True
        return {"resources": len(self._items)}

    def async_items(self) -> list[dict]:
        return self._items

    async def async_create_item(self, item: dict) -> dict:
        entry = {**item, "id": f"res-{len(self._items)}"}
        self._items.append(entry)
        self.created.append(item)
        return entry

    async def async_update_item(self, item_id: str, item: dict) -> None:
        self.updated.append((item_id, item))
        for row in self._items:
            if row.get("id") == item_id:
                row.update(item)


async def _prep(hass: HomeAssistant) -> None:
    await http_cmp.async_setup(hass, {})
    hass.data[DATA_EXTRA_MODULE_URL] = UrlManager(lambda *_a: None, [])
    assert await async_setup(hass)


async def test_storage_dict_creates_lovelace_resource(hass: HomeAssistant) -> None:
    await _prep(hass)
    resources = MockLovelaceResources()
    hass.data["lovelace"] = {"mode": "storage", "resources": resources}
    assert await _async_register_lovelace_module(hass) is True
    assert resources.created
    assert resources.created[0]["url"] == CARD_MODULE_URL


async def test_storage_resource_mode_object(hass: HomeAssistant) -> None:
    await _prep(hass)
    resources = MockLovelaceResources()
    hass.data["lovelace"] = SimpleNamespace(
        resource_mode="storage",
        resources=resources,
    )
    assert await _async_register_lovelace_module(hass) is True
    assert resources.created


async def test_storage_resources_load_before_read(hass: HomeAssistant) -> None:
    await _prep(hass)
    resources = MockLovelaceResources(loaded=False)
    hass.data["lovelace"] = {"mode": "storage", "resources": resources}
    assert await _async_register_lovelace_module(hass) is True
    assert resources.loaded
    assert resources.created


async def test_storage_updates_stale_resource_url(hass: HomeAssistant) -> None:
    await _prep(hass)
    stale = f"{CARD_PATH}?v=1.0.0"
    resources = MockLovelaceResources(
        [{"id": "r1", "url": stale, "res_type": "module"}],
    )
    hass.data["lovelace"] = {"mode": "storage", "resources": resources}
    assert await _async_register_lovelace_module(hass) is True
    assert resources.updated == [("r1", {"url": CARD_MODULE_URL})]
    assert not resources.created


async def test_storage_skips_when_resource_current(hass: HomeAssistant) -> None:
    await _prep(hass)
    resources = MockLovelaceResources(
        [{"id": "r1", "url": CARD_MODULE_URL, "res_type": "module"}],
    )
    hass.data["lovelace"] = {"mode": "storage", "resources": resources}
    assert await _async_register_lovelace_module(hass) is True
    assert not resources.created
    assert not resources.updated


async def test_yaml_mode_skips_lovelace_resource(hass: HomeAssistant) -> None:
    await _prep(hass)
    resources = MockLovelaceResources()
    hass.data["lovelace"] = {"mode": "yaml", "resources": resources}
    assert await _async_register_lovelace_module(hass) is False
    assert not resources.created


async def test_register_card_sets_flag_via_extra_js(hass: HomeAssistant) -> None:
    await _prep(hass)
    await _async_register_card(hass)
    assert hass.data.get(CARD_JS_REGISTERED)
    assert any(CARD_PATH in url for url in hass.data[DATA_EXTRA_MODULE_URL].urls)


async def test_register_card_defers_flag_without_load_path(hass: HomeAssistant) -> None:
    await http_cmp.async_setup(hass, {})
    assert await async_setup(hass)
    await _async_register_card(hass)
    assert not hass.data.get(CARD_JS_REGISTERED)
    hass.data[DATA_EXTRA_MODULE_URL] = UrlManager(lambda *_a: None, [])
    await _async_register_card(hass)
    assert hass.data.get(CARD_JS_REGISTERED)


async def test_legacy_lovelace_mode_attr(hass: HomeAssistant) -> None:
    await _prep(hass)
    resources = MockLovelaceResources()
    hass.data["lovelace"] = SimpleNamespace(mode="storage", resources=resources)
    assert await _async_register_lovelace_module(hass) is True
    assert resources.created