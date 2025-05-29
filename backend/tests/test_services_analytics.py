import pytest
from unittest.mock import AsyncMock, MagicMock
from app.services.analytics import AnalyticsService


def test_analytics_service_basic():
    service = AnalyticsService()
    assert hasattr(service, "__class__")


@pytest.mark.asyncio
async def test_get_dashboard_summary_returns_dict():
    mock_db = AsyncMock()

    # Create a helper to return an async scalar
    def make_scalar(val):
        async def scalar():
            return val

        return MagicMock(scalar=scalar)

    mock_db.execute.side_effect = [
        make_scalar(1),
        make_scalar(2),
        make_scalar(3),
        make_scalar(4.0),
        make_scalar(5.0),
    ]
    result = await AnalyticsService.get_dashboard_summary(mock_db)
    assert isinstance(result, dict)
    assert result == {
        "total_investors": 1,
        "total_schemes": 2,
        "total_investments": 3,
        "total_nav_units": 4.0,
        "total_nav_amount": 5.0,
    }
