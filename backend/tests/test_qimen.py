"""Unit tests for Qimen Dunjia Calculation."""
import pytest
from backend.services.qimen_service import calculate_qimen


def test_qimen_calculation_success():
    req = {
        "question_type": "Sự nghiệp",
        "question_goal": "Có nên đổi việc tháng này không",
        "time_input": "2026-11-23 10:30",
        "calendar_type": "solar",
        "location": {
            "country": "Vietnam",
            "city": "Ho Chi Minh City",
            "timezone": "Asia/Ho_Chi_Minh",
        },
        "ruleset": "mainline-cn-v1",
    }
    result = calculate_qimen(req)
    assert "chart" in result
    chart = result["chart"]
    assert "dun_type" in chart
    assert "ju_number" in chart
    assert "zhifu" in chart
    assert "zhishi" in chart
    assert "palaces" in chart
    assert len(chart["palaces"]) == 9
    assert "warnings" in result


def test_qimen_missing_fields_validation():
    with pytest.raises(ValueError, match="Chưa nhập lĩnh vực"):
        calculate_qimen({"question_type": "", "question_goal": "test"})

    with pytest.raises(ValueError, match="Chưa nhập mục tiêu"):
        calculate_qimen({"question_type": "Tài vận", "question_goal": ""})
