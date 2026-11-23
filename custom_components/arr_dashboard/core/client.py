"""Base async HTTP client for Arr backends."""

from __future__ import annotations

import logging
import re
from typing import Any

import aiohttp
from homeassistant.helpers.aiohttp_client import async_get_clientsession

from ..const import MIN_ARR_VERSION

_LOGGER = logging.getLogger(__name__)


class ArrClientError(Exception):
    """Base client error."""


class ArrCannotConnect(ArrClientError):
    """Connection failed."""


class ArrInvalidAuth(ArrClientError):
    """Authentication failed."""


class ArrNotFound(ArrClientError):
    """Resource not found."""


class ArrWrongApp(ArrClientError):
    """Server appName does not match the selected Arr app."""


def parse_arr_version(version: str) -> tuple[int, ...]:
    """Parse a Servarr version string into a comparable tuple."""
    match = re.match(r"^(\d+)\.(\d+)\.(\d+)", version)
    if not match:
        return (0, 0, 0)
    return tuple(int(part) for part in match.groups())


async def async_validate_arr_status(
    client: ArrClientBase,
    *,
    expected_app: str,
    min_version: tuple[int, ...] = MIN_ARR_VERSION,
) -> dict[str, Any]:
    """Check auth, appName, and minimum version via system status."""
    try:
        status = await client.get("/api/v3/system/status")
    except ArrInvalidAuth:
        raise
    except Exception as err:
        raise ArrCannotConnect(str(err)) from err
    app_name = str(status.get("appName") or "")
    if app_name.lower() != expected_app.lower():
        reported = app_name or "an unknown app"
        raise ArrWrongApp(
            f"{expected_app} was selected but the server reports {reported}"
        )
    version = parse_arr_version(str(status.get("version") or "0.0.0"))
    if version < min_version:
        raise ArrClientError(
            f"{expected_app} version {status.get('version')} is below 4.0.0"
        )
    return status


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
                allow_redirects=False,
            ) as resp:
                if resp.status in (301, 302, 303, 307, 308):
                    raise ArrClientError("Redirects are not allowed")
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

    async def fetch_poster_bytes(self, media_id: int) -> tuple[bytes, str]:
        """Fetch poster bytes from mediacover without exposing the API key."""
        session = async_get_clientsession(self._hass, verify_ssl=self._verify_ssl)
        url = f"{self._base_url}/api/v3/mediacover/{media_id}/poster.jpg"
        async with session.get(
            url,
            headers=self._headers(),
            timeout=aiohttp.ClientTimeout(total=30),
            allow_redirects=False,
        ) as resp:
            if resp.status != 200:
                raise ArrClientError(f"Poster fetch failed: HTTP {resp.status}")
            content_type = resp.headers.get("Content-Type", "image/jpeg")
            return await resp.read(), content_type