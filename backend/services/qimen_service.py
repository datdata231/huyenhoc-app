"""Qimen Dunjia Calculation Service.

Wraps vendor/Numerologist_skills/qimen-dunjia/scripts/qimen_cli.py directly.
"""
from __future__ import annotations

import json
import sys
from datetime import datetime
from pathlib import Path
from typing import Any, Dict

from backend.config import VENDOR_DIR

# Import qimen_cli directly
qimen_scripts_dir = VENDOR_DIR / "qimen-dunjia" / "scripts"
if str(qimen_scripts_dir) not in sys.path:
    sys.path.insert(0, str(qimen_scripts_dir))

import qimen_cli  # type: ignore


def calculate_qimen(payload: Dict[str, Any]) -> Dict[str, Any]:
    """Calculate Qimen Dunjia chart payload.

    Raises ValueError on invalid input or calculation errors.
    """
    # Validate required fields
    question_type = str(payload.get("question_type", "")).strip()
    question_goal = str(payload.get("question_goal", "")).strip()
    if not question_type:
        raise ValueError("Chưa nhập lĩnh vực cần xem (question_type)")
    if not question_goal:
        raise ValueError("Chưa nhập mục tiêu cần phán đoán cụ thể (question_goal)")

    # Prepare input for qimen_cli
    time_input = payload.get("time_input", "")
    calendar_type = payload.get("calendar_type", "now")
    if calendar_type == "now" or not time_input:
        calendar_type = "now"
        time_input = "now"

    location_data = payload.get("location") or {}
    country = location_data.get("country", "Vietnam")
    city = location_data.get("city", "Ho Chi Minh City")
    timezone = location_data.get("timezone", "Asia/Ho_Chi_Minh")

    cli_payload = {
        "question_type": question_type,
        "question_goal": question_goal,
        "time_input": time_input,
        "calendar_type": calendar_type,
        "location": {
            "country": country,
            "city": city,
            "timezone": timezone,
        },
        "ruleset": payload.get("ruleset", "mainline-cn-v1"),
    }

    try:
        output = qimen_cli.build_output(cli_payload)
        if "error" in output:
            raise ValueError(f"Lỗi tính toán Kỳ Môn: {output['error']}")
        return output
    except Exception as exc:
        raise ValueError(f"Lỗi khi lập bàn Kỳ Môn: {str(exc)}")
