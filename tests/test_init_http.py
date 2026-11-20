"""Integration HTTP registration in tests."""

from __future__ import annotations

from pathlib import Path

from homeassistant.core import HomeAssistant


def test_no_pytest_branch_in_init() -> None:
    root = Path(__file__).resolve().parents[1]
    init_py = root / "custom_components/arr_dashboard/__init__.py"
    source = init_py.read_text(encoding="utf-8")
    assert "PYTEST_CURRENT_TEST" not in source


async def test_poster_view_registered_on_domain_setup(hass: HomeAssistant) -> None:
    from homeassistant.components import http as http_cmp

    from custom_components.arr_dashboard import async_setup

    await http_cmp.async_setup(hass, {})
    assert await async_setup(hass)

    routes = [str(r.resource) for r in hass.http.app.router.routes()]
    assert any("arr_dashboard" in r and "poster" in r for r in routes)


async def test_card_js_registered_after_homeassistant_started(
    hass: HomeAssistant,
) -> None:
    from homeassistant.components import http as http_cmp
    from homeassistant.components.frontend import DATA_EXTRA_MODULE_URL, UrlManager

    from custom_components.arr_dashboard import (
        CARD_JS_REGISTERED,
        CARD_PATH,
        _async_register_card,
        async_setup,
    )

    await http_cmp.async_setup(hass, {})
    hass.data[DATA_EXTRA_MODULE_URL] = UrlManager(lambda *_args: None, [])
    assert await async_setup(hass)
    await _async_register_card(hass)

    assert hass.data.get(CARD_JS_REGISTERED)
    assert any(CARD_PATH in url for url in hass.data[DATA_EXTRA_MODULE_URL].urls)