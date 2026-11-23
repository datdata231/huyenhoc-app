"""Qimen Dunjia models."""
from __future__ import annotations

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class QimenLocation(BaseModel):
    country: str = "Vietnam"
    city: str = "Ho Chi Minh City"
    timezone: str = "Asia/Ho_Chi_Minh"


class QimenCalculationRequest(BaseModel):
    question_type: str = Field(..., min_length=1, description="Lĩnh vực xem: Sự nghiệp, Tài vận, Tình duyên, v.v.")
    question_goal: str = Field(..., min_length=1, description="Mục tiêu cụ thể: Thành không, Hướng nào, Giờ nào, v.v.")
    time_input: Optional[str] = Field(default="", description="Thời điểm起局 (YYYY-MM-DD HH:MM), để trống là 'ngay bây giờ'")
    calendar_type: str = Field(default="now", description="solar | lunar | now")
    location: Optional[QimenLocation] = Field(default_factory=QimenLocation)
    ruleset: str = Field(default="mainline-cn-v1")
    output_style: str = Field(default="detailed", description="direct (Kết luận thẳng) | detailed (Giải thích chi tiết)")
    user_gender: Optional[str] = Field(default=None, description="Giới tính người hỏi (nếu xem tình cảm)")
    target_gender: Optional[str] = Field(default=None, description="Giới tính đối phương (nếu xem tình cảm)")
    current_status: Optional[str] = Field(default="", description="Tiến độ hiện tại của việc")


class QimenInterpretationRequest(BaseModel):
    calculation_result: Dict[str, Any]
    user_query: QimenCalculationRequest
    profile_name: Optional[str] = "Đương số"
