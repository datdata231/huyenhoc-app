"""User profile and history data models."""
from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, Optional
from pydantic import BaseModel, Field


class ProfileBase(BaseModel):
    name: str = Field(..., min_length=1, description="Họ tên hoặc biệt danh")
    gender: str = Field(default="男", description="Giới tính: 男 (Nam) hoặc 女 (Nữ)")
    calendar_type: str = Field(default="solar", description="solar (Dương lịch) hoặc lunar (Âm lịch)")
    birth_time: str = Field(..., description="Thời gian sinh: YYYY-MM-DD HH:MM (chính xác đến phút)")
    is_leap_month: bool = Field(default=False, description="Có phải tháng nhuận âm lịch không")
    city: str = Field(default="Ho Chi Minh City", description="Thành phố sinh")
    timezone: str = Field(default="Asia/Ho_Chi_Minh", description="Múi giờ")
    late_zi_rule: str = Field(default="same_day", description="Khẩu kính Dạ Tý: same_day (23:00-00:00 ngày cũ) hoặc next_day (sang ngày mới)")
    leap_month_rule: str = Field(default="split_15", description="Khẩu kính tháng nhuận: split_15, current, next")
    notes: Optional[str] = Field(default="", description="Ghi chú thêm về bản mệnh")


class ProfileCreate(ProfileBase):
    pass


class ProfileUpdate(ProfileBase):
    pass


class Profile(ProfileBase):
    id: str
    created_at: str
    updated_at: str


class ReadingHistoryItem(BaseModel):
    id: str
    profile_id: Optional[str] = None
    profile_name: Optional[str] = None
    system: str  # 'qimen' | 'ziwei' | 'bazi' | 'cross_check'
    title: str
    query_summary: str
    chart_data: Dict[str, Any]
    interpretation: str
    created_at: str
