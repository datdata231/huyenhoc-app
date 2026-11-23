"""Integration tests for FastAPI endpoints."""
import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def test_health_endpoint():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ok"


def test_profile_crud():
    # 1. Create
    profile_payload = {
        "name": "Trần Văn A",
        "gender": "男",
        "calendar_type": "solar",
        "birth_time": "1992-06-15 08:30",
        "is_leap_month": False,
        "city": "Hà Nội",
        "timezone": "Asia/Ho_Chi_Minh",
        "late_zi_rule": "same_day",
        "leap_month_rule": "split_15",
        "notes": "Kiểm tra test",
    }
    create_res = client.post("/api/profiles", json=profile_payload)
    assert create_res.status_code == 201
    profile = create_res.json()
    profile_id = profile["id"]
    assert profile["name"] == "Trần Văn A"

    # 2. Get
    get_res = client.get(f"/api/profiles/{profile_id}")
    assert get_res.status_code == 200
    assert get_res.json()["city"] == "Hà Nội"

    # 3. Update
    profile_payload["name"] = "Trần Văn A Updated"
    update_res = client.put(f"/api/profiles/{profile_id}", json=profile_payload)
    assert update_res.status_code == 200
    assert update_res.json()["name"] == "Trần Văn A Updated"

    # 4. Delete
    del_res = client.delete(f"/api/profiles/{profile_id}")
    assert del_res.status_code == 200


def test_api_calc_endpoints():
    # Qimen
    qimen_res = client.post("/api/calc/qimen", json={
        "question_type": "Kinh doanh",
        "question_goal": "Có thuận lợi mở cửa hàng không",
        "calendar_type": "solar",
        "time_input": "2026-11-23 10:30",
    })
    assert qimen_res.status_code == 200
    assert "chart" in qimen_res.json()

    # Ziwei
    ziwei_res = client.post("/api/calc/ziwei", json={
        "calendar_type": "solar",
        "birth_time": "1995-10-10 14:30",
        "gender": "男",
        "query_year": 2026,
    })
    assert ziwei_res.status_code == 200
    assert "chart" in ziwei_res.json()

    # Bazi
    bazi_res = client.post("/api/calc/bazi", json={
        "calendar_type": "solar",
        "birth_time": "1995-10-10 14:30",
        "gender": "男",
    })
    assert bazi_res.status_code == 200
    assert "four_pillars" in bazi_res.json()


def test_api_interpret_endpoints():
    # Test Bazi interpretation endpoint with calculated data
    bazi_calc = client.post("/api/calc/bazi", json={
        "calendar_type": "solar",
        "birth_time": "1995-10-10 14:30",
        "gender": "男",
    }).json()

    interpret_res = client.post("/api/interpret/bazi", json={
        "calculation_result": bazi_calc,
        "user_query": {
            "calendar_type": "solar",
            "birth_time": "1995-10-10 14:30",
            "gender": "男",
        },
        "focus_topic": "Tổng quan",
    })
    assert interpret_res.status_code == 200
    assert "interpretation" in interpret_res.json()
    assert len(interpret_res.json()["interpretation"]) > 50


def test_history_crud():
    hist_payload = {
        "profile_name": "Test User",
        "system": "qimen",
        "title": "Kỳ Môn Test",
        "query_summary": "Tóm tắt xem việc",
        "chart_data": {"sample": 123},
        "interpretation": "Nội dung bài giải",
    }
    save_res = client.post("/api/history", json=hist_payload)
    assert save_res.status_code == 201
    hist_id = save_res.json()["id"]

    list_res = client.get("/api/history")
    assert list_res.status_code == 200
    assert any(h["id"] == hist_id for h in list_res.json())

    del_res = client.delete(f"/api/history/{hist_id}")
    assert del_res.status_code == 200
