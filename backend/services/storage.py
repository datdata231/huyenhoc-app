"""SQLite storage service for User Profiles and Reading History."""
import json
import sqlite3
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

from backend.config import DB_PATH


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    conn = get_connection()
    with conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS profiles (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                gender TEXT NOT NULL,
                calendar_type TEXT NOT NULL,
                birth_time TEXT NOT NULL,
                is_leap_month INTEGER NOT NULL DEFAULT 0,
                city TEXT NOT NULL DEFAULT 'Ho Chi Minh City',
                timezone TEXT NOT NULL DEFAULT 'Asia/Ho_Chi_Minh',
                late_zi_rule TEXT NOT NULL DEFAULT 'same_day',
                leap_month_rule TEXT NOT NULL DEFAULT 'split_15',
                notes TEXT DEFAULT '',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS reading_history (
                id TEXT PRIMARY KEY,
                profile_id TEXT,
                profile_name TEXT,
                system TEXT NOT NULL,
                title TEXT NOT NULL,
                query_summary TEXT NOT NULL,
                chart_data TEXT NOT NULL,
                interpretation TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
        """)
    conn.close()


def list_profiles() -> List[Dict[str, Any]]:
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM profiles ORDER BY updated_at DESC")
    rows = cur.fetchall()
    conn.close()
    return [
        {
            "id": r["id"],
            "name": r["name"],
            "gender": r["gender"],
            "calendar_type": r["calendar_type"],
            "birth_time": r["birth_time"],
            "is_leap_month": bool(r["is_leap_month"]),
            "city": r["city"],
            "timezone": r["timezone"],
            "late_zi_rule": r["late_zi_rule"],
            "leap_month_rule": r["leap_month_rule"],
            "notes": r["notes"] or "",
            "created_at": r["created_at"],
            "updated_at": r["updated_at"],
        }
        for r in rows
    ]


def get_profile(profile_id: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM profiles WHERE id = ?", (profile_id,))
    r = cur.fetchone()
    conn.close()
    if not r:
        return None
    return {
        "id": r["id"],
        "name": r["name"],
        "gender": r["gender"],
        "calendar_type": r["calendar_type"],
        "birth_time": r["birth_time"],
        "is_leap_month": bool(r["is_leap_month"]),
        "city": r["city"],
        "timezone": r["timezone"],
        "late_zi_rule": r["late_zi_rule"],
        "leap_month_rule": r["leap_month_rule"],
        "notes": r["notes"] or "",
        "created_at": r["created_at"],
        "updated_at": r["updated_at"],
    }


def create_profile(data: Dict[str, Any]) -> Dict[str, Any]:
    profile_id = str(uuid.uuid4())
    now = datetime.now().isoformat()
    conn = get_connection()
    with conn:
        conn.execute(
            """
            INSERT INTO profiles (
                id, name, gender, calendar_type, birth_time, is_leap_month,
                city, timezone, late_zi_rule, leap_month_rule, notes,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                profile_id,
                data["name"],
                data.get("gender", "男"),
                data.get("calendar_type", "solar"),
                data["birth_time"],
                1 if data.get("is_leap_month") else 0,
                data.get("city", "Ho Chi Minh City"),
                data.get("timezone", "Asia/Ho_Chi_Minh"),
                data.get("late_zi_rule", "same_day"),
                data.get("leap_month_rule", "split_15"),
                data.get("notes", ""),
                now,
                now,
            ),
        )
    conn.close()
    return get_profile(profile_id)  # type: ignore


def update_profile(profile_id: str, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    now = datetime.now().isoformat()
    conn = get_connection()
    with conn:
        conn.execute(
            """
            UPDATE profiles SET
                name = ?, gender = ?, calendar_type = ?, birth_time = ?,
                is_leap_month = ?, city = ?, timezone = ?, late_zi_rule = ?,
                leap_month_rule = ?, notes = ?, updated_at = ?
            WHERE id = ?
            """,
            (
                data["name"],
                data.get("gender", "男"),
                data.get("calendar_type", "solar"),
                data["birth_time"],
                1 if data.get("is_leap_month") else 0,
                data.get("city", "Ho Chi Minh City"),
                data.get("timezone", "Asia/Ho_Chi_Minh"),
                data.get("late_zi_rule", "same_day"),
                data.get("leap_month_rule", "split_15"),
                data.get("notes", ""),
                now,
                profile_id,
            ),
        )
    conn.close()
    return get_profile(profile_id)


def delete_profile(profile_id: str) -> bool:
    conn = get_connection()
    with conn:
        cur = conn.execute("DELETE FROM profiles WHERE id = ?", (profile_id,))
        count = cur.rowcount
    conn.close()
    return count > 0


def list_history(limit: int = 50) -> List[Dict[str, Any]]:
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM reading_history ORDER BY created_at DESC LIMIT ?", (limit,))
    rows = cur.fetchall()
    conn.close()
    result = []
    for r in rows:
        try:
            chart_data = json.loads(r["chart_data"])
        except Exception:
            chart_data = {}
        result.append({
            "id": r["id"],
            "profile_id": r["profile_id"],
            "profile_name": r["profile_name"],
            "system": r["system"],
            "title": r["title"],
            "query_summary": r["query_summary"],
            "chart_data": chart_data,
            "interpretation": r["interpretation"],
            "created_at": r["created_at"],
        })
    return result


def add_history(item: Dict[str, Any]) -> Dict[str, Any]:
    hist_id = str(uuid.uuid4())
    now = datetime.now().isoformat()
    chart_json = json.dumps(item.get("chart_data", {}), ensure_ascii=False)
    conn = get_connection()
    with conn:
        conn.execute(
            """
            INSERT INTO reading_history (
                id, profile_id, profile_name, system, title, query_summary, chart_data, interpretation, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                hist_id,
                item.get("profile_id"),
                item.get("profile_name", ""),
                item.get("system", "unknown"),
                item.get("title", ""),
                item.get("query_summary", ""),
                chart_json,
                item.get("interpretation", ""),
                now,
            ),
        )
    conn.close()
    return {
        "id": hist_id,
        "profile_id": item.get("profile_id"),
        "profile_name": item.get("profile_name"),
        "system": item.get("system"),
        "title": item.get("title"),
        "query_summary": item.get("query_summary"),
        "chart_data": item.get("chart_data"),
        "interpretation": item.get("interpretation"),
        "created_at": now,
    }


def delete_history(history_id: str) -> bool:
    conn = get_connection()
    with conn:
        cur = conn.execute("DELETE FROM reading_history WHERE id = ?", (history_id,))
        count = cur.rowcount
    conn.close()
    return count > 0


# Ensure tables are initialized on import
init_db()

