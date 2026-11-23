"""Ziwei Doushu Calculation Service.

Wraps vendor/Numerologist_skills/ziwei-doushu/scripts/ziwei_cli.py directly.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any, Dict

from backend.config import VENDOR_DIR

# Import ziwei_cli directly
ziwei_scripts_dir = VENDOR_DIR / "ziwei-doushu" / "scripts"
if str(ziwei_scripts_dir) not in sys.path:
    sys.path.insert(0, str(ziwei_scripts_dir))

import ziwei_cli  # type: ignore


def calculate_ziwei(payload: Dict[str, Any]) -> Dict[str, Any]:
    """Calculate Ziwei Doushu chart payload.

    Raises ValueError on validation failure or self-check error.
    """
    birth_time = str(payload.get("birth_time", "")).strip()
    if not birth_time:
        raise ValueError("Thiếu thông tin ngày giờ sinh (birth_time)")

    gender_raw = str(payload.get("gender", "")).strip()
    if not gender_raw:
        raise ValueError("Thiếu thông tin giới tính (gender)")
    if gender_raw in ("男", "male", "nam", "1", 1):
        gender = "男"
    elif gender_raw in ("女", "female", "nu", "nữ", "0", 0):
        gender = "女"
    else:
        gender = gender_raw

    calendar_type = str(payload.get("calendar_type", "solar")).lower()
    is_leap_month = bool(payload.get("is_leap_month", False))
    late_zi_rule = str(payload.get("late_zi_rule", "next_day")).lower()
    leap_month_rule = str(payload.get("leap_month_rule", "split_15")).lower()

    cli_payload: Dict[str, Any] = {
        "calendar_type": calendar_type,
        "birth_time": birth_time,
        "is_leap_month": is_leap_month,
        "gender": gender,
        "late_zi_rule": late_zi_rule,
        "leap_month_rule": leap_month_rule,
    }

    query_year = payload.get("query_year")
    if query_year not in (None, ""):
        cli_payload["query_year"] = int(query_year)

    try:
        output = ziwei_cli.build_output(cli_payload)
        if "error" in output:
            raise ValueError(f"Lỗi tính toán Tử Vi: {output['error']}")

        # Guardrail: Check self_check from chart
        chart = output.get("chart", {})
        self_check = chart.get("self_check", {})
        if self_check and not self_check.get("passed", True):
            reasons = ", ".join(self_check.get("reasons", ["Tự kiểm tra lá số không hợp lệ"]))
            raise ValueError(f"Lá số Tử Vi không vượt qua tự kiểm tra kỹ thuật (self_check): {reasons}")

        return output
    except Exception as exc:
        raise ValueError(f"Lỗi khi lập bàn Tử Vi: {str(exc)}")
