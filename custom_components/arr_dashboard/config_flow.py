"""Config flow for Arr Dashboard."""

from __future__ import annotations

import logging
from typing import Any
from urllib.parse import urlparse

import voluptuous as vol
from homeassistant import config_entries
from homeassistant.const import CONF_API_KEY, CONF_NAME, CONF_URL
from homeassistant.core import callback
from homeassistant.data_entry_flow import FlowResult

from .const import CONF_POLL_INTERVAL, CONF_VERIFY_SSL, DEFAULT_POLL_INTERVAL, DOMAIN
from .core.client import ArrCannotConnect, ArrClientError, ArrInvalidAuth
from .radarr.client import RadarrClient

_LOGGER = logging.getLogger(__name__)


def _valid_url(url: str) -> bool:
    parsed = urlparse(url)
    return parsed.scheme in ("http", "https") and bool(parsed.netloc)


class ArrDashboardConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for Arr Dashboard."""

    VERSION = 1

    @staticmethod
    @callback
    def async_get_options_flow(
        config_entry: config_entries.ConfigEntry,
    ) -> ArrDashboardOptionsFlow:
        return ArrDashboardOptionsFlow()

    def __init__(self) -> None:
        self._url: str | None = None
        self._api_key: str | None = None
        self._verify_ssl: bool = True
        self._name: str | None = None

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        errors: dict[str, str] = {}
        if user_input is not None:
            url = user_input[CONF_URL].strip().rstrip("/")
            if not _valid_url(url):
                errors["base"] = "invalid_url"
            else:
                self._url = url
                self._api_key = user_input[CONF_API_KEY]
                self._verify_ssl = user_input.get(CONF_VERIFY_SSL, True)
                self._name = user_input.get(CONF_NAME) or urlparse(url).hostname

                unique_id = url.lower()
                await self.async_set_unique_id(unique_id)
                self._abort_if_unique_id_configured()

                try:
                    client = RadarrClient(
                        self.hass, url, self._api_key, self._verify_ssl
                    )
                    await client.validate_connection()
                except ArrInvalidAuth:
                    errors["base"] = "invalid_auth"
                except ArrClientError as err:
                    if "below 4" in str(err):
                        errors["base"] = "old_version"
                    else:
                        errors["base"] = "cannot_connect"
                except ArrCannotConnect:
                    errors["base"] = "cannot_connect"
                except Exception:
                    _LOGGER.exception("Unexpected error during config flow")
                    errors["base"] = "unknown"
                else:
                    return self.async_create_entry(
                        title=self._name or "Radarr",
                        data={
                            CONF_URL: url,
                            CONF_API_KEY: self._api_key,
                            CONF_VERIFY_SSL: self._verify_ssl,
                            CONF_NAME: self._name,
                        },
                    )

        schema = vol.Schema(
            {
                vol.Required(CONF_URL): str,
                vol.Required(CONF_API_KEY): str,
                vol.Optional(CONF_VERIFY_SSL, default=True): bool,
                vol.Optional(CONF_NAME): str,
            }
        )
        return self.async_show_form(step_id="user", data_schema=schema, errors=errors)

    async def async_step_reauth(
        self, entry_data: dict[str, Any] | None = None
    ) -> FlowResult:
        return await self.async_step_reauth_confirm()

    async def async_step_reauth_confirm(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        errors: dict[str, str] = {}
        entry = self._get_reauth_entry()
        if user_input is not None:
            api_key = user_input[CONF_API_KEY]
            client = RadarrClient(
                self.hass,
                entry.data[CONF_URL],
                api_key,
                entry.data.get(CONF_VERIFY_SSL, True),
            )
            try:
                await client.validate_connection()
            except ArrInvalidAuth:
                errors["base"] = "invalid_auth"
            except (ArrCannotConnect, ArrClientError):
                errors["base"] = "cannot_connect"
            else:
                new_data = {**entry.data, CONF_API_KEY: api_key}
                self.hass.config_entries.async_update_entry(entry, data=new_data)
                await self.hass.config_entries.async_reload(entry.entry_id)
                return self.async_abort(reason="reauth_successful")

        schema = vol.Schema({vol.Required(CONF_API_KEY): str})
        return self.async_show_form(
            step_id="reauth_confirm", data_schema=schema, errors=errors
        )


class ArrDashboardOptionsFlow(config_entries.OptionsFlow):
    """Options flow handler."""

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        if user_input is not None:
            return self.async_create_entry(title="", data=user_input)

        current = self.config_entry.options.get(
            CONF_POLL_INTERVAL, DEFAULT_POLL_INTERVAL
        )
        schema = vol.Schema(
            {
                vol.Optional(CONF_POLL_INTERVAL, default=current): vol.All(
                    vol.Coerce(int), vol.Range(min=5, max=300)
                ),
            }
        )
        return self.async_show_form(step_id="init", data_schema=schema)