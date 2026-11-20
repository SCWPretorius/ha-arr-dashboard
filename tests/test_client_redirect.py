"""HTTP client security tests."""

from __future__ import annotations

import inspect
from unittest.mock import MagicMock, patch

import pytest

from custom_components.arr_dashboard.core.client import ArrClientBase, ArrClientError


def test_request_disables_redirects() -> None:
    source = inspect.getsource(ArrClientBase.request)
    assert "allow_redirects=False" in source


@pytest.mark.asyncio
async def test_redirect_response_raises_without_following() -> None:
    captured: dict = {}

    class FakeResp:
        status = 302

        async def __aenter__(self):
            return self

        async def __aexit__(self, *args):
            return None

        async def text(self):
            return ""

    class FakeSession:
        def request(self, *args, **kwargs):
            captured.update(kwargs)
            return FakeResp()

    hass = MagicMock()
    with patch(
        "custom_components.arr_dashboard.core.client.async_get_clientsession",
        return_value=FakeSession(),
    ):
        client = ArrClientBase(hass, "http://radarr.local:7878", "secret", True)
        with pytest.raises(ArrClientError, match="Redirect"):
            await client.get("/api/v3/system/status")

    assert captured.get("allow_redirects") is False