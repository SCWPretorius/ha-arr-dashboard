"""Config flow tests."""

from __future__ import annotations

from homeassistant import config_entries
from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.arr_dashboard.const import DOMAIN


async def test_config_flow_success(hass: HomeAssistant, aioresponses) -> None:
    aioresponses.get(
        "http://radarr.local:7878/api/v3/system/status",
        payload={"version": "5.0.0.0"},
    )
    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_USER}
    )
    assert result["type"] == "form"
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


async def test_config_flow_auth_fail(hass: HomeAssistant, aioresponses) -> None:
    aioresponses.get(
        "http://radarr.local:7878/api/v3/system/status",
        status=401,
    )
    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_USER}
    )
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"],
        {
            "url": "http://radarr.local:7878",
            "api_key": "bad",
            "verify_ssl": True,
        },
    )
    assert result["errors"]["base"] == "invalid_auth"


async def test_config_flow_old_version(hass: HomeAssistant, aioresponses) -> None:
    aioresponses.get(
        "http://radarr.local:7878/api/v3/system/status",
        payload={"version": "3.2.2.1780"},
    )
    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_USER}
    )
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"],
        {
            "url": "http://radarr.local:7878",
            "api_key": "key",
            "verify_ssl": True,
        },
    )
    assert result["errors"]["base"] == "old_version"


async def test_config_flow_ssl_connect(hass: HomeAssistant, aioresponses) -> None:
    aioresponses.get(
        "https://radarr.local:7878/api/v3/system/status",
        payload={"version": "4.7.5.0"},
    )
    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_USER}
    )
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"],
        {
            "url": "https://radarr.local:7878",
            "api_key": "key",
            "verify_ssl": False,
        },
    )
    assert result["type"] == "create_entry"


async def test_options_flow(hass: HomeAssistant) -> None:
    entry = MockConfigEntry(domain=DOMAIN, data={"url": "http://x", "api_key": "k"})
    entry.add_to_hass(hass)
    result = await hass.config_entries.options.async_init(entry.entry_id)
    result = await hass.config_entries.options.async_configure(
        result["flow_id"], {"poll_interval": 15}
    )
    assert result["type"] == "create_entry"
    assert entry.options["poll_interval"] == 15