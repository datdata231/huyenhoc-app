"""Bazi (Four Pillars) models."""
from __future__ import annotations

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class BaziCalculationRequest(BaseModel):
    calendar_type: str = Field(default="solar", description="solar | lunar")
    birth_time: str = Field(..., min_length=10, description="YYYY-MM-DD HH:MM")
    gender: str = Field(default="男", description="男 | 女")
    is_leap_month: bool = Field(default=False)
    late_zi_rule: str = Field(default="same_day", description="same_day | next_day")
    city: Optional[str] = Field(default="Ho Chi Minh City")
    profile_id: Optional[str] = None
    profile_name: Optional[str] = None


class BaziInterpretationRequest(BaseModel):
    calculation_result: Dict[str, Any]
    user_query: BaziCalculationRequest
    focus_topic: Optional[str] = Field(default="Tổng quan", description="Tổng quan | Sự nghiệp | Tài vận | Tình cảm | Đại vận")
    output_style: str = Field(default="detailed", description="direct | detailed")


class CrossCheckRequest(BaseModel):
    bazi_data: Dict[str, Any]
    ziwei_data: Dict[str, Any]
    profile_name: str
    focus_topic: Optional[str] = "Đối chiếu bản mệnh và vận trình tương lai"
