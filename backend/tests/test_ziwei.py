"""Unit tests for Ziwei Doushu Calculation."""
import pytest
from backend.services.ziwei_service import calculate_ziwei


def test_ziwei_calculation_success():
    req = {
        "calendar_type": "solar",
        "birth_time": "1995-10-10 14:30",
        "gender": "男",
        "is_leap_month": False,
        "late_zi_rule": "next_day",
        "leap_month_rule": "split_15",
        "query_year": 2026,
    }
    result = calculate_ziwei(req)
    assert "chart" in result
    chart = result["chart"]
    assert "ming_gong" in chart
    assert "shen_gong" in chart
    assert "wuxing_ju" in chart
    assert "palaces" in chart
    assert len(chart["palaces"]) == 12
    assert chart["self_check"]["passed"] is True
    assert "horoscope" in result
    assert result["horoscope"]["query_lunar_year"] == 2026
    assert "yearly" in result["horoscope"]
    assert "decadal" in result["horoscope"]


def test_ziwei_missing_fields_validation():
    with pytest.raises(ValueError, match="Thiếu thông tin ngày giờ sinh"):
        calculate_ziwei({"birth_time": "", "gender": "男"})

    with pytest.raises(ValueError, match="Thiếu thông tin giới tính"):
        calculate_ziwei({"birth_time": "1990-01-01 12:00", "gender": ""})
