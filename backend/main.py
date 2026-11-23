"""Main FastAPI application for Numerology App."""
from __future__ import annotations

import os
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any, Dict, List

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.config import BASE_DIR, GEMINI_API_KEY, OPENAI_API_KEY
from backend.models.bazi import (
    BaziCalculationRequest,
    BaziInterpretationRequest,
    CrossCheckRequest,
)
from backend.models.profile import (
    Profile,
    ProfileCreate,
    ProfileUpdate,
    ReadingHistoryItem,
)
from backend.models.qimen import (
    QimenCalculationRequest,
    QimenInterpretationRequest,
)
from backend.models.ziwei import (
    ZiweiCalculationRequest,
    ZiweiInterpretationRequest,
)
from backend.services.ai_interpreter import (
    interpret_bazi,
    interpret_cross_check,
    interpret_qimen,
    interpret_ziwei,
)
from backend.services.bazi_calc import build_bazi_output
from backend.services.qimen_service import calculate_qimen
from backend.services.storage import (
    add_history,
    create_profile,
    delete_history,
    delete_profile,
    get_profile,
    init_db,
    list_history,
    list_profiles,
    update_profile,
)
from backend.services.ziwei_service import calculate_ziwei


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database on startup
    init_db()
    yield


app = FastAPI(
    title="Huyền Học Ba Hệ Thống (Kỳ Môn - Tử Vi - Bát Tự)",
    description="Backend API tính toán xác thực & luận giải huyền học theo quy chuẩn.",
    version="1.0.0",
    lifespan=lifespan,
)

# Enable CORS for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_no_cache_for_html_and_sw(request, call_next):
    response = await call_next(request)
    if request.url.path in ("/", "/index.html", "/sw.js"):
        response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
        response.headers["Pragma"] = "no-cache"
        response.headers["Expires"] = "0"
    return response


# --- HEALTH CHECK ---
@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "has_gemini_key": bool(GEMINI_API_KEY),
        "has_openai_key": bool(OPENAI_API_KEY),
        "version": "1.0.0",
    }


# --- PROFILES CRUD ---
@app.get("/api/profiles", response_model=List[Dict[str, Any]])
def get_all_profiles():
    return list_profiles()


@app.post("/api/profiles", status_code=status.HTTP_201_CREATED)
def create_new_profile(profile_data: ProfileCreate):
    try:
        return create_profile(profile_data.model_dump())
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/profiles/{profile_id}")
def get_single_profile(profile_id: str):
    p = get_profile(profile_id)
    if not p:
        raise HTTPException(status_code=404, detail="Không tìm thấy hồ sơ")
    return p


@app.put("/api/profiles/{profile_id}")
def update_existing_profile(profile_id: str, profile_data: ProfileUpdate):
    p = update_profile(profile_id, profile_data.model_dump())
    if not p:
        raise HTTPException(status_code=404, detail="Không tìm thấy hồ sơ")
    return p


@app.delete("/api/profiles/{profile_id}")
def delete_existing_profile(profile_id: str):
    success = delete_profile(profile_id)
    if not success:
        raise HTTPException(status_code=404, detail="Không tìm thấy hồ sơ")
    return {"message": "Đã xóa hồ sơ thành công"}


# --- CALCULATION ENDPOINTS ---
@app.post("/api/calc/qimen")
def api_calculate_qimen(req: QimenCalculationRequest):
    try:
        return calculate_qimen(req.model_dump())
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi kỹ thuật khi tính Kỳ Môn: {str(e)}")


@app.post("/api/calc/ziwei")
def api_calculate_ziwei(req: ZiweiCalculationRequest):
    try:
        return calculate_ziwei(req.model_dump())
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi kỹ thuật khi tính Tử Vi: {str(e)}")


@app.post("/api/calc/bazi")
def api_calculate_bazi(req: BaziCalculationRequest):
    try:
        return build_bazi_output(req.model_dump())
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi kỹ thuật khi tính Bát Tự: {str(e)}")


# --- AI INTERPRETATION ENDPOINTS ---
@app.post("/api/interpret/qimen")
async def api_interpret_qimen(req: QimenInterpretationRequest):
    try:
        # Guardrail: Check calculation result
        if not req.calculation_result or "chart" not in req.calculation_result:
            raise HTTPException(status_code=400, detail="Thiếu dữ liệu tính toán bàn cờ hợp lệ.")
        reading = await interpret_qimen(req.calculation_result, req.user_query.model_dump())
        return {"interpretation": reading}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi khi luận giải Kỳ Môn: {str(e)}")


@app.post("/api/interpret/ziwei")
async def api_interpret_ziwei(req: ZiweiInterpretationRequest):
    try:
        # Guardrail: Check self_check
        chart = req.calculation_result.get("chart", {})
        self_check = chart.get("self_check", {})
        if self_check and not self_check.get("passed", True):
            raise HTTPException(
                status_code=400,
                detail="Lá số Tử Vi không vượt qua tự kiểm tra kỹ thuật (self_check), chặn luận giải.",
            )
        reading = await interpret_ziwei(req.calculation_result, req.user_query.model_dump())
        return {"interpretation": reading}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi khi luận giải Tử Vi: {str(e)}")


@app.post("/api/interpret/bazi")
async def api_interpret_bazi(req: BaziInterpretationRequest):
    try:
        if not req.calculation_result or "four_pillars" not in req.calculation_result:
            raise HTTPException(status_code=400, detail="Thiếu dữ liệu Tứ Trụ hợp lệ.")
        reading = await interpret_bazi(req.calculation_result, req.user_query.model_dump())
        return {"interpretation": reading}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi khi luận giải Bát Tự: {str(e)}")


@app.post("/api/interpret/cross-check")
async def api_interpret_cross_check(req: CrossCheckRequest):
    try:
        reading = await interpret_cross_check(
            req.bazi_data,
            req.ziwei_data,
            req.profile_name,
            req.focus_topic or "Đối chiếu bản mệnh",
        )
        return {"interpretation": reading}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi khi đối chiếu chéo: {str(e)}")


# --- READING HISTORY ---
@app.get("/api/history")
def get_reading_history():
    return list_history(limit=50)


@app.post("/api/history", status_code=status.HTTP_201_CREATED)
def save_reading_to_history(item: Dict[str, Any]):
    try:
        return add_history(item)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.delete("/api/history/{history_id}")
def delete_reading_history_item(history_id: str):
    success = delete_history(history_id)
    if not success:
        raise HTTPException(status_code=404, detail="Không tìm thấy mục lịch sử")
    return {"message": "Đã xóa mục lịch sử thành công"}


# Mount frontend static files if built
frontend_dist = BASE_DIR / "frontend" / "dist"
if frontend_dist.exists():
    app.mount("/", StaticFiles(directory=str(frontend_dist), html=True), name="frontend")
