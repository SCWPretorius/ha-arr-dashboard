"""Sonarr config flow."""

from __future__ import annotations

from unittest.mock import AsyncMock

from homeassistant import config_entries
from homeassistant.config_entries import ConfigEntryState
from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.arr_dashboard.const import DOMAIN

SONARR = "http://sonarr.local:8989"


async def _remove_created_entries(hass: HomeAssistant) -> None:
    for entry in list(hass.config_entries.async_entries(DOMAIN)):
        if entry.state == ConfigEntryState.LOADED:
            await hass.config_entries.async_unload(entry.entry_id)
        await hass.config_entries.async_remove(entry.entry_id)
    await hass.async_block_till_done()


async def _connection_step(hass: HomeAssistant, app: str):
    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_USER}
    )
    assert result["step_id"] == "user"
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], {"app": app}
    )
    assert result["step_id"] == "connection"
    return result


async def test_config_flow_sonarr_success(
    hass: HomeAssistant, aioclient_mock, monkeypatch
) -> None:
    aioclient_mock.get(
        f"{SONARR}/api/v3/system/status",
        json={"appName": "Sonarr", "version": "4.0.9.2244"},
    )
    monkeypatch.setattr(
        hass.config_entries, "async_setup", AsyncMock(return_value=True)
    )

    result = await _connection_step(hass, "sonarr")
    assert result["description_placeholders"]["app_name"] == "Sonarr"
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"],
        {
            "url": SONARR,
            "api_key": "key",
            "verify_ssl": True,
            "name": "Sonarr",
        },
    )
    assert result["type"] == "create_entry"
    assert result["title"] == "Sonarr"
    assert result["data"]["app"] == "sonarr"
    assert result["data"]["url"] == SONARR
    assert result["data"]["api_key"] == "key"
    await _remove_created_entries(hass)


async def test_config_flow_sonarr_wrong_app(
    hass: HomeAssistant, aioclient_mock
) -> None:
    aioclient_mock.get(
        f"{SONARR}/api/v3/system/status",
        json={"appName": "Radarr", "version": "5.0.0.0"},
    )
    result = await _connection_step(hass, "sonarr")
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"],
        {"url": SONARR, "api_key": "key", "verify_ssl": True},
    )
    assert result["errors"]["base"] == "wrong_app"


async def test_config_flow_radarr_rejects_sonarr(
    hass: HomeAssistant, aioclient_mock
) -> None:
    aioclient_mock.get(
        f"{SONARR}/api/v3/system/status",
        json={"appName": "Sonarr", "version": "4.0.9.2244"},
    )
    result = await _connection_step(hass, "radarr")
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"],
        {"url": SONARR, "api_key": "key", "verify_ssl": True},
    )
    assert result["errors"]["base"] == "wrong_app"


async def test_config_flow_sonarr_version_below_4(
    hass: HomeAssistant, aioclient_mock
) -> None:
    aioclient_mock.get(
        f"{SONARR}/api/v3/system/status",
        json={"appName": "Sonarr", "version": "3.0.10.1567"},
    )
    result = await _connection_step(hass, "sonarr")
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"],
        {"url": SONARR, "api_key": "key", "verify_ssl": True},
    )
    assert result["errors"]["base"] == "old_version"


async def test_reauth_uses_stored_sonarr_app(
    hass: HomeAssistant, aioclient_mock, monkeypatch
) -> None:
    aioclient_mock.get(
        f"{SONARR}/api/v3/system/status",
        json={"appName": "Sonarr", "version": "4.0.4.0"},
    )
    monkeypatch.setattr(
        hass.config_entries, "async_reload", AsyncMock(return_value=True)
    )
    entry = MockConfigEntry(
        domain=DOMAIN,
        data={
            "app": "sonarr",
            "url": SONARR,
            "api_key": "old",
            "verify_ssl": True,
            "name": "Sonarr",
        },
        title="Sonarr",
        unique_id=SONARR,
    )
    entry.add_to_hass(hass)
    result = await hass.config_entries.flow.async_init(
        DOMAIN,
        context={
            "source": config_entries.SOURCE_REAUTH,
            "entry_id": entry.entry_id,
            "unique_id": entry.unique_id,
        },
        data=entry.data,
    )
    assert result["step_id"] == "reauth_confirm"
    assert result["description_placeholders"]["app_name"] == "Sonarr"
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], {"api_key": "new-key"}
    )
    assert result["type"] == "abort"
    assert result["reason"] == "reauth_successful"
    assert entry.data["api_key"] == "new-key"
    assert entry.data["app"] == "sonarr"
