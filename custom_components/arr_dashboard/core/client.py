"""Base async HTTP client for Arr backends."""

from __future__ import annotations

import logging
from typing import Any

import aiohttp
from homeassistant.helpers.aiohttp_client import async_get_clientsession

_LOGGER = logging.getLogger(__name__)


class ArrClientError(Exception):
    """Base client error."""


class ArrCannotConnect(ArrClientError):
    """Connection failed."""


class ArrInvalidAuth(ArrClientError):
    """Authentication failed."""


class ArrNotFound(ArrClientError):
    """Resource not found."""


class ArrClientBase:
    """Shared aiohttp client wrapper; never logs the API key."""

    def __init__(
        self,
        hass: Any,
        base_url: str,
        api_key: str,
        verify_ssl: bool,
    ) -> None:
        self._hass = hass
        self._base_url = base_url.rstrip("/")
        self._api_key = api_key
        self._verify_ssl = verify_ssl

    @property
    def base_url(self) -> str:
        return self._base_url

    def _headers(self) -> dict[str, str]:
        return {"X-Api-Key": self._api_key, "Accept": "application/json"}

    async def request(
        self,
        method: str,
        path: str,
        *,
        params: dict[str, Any] | None = None,
        json: dict[str, Any] | list[Any] | None = None,
    ) -> Any:
        """Perform an HTTP request against the Arr API."""
        session = async_get_clientsession(self._hass, verify_ssl=self._verify_ssl)
        url = f"{self._base_url}{path}"
        try:
            async with session.request(
                method,
                url,
                headers=self._headers(),
                params=params,
                json=json,
                timeout=aiohttp.ClientTimeout(total=30),
            ) as resp:
                if resp.status == 401:
                    raise ArrInvalidAuth
                if resp.status == 404:
                    raise ArrNotFound
                if resp.status >= 400:
                    text = await resp.text()
                    _LOGGER.debug(
                        "Arr API error %s %s: %s",
                        method,
                        path,
                        text[:500],
                    )
                    raise ArrClientError(text or f"HTTP {resp.status}")
                if resp.status == 204:
                    return None
                return await resp.json()
        except aiohttp.ClientError as err:
            raise ArrCannotConnect(str(err)) from err

    async def get(self, path: str, *, params: dict[str, Any] | None = None) -> Any:
        return await self.request("GET", path, params=params)

    async def post(
        self,
        path: str,
        *,
        json: dict[str, Any] | list[Any] | None = None,
        params: dict[str, Any] | None = None,
    ) -> Any:
        return await self.request("POST", path, json=json, params=params)

    async def put(self, path: str, *, json: dict[str, Any] | None = None) -> Any:
        return await self.request("PUT", path, json=json)

    async def delete(self, path: str, *, params: dict[str, Any] | None = None) -> Any:
        return await self.request("DELETE", path, params=params)