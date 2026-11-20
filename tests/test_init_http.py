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