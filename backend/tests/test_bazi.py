"""Unit tests for Bazi (Four Pillars) Calculation."""
import pytest
from backend.services.bazi_calc import build_bazi_output


def test_bazi_calculation_success():
    req = {
        "calendar_type": "solar",
        "birth_time": "1995-10-10 14:30",
        "gender": "男",
        "late_zi_rule": "same_day",
    }
    result = build_bazi_output(req)
    assert "four_pillars" in result
    fp = result["four_pillars"]
    assert "year" in fp
    assert "month" in fp
    assert "day" in fp
    assert "hour" in fp

    assert fp["year"]["ganzhi"] == "乙亥"
    assert fp["month"]["ganzhi"] == "丙戌"
    assert fp["day"]["ganzhi"] == "甲戌"
    assert fp["hour"]["ganzhi"] == "辛未"

    assert "day_master" in result
    assert result["day_master"]["stem"] == "甲"
    assert result["day_master"]["vn"] == "Giáp"

    assert "dayun" in result
    assert len(result["dayun"]["pillars"]) > 0
    assert result["dayun"]["is_forward"] is False  # Âm nam (Ất Hợi) -> nghịch hành

    assert "wuxing_counts" in result
    assert "interactions" in result


def test_bazi_late_zi_rule():
    # 23:30 test
    req_same = {
        "calendar_type": "solar",
        "birth_time": "1995-10-10 23:30",
        "gender": "男",
        "late_zi_rule": "same_day",
    }
    res_same = build_bazi_output(req_same)

    req_next = {
        "calendar_type": "solar",
        "birth_time": "1995-10-10 23:30",
        "gender": "男",
        "late_zi_rule": "next_day",
    }
    res_next = build_bazi_output(req_next)

    # same_day day pillar is 甲戌, next_day day pillar is 乙亥
    assert res_same["four_pillars"]["day"]["ganzhi"] == "甲戌"
    assert res_next["four_pillars"]["day"]["ganzhi"] == "乙亥"


def test_bazi_missing_birth_time():
    with pytest.raises(ValueError, match="Thiếu trường bắt buộc"):
        build_bazi_output({"birth_time": "", "gender": "男"})
