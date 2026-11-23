"""Ziwei Doushu models."""
from __future__ import annotations

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class ZiweiCalculationRequest(BaseModel):
    calendar_type: str = Field(default="solar", description="solar | lunar")
    birth_time: str = Field(..., min_length=10, description="YYYY-MM-DD HH:MM")
    gender: str = Field(..., description="男 | 女")
    is_leap_month: bool = Field(default=False)
    late_zi_rule: str = Field(default="next_day", description="next_day | same_day")
    leap_month_rule: str = Field(default="split_15", description="split_15 | current | next")
    query_year: Optional[int] = Field(default=None, description="Năm lưu niên muốn xem (ví dụ 2026)")
    profile_id: Optional[str] = None
    profile_name: Optional[str] = None


class ZiweiInterpretationRequest(BaseModel):
    calculation_result: Dict[str, Any]
    user_query: ZiweiCalculationRequest
    focus_topic: Optional[str] = Field(default="Tổng quan", description="Tổng quan | Sự nghiệp | Tài vận | Tình duyên | Lưu niên")
    output_style: str = Field(default="detailed", description="direct | detailed")
