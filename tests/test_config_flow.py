"""Config flow tests."""

from __future__ import annotations

from unittest.mock import AsyncMock

from homeassistant import config_entries
from homeassistant.config_entries import ConfigEntryState
from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.arr_dashboard.const import DOMAIN
from custom_components.arr_dashboard.core.client import (
    ArrCannotConnect,
    ArrClientError,
    ArrInvalidAuth,
)
from custom_components.arr_dashboard.radarr.client import RadarrClient


async def _choose_app(hass: HomeAssistant, flow_id: str, app: str = "radarr"):
    result = await hass.config_entries.flow.async_configure(flow_id, {"app": app})
    assert result["type"] == "form"
    assert result["step_id"] == "connection"
    return result


async def _remove_created_entries(hass: HomeAssistant) -> None:
    for entry in list(hass.config_entries.async_entries(DOMAIN)):
        if entry.state == ConfigEntryState.LOADED:
            await hass.config_entries.async_unload(entry.entry_id)
        await hass.config_entries.async_remove(entry.entry_id)
    await hass.async_block_till_done()


async def test_config_flow_success(hass: HomeAssistant, monkeypatch) -> None:
    async def validate(_self: RadarrClient) -> dict:
        return {"version": "5.0.0.0"}

    monkeypatch.setattr(RadarrClient, "validate_connection", validate)
    monkeypatch.setattr(
        hass.config_entries,
        "async_setup",
        AsyncMock(return_value=True),
    )

    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_USER}
    )
    assert result["type"] == "form"
    assert result["step_id"] == "user"
    result = await _choose_app(hass, result["flow_id"])
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"],
        {
            "url": "http://radarr.local:7878",
            "api_key": "key",
            "verify_ssl": True,
            "name": "Radarr",
        },
    )
    assert result["type"] == "create_entry"
    assert result["title"] == "Radarr"
    assert result["data"]["app"] == "radarr"
    await _remove_created_entries(hass)


async def test_config_flow_auth_fail(hass: HomeAssistant, monkeypatch) -> None:
    async def validate(_self: RadarrClient) -> dict:
        raise ArrInvalidAuth

    monkeypatch.setattr(RadarrClient, "validate_connection", validate)

    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_USER}
    )
    result = await _choose_app(hass, result["flow_id"])
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"],
        {
            "url": "http://radarr.local:7878",
            "api_key": "bad",
            "verify_ssl": True,
        },
    )
    assert result["errors"]["base"] == "invalid_auth"


async def test_config_flow_old_version(hass: HomeAssistant, monkeypatch) -> None:
    async def validate(_self: RadarrClient) -> dict:
        raise ArrClientError("Radarr version 3.0.0 is below 4.0.0")

    monkeypatch.setattr(RadarrClient, "validate_connection", validate)

    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_USER}
    )
    result = await _choose_app(hass, result["flow_id"])
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"],
        {
            "url": "http://radarr.local:7878",
            "api_key": "key",
            "verify_ssl": True,
        },
    )
    assert result["errors"]["base"] == "old_version"


async def test_config_flow_ssl_connect(hass: HomeAssistant, monkeypatch) -> None:
    async def validate(_self: RadarrClient) -> dict:
        return {"version": "4.7.5.0"}

    monkeypatch.setattr(RadarrClient, "validate_connection", validate)
    monkeypatch.setattr(
        hass.config_entries,
        "async_setup",
        AsyncMock(return_value=True),
    )

    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_USER}
    )
    result = await _choose_app(hass, result["flow_id"])
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"],
        {
            "url": "https://radarr.local:7878",
            "api_key": "key",
            "verify_ssl": False,
        },
    )
    assert result["type"] == "create_entry"
    await _remove_created_entries(hass)


async def test_config_flow_cannot_connect(hass: HomeAssistant, monkeypatch) -> None:
    async def validate(_self: RadarrClient) -> dict:
        raise ArrCannotConnect("timeout")

    monkeypatch.setattr(RadarrClient, "validate_connection", validate)

    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_USER}
    )
    result = await _choose_app(hass, result["flow_id"])
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"],
        {
            "url": "http://radarr.local:7878",
            "api_key": "key",
            "verify_ssl": True,
        },
    )
    assert result["errors"]["base"] == "cannot_connect"


async def test_options_flow(hass: HomeAssistant) -> None:
    entry = MockConfigEntry(domain=DOMAIN, data={"url": "http://x", "api_key": "k"})
    entry.add_to_hass(hass)
    result = await hass.config_entries.options.async_init(entry.entry_id)
    result = await hass.config_entries.options.async_configure(
        result["flow_id"], {"poll_interval": 15}
    )
    assert result["type"] == "create_entry"
    assert entry.options["poll_interval"] == 15