"""HTTP views for poster proxy."""

from __future__ import annotations

import logging

from aiohttp import web
from homeassistant.components.http import HomeAssistantView

from .core.client import ArrClientError
from .helpers import get_arr_client

_LOGGER = logging.getLogger(__name__)


class ArrDashboardPosterView(HomeAssistantView):
    """Proxy posters without exposing the API key."""

    url = "/api/arr_dashboard/{entry_id}/poster/{movie_id}"
    name = "api:arr_dashboard:poster"
    requires_auth = True

    async def get(
        self, request: web.Request, entry_id: str, movie_id: str
    ) -> web.Response:
        hass = request.app["hass"]
        client = get_arr_client(hass, entry_id)
        if not client:
            raise web.HTTPNotFound()
        try:
            body, content_type = await client.fetch_poster_bytes(int(movie_id))
        except ArrClientError:
            raise web.HTTPNotFound() from None
        return web.Response(body=body, content_type=content_type)