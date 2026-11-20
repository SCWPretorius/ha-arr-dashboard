"""Queue client pagination."""

from __future__ import annotations

from unittest.mock import AsyncMock, MagicMock

from custom_components.arr_dashboard.radarr.client import RadarrClient


async def test_queue_fetches_all_pages() -> None:
    client = RadarrClient(MagicMock(), "http://radarr.local:7878", "k", True)
    page1 = {"records": [{"id": i} for i in range(1, 11)], "totalRecords": 15}
    page2 = {"records": [{"id": i} for i in range(11, 16)], "totalRecords": 15}
    client.get = AsyncMock(side_effect=[page1, page2])  # type: ignore[method-assign]
    result = await client.get_queue()
    assert len(result["records"]) == 15
    assert result["totalRecords"] == 15
    assert client.get.await_count == 2