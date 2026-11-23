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

from .const import (
    APP_RADARR,
    APP_SONARR,
    CONF_APP,
    CONF_POLL_INTERVAL,
    CONF_VERIFY_SSL,
    DEFAULT_POLL_INTERVAL,
    DOMAIN,
    AppKind,
)
from .core.client import ArrCannotConnect, ArrClientError, ArrInvalidAuth, ArrWrongApp
from .helpers import app_display_name, build_arr_client, stored_app

_LOGGER = logging.getLogger(__name__)

_APP_OPTIONS = {APP_RADARR: "Radarr", APP_SONARR: "Sonarr"}


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
        self._app: AppKind = APP_RADARR
        self._url: str | None = None
        self._api_key: str | None = None
        self._verify_ssl: bool = True
        self._name: str | None = None

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        if user_input is not None:
            self._app = stored_app(user_input[CONF_APP])
            return await self.async_step_connection()

        schema = vol.Schema(
            {vol.Required(CONF_APP, default=APP_RADARR): vol.In(_APP_OPTIONS)}
        )
        return self.async_show_form(step_id="user", data_schema=schema)

    async def async_step_connection(
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

                client = build_arr_client(
                    self.hass,
                    self._app,
                    url,
                    self._api_key or "",
                    self._verify_ssl,
                )
                error = await self._async_validate(client)
                if error:
                    errors["base"] = error
                else:
                    return self.async_create_entry(
                        title=self._name or app_display_name(self._app),
                        data={
                            CONF_APP: self._app,
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
        return self.async_show_form(
            step_id="connection",
            data_schema=schema,
            errors=errors,
            description_placeholders={"app_name": app_display_name(self._app)},
        )

    async def async_step_reauth(
        self, entry_data: dict[str, Any] | None = None
    ) -> FlowResult:
        return await self.async_step_reauth_confirm()

    async def async_step_reauth_confirm(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        errors: dict[str, str] = {}
        entry = self._get_reauth_entry()
        app = stored_app(entry.data.get(CONF_APP))
        if user_input is not None:
            api_key = user_input[CONF_API_KEY]
            client = build_arr_client(
                self.hass,
                app,
                entry.data[CONF_URL],
                api_key,
                entry.data.get(CONF_VERIFY_SSL, True),
            )
            error = await self._async_validate(client)
            if error:
                errors["base"] = error
            else:
                new_data = {**entry.data, CONF_API_KEY: api_key}
                self.hass.config_entries.async_update_entry(entry, data=new_data)
                await self.hass.config_entries.async_reload(entry.entry_id)
                return self.async_abort(reason="reauth_successful")

        schema = vol.Schema({vol.Required(CONF_API_KEY): str})
        return self.async_show_form(
            step_id="reauth_confirm",
            data_schema=schema,
            errors=errors,
            description_placeholders={"app_name": app_display_name(app)},
        )

    async def _async_validate(self, client: Any) -> str | None:
        try:
            await client.validate_connection()
        except ArrInvalidAuth:
            return "invalid_auth"
        except ArrWrongApp:
            return "wrong_app"
        except ArrCannotConnect:
            return "cannot_connect"
        except ArrClientError as err:
            if "below 4" in str(err):
                return "old_version"
            return "cannot_connect"
        except Exception:
            _LOGGER.exception("Unexpected error during config flow")
            return "unknown"
        return None


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
