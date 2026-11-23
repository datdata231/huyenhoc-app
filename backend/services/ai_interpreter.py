"""AI Interpretation Service for Qimen, Ziwei, Bazi, and Cross-check.

Đọc trực tiếp SKILL.md và các tài liệu tham khảo trong vendor/Numerologist_skills/
để xây dựng System Prompt chuẩn xác, sau đó yêu cầu LLM luận giải bằng tiếng Việt.
Tự động chuyển dịch 100% thuật ngữ, cảnh báo, cách cục sang Tiếng Việt chuẩn mực.
"""
from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any, Dict, List, Optional
import httpx

from backend.config import (
    GEMINI_API_KEY,
    GEMINI_MODEL,
    OPENAI_API_KEY,
    OPENAI_BASE_URL,
    OPENAI_MODEL,
    VENDOR_DIR,
)

DISCLAIMER_QIMEN = (
    "\n\n---\n"
    "> **Lời nhắc quan trọng:** Kỳ Môn Độn Giáp thuộc hệ thống mô hình thuật số truyền thống phương Đông, "
    "được sử dụng nhằm hỗ trợ quan sát thời cơ và xu thế khách quan, không thay thế các ý kiến chuyên môn y tế, "
    "pháp luật, hay tài chính. Khi đưa ra các quyết định quan trọng, hãy luôn kết hợp dữ liệu thực tế để phán đoán lý tính."
)

DISCLAIMER_ZIWEI = (
    "\n\n---\n"
    "> **Lời nhắc quan trọng:** Tử Vi Đẩu Số thuộc hệ thống mệnh lý học truyền thống Á Đông, cung cấp góc nhìn "
    "tham chiếu về cấu trúc tính cách, ưu thế bẩm sinh và bài học cuộc đời. Lá số thể hiện khuynh hướng chứ không phải "
    "mệnh lệnh cố định bất biến; sự lựa chọn, môi trường tu dưỡng và hành động kiên trì của bản thân luôn đóng vai trò quyết định. "
    "Hãy luôn dựa trên điều kiện thực tế để hành động sáng suốt."
)

DISCLAIMER_BAZI = (
    "\n\n---\n"
    "> **Lời nhắc quan trọng:** Tứ Trụ Bát Tự là hệ thống mô hình ngũ hành sinh khắc truyền thống, cung cấp góc nhìn "
    "tự nhận thức về thế khí và chu kỳ vận hạn. Mệnh cục phản ánh khuynh hướng nền tảng, không phải định mệnh tuyệt đối; "
    "ý chí, học hỏi và việc thiện lành thực tế hoàn toàn có thể chuyển hóa vận trình."
)

# Từ điển Hán - Việt
STEM_VN = {
    "甲": "Giáp", "乙": "Ất", "丙": "Bính", "丁": "Đinh", "戊": "Mậu",
    "己": "Kỷ", "庚": "Canh", "辛": "Tân", "壬": "Nhâm", "癸": "Quý",
}

BRANCH_VN = {
    "子": "Tý", "丑": "Sửu", "寅": "Dần", "卯": "Mão", "辰": "Thìn", "巳": "Tỵ",
    "午": "Ngọ", "未": "Mùi", "申": "Thân", "酉": "Dậu", "戌": "Tuất", "亥": "Hợi",
}

STAR_VN = {
    "天蓬": "Thiên Bồng", "天任": "Thiên Nhậm", "天冲": "Thiên Xung",
    "天辅": "Thiên Phụ", "天英": "Thiên Anh", "天芮": "Thiên Nhuế",
    "天禽": "Thiên Cầm", "天柱": "Thiên Trụ", "天心": "Thiên Tâm",
}

DOOR_VN = {
    "休门": "Hưu Môn", "生门": "Sinh Môn", "伤门": "Thương Môn", "杜门": "Đỗ Môn",
    "景门": "Cảnh Môn", "死门": "Tử Môn", "惊门": "Kinh Môn", "开门": "Khai Môn",
}

GOD_VN = {
    "值符": "Trực Phù", "螣蛇": "Đằng Xà", "太阴": "Thái Âm", "六合": "Lục Hợp",
    "白虎": "Bạch Hổ", "玄武": "Huyền Vũ", "九地": "Cửu Địa", "九天": "Cửu Thiên",
}

PALACE_NUM_VN = {
    1: "Khảm (Cung 1 - Bắc)",
    2: "Khôn (Cung 2 - Tây Nam)",
    3: "Chấn (Cung 3 - Đông)",
    4: "Tốn (Cung 4 - Đông Nam)",
    5: "Trung Cung (Cung 5 - Giữa)",
    6: "Càn (Cung 6 - Tây Bắc)",
    7: "Đoài (Cung 7 - Tây)",
    8: "Cấn (Cung 8 - Đông Bắc)",
    9: "Ly (Cung 9 - Nam)",
}

PATTERN_VN = {
    "伏吟": "Phục Ngâm (Thế cờ trì trệ, nên án binh bất động, giữ nguyên hiện trạng)",
    "反吟": "Phản Ngâm (Thế cờ đảo lộn, biến động đột ngột, việc đi rồi lại về)",
    "门反吟": "Môn Phản Ngâm (Cửa xung đối, nội bộ xáo trộn, kế hoạch dễ thay đổi)",
    "星反吟": "Tinh Phản Ngâm (Sao xung đối, ngoại cảnh biến động, thời cơ đảo chiều)",
    "门迫": "Môn Bức (Cửa khắc cung, hao tổn sinh lực, hành động gặp lực cản)",
    "门受制": "Môn Thụ Chế (Cung khắc cửa, cửa bị kìm hãm, năng lực không phát huy được)",
    "三奇配吉门": "Tam Kỳ Phối Cát Môn (Cát cách: Cơ hội hanh thông, được quý nhân trợ giúp)",
    "值符得位": "Trực Phù Đắc Vị (Cát cách: Người chỉ huy vững vàng, nắm thế chủ động)",
    "青龙返首": "Thanh Long Phản Thủ (Đại cát: Mưu sự dễ thành, tài lộc danh vọng đều sáng)",
    "飞鸟跌穴": "Phi Điểu Điệt Huyệt (Đại cát: Chim bay về tổ, không nhọc công mà thu hái lớn)",
}


def to_ganzhi_vn(gz_str: str) -> str:
    """Chuyển chuỗi Can Chi Hán sang tiếng Việt (vd: 丙午 己亥 -> Bính Ngọ, Kỷ Hợi)."""
    if not gz_str:
        return ""
    words = gz_str.strip().split()
    results = []
    for w in words:
        if len(w) == 2:
            s_vn = STEM_VN.get(w[0], w[0])
            b_vn = BRANCH_VN.get(w[1], w[1])
            results.append(f"{s_vn} {b_vn} ({w})")
        else:
            results.append(w)
    return " • ".join(results)


def to_branch_list_vn(branches: List[str]) -> str:
    """Chuyển danh sách chi sang tiếng Việt (vd: ['辰', '巳'] -> Thìn, Tỵ)."""
    return ", ".join([f"{BRANCH_VN.get(b, b)} ({b})" for b in branches])


def translate_warning_text(w: str) -> str:
    """Dịch thông điệp cảnh báo kỹ thuật sang tiếng Việt chuẩn."""
    if "时干为甲，按旬首所遁之仪" in w:
        m = re.search(r"之仪\s*(\S+)\s*入盘", w)
        yi = m.group(1) if m else ""
        yi_vn = STEM_VN.get(yi, yi)
        return f"Can giờ là Giáp (trốn sau Tuần thủ), theo quy tắc độn giáp lấy ẩn can '{yi_vn} ({yi})' nhập bàn."
    if "本规则集中宫相关判断一律寄坤处理" in w:
        return "Quy chuẩn cố định: Mọi phán đoán liên quan đến Trung Cung (Cung 5) đều ký gửi về Khôn (Cung 2) xử lý."
    if "值使移宫落中五，按寄坤处理" in w:
        return "Trực Sử di chuyển rơi vào Trung Cung số 5, xử lý ký gửi sang Cung 2 (Khôn)."
    if "当前时间距离节令起点较近" in w or "属于节气边界附近" in w:
        return "Thời điểm này rất gần ranh giới giao Tiết Khí, độ chính xác của phút khởi sự rất quan trọng."
    if "距时辰交界不足 15 分钟" in w:
        return "Thời gian sinh cách ranh giới chuyển giờ dưới 15 phút, nếu giờ sinh có sai số có thể ảnh hưởng đến lá số."
    if "出生于 23 点后，已按次日子时排盘" in w:
        return "Sinh sau 23:00 (giờ Dạ Tý): Áp dụng quy chuẩn chuyển sang giờ Tý của ngày hôm sau."
    return w


def translate_pattern_detail(name: str, detail: str) -> str:
    """Dịch chi tiết cách cục sang tiếng Việt."""
    vn_name = PATTERN_VN.get(name, name)
    d_clean = detail
    if "回归本宫" in d_clean:
        star_raw = d_clean.replace("回归本宫", "").strip()
        star_vn = STAR_VN.get(star_raw, star_raw)
        return f"{vn_name}: Sao {star_vn} quy hồi bản cung (đắc thế vững vàng)"
    if "天地盘同为" in d_clean:
        stem = d_clean.replace("天地盘同为", "").strip()
        stem_vn = STEM_VN.get(stem, stem)
        return f"{vn_name}: Thiên bàn & Địa bàn đều là can {stem_vn} ({stem})"
    if "天地盘均为" in d_clean:
        stem = d_clean.replace("天地盘均为", "").strip()
        stem_vn = STEM_VN.get(stem, stem)
        return f"{vn_name}: Thiên bàn & Địa bàn đều là can {stem_vn} ({stem})"
    for ch, vn in STEM_VN.items():
        d_clean = d_clean.replace(ch, vn)
    for ch, vn in DOOR_VN.items():
        d_clean = d_clean.replace(ch, vn)
    return f"{vn_name}: {d_clean}"


def read_text_safe(path: Path) -> str:
    try:
        if path.exists():
            return path.read_text(encoding="utf-8")
    except Exception:
        pass
    return ""


def load_qimen_knowledge() -> str:
    skill = read_text_safe(VENDOR_DIR / "qimen-dunjia" / "SKILL.md")
    yongshen = read_text_safe(VENDOR_DIR / "qimen-dunjia" / "references" / "yongshen.md")
    ruleset = read_text_safe(VENDOR_DIR / "qimen-dunjia" / "references" / "ruleset-mainline.md")
    geju = read_text_safe(VENDOR_DIR / "qimen-dunjia" / "references" / "geju.md")
    return f"{skill}\n\n=== QUY TẮC DỤNG THẦN ===\n{yongshen}\n\n=== KHẨU KÍNH ĐỊNH BÀN ===\n{ruleset}\n\n=== CÁCH CỤC ===\n{geju}"


def load_ziwei_knowledge() -> str:
    skill = read_text_safe(VENDOR_DIR / "ziwei-doushu" / "SKILL.md")
    calc = read_text_safe(VENDOR_DIR / "ziwei-doushu" / "references" / "calculation.md")
    stars = read_text_safe(VENDOR_DIR / "ziwei-doushu" / "references" / "stars.md")
    sihua = read_text_safe(VENDOR_DIR / "ziwei-doushu" / "references" / "sihua.md")
    patterns = read_text_safe(VENDOR_DIR / "ziwei-doushu" / "references" / "patterns.md")
    return f"{skill}\n\n=== TÍNH TOÁN AN SAO ===\n{calc}\n\n=== ĐẶC TÍNH CHÍNH TINH ===\n{stars}\n\n=== TỨ HÓA ===\n{sihua}\n\n=== CÁCH CỤC ===\n{patterns}"


def load_bazi_knowledge() -> str:
    skill = read_text_safe(VENDOR_DIR / "bazi" / "SKILL.md")
    tiangan = read_text_safe(VENDOR_DIR / "bazi" / "references" / "tiangan-dizhi.md")
    template = read_text_safe(VENDOR_DIR / "bazi" / "references" / "prompt-template.md")
    return f"{skill}\n\n=== CAN CHI THẬP THẦN ===\n{tiangan}\n\n=== MẪU BÀI LUẬN ===\n{template}"


async def call_llm(system_prompt: str, user_content: str) -> Optional[str]:
    # 1. Try Gemini
    if GEMINI_API_KEY:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}"
            payload = {
                "contents": [
                    {
                        "role": "user",
                        "parts": [
                            {"text": f"HƯỚNG DẪN HỆ THỐNG & TÀI LIỆU QUY CHUẨN:\n{system_prompt}\n\nYÊU CẦU PHÂN TÍCH:\n{user_content}"}
                        ]
                    }
                ],
                "generationConfig": {
                    "temperature": 0.4,
                    "maxOutputTokens": 4096,
                }
            }
            async with httpx.AsyncClient(timeout=60.0) as client:
                res = await client.post(url, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        parts = candidates[0].get("content", {}).get("parts", [])
                        if parts:
                            return parts[0].get("text", "")
        except Exception as e:
            print(f"[Gemini Call Error] {e}")

    # 2. Try OpenAI-compatible API
    if OPENAI_API_KEY:
        try:
            headers = {
                "Authorization": f"Bearer {OPENAI_API_KEY}",
                "Content-Type": "application/json",
            }
            payload = {
                "model": OPENAI_MODEL,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_content},
                ],
                "temperature": 0.4,
                "max_tokens": 4096,
            }
            base = OPENAI_BASE_URL.rstrip("/")
            url = f"{base}/chat/completions"
            async with httpx.AsyncClient(timeout=60.0) as client:
                res = await client.post(url, headers=headers, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    choices = data.get("choices", [])
                    if choices:
                        return choices[0].get("message", {}).get("content", "")
        except Exception as e:
            print(f"[OpenAI Call Error] {e}")

    return None


async def interpret_qimen(chart_data: Dict[str, Any], query_info: Dict[str, Any]) -> str:
    """Luận giải Kỳ Môn Độn Giáp 100% bằng tiếng Việt theo đúng chuẩn 7 mục trong SKILL.md."""
    system_knowledge = load_qimen_knowledge()
    system_prompt = (
        "Bạn là Chuyên gia Cao cấp về Kỳ Môn Độn Giáp phương Đông.\n"
        "Nhiệm vụ của bạn là dựa HOÀN TOÀN vào kết quả tính toán đã có từ thuật toán cố định (đính kèm trong JSON) "
        "để viết bài luận giải chuyên nghiệp HOÀN TOÀN BẰNG TIẾNG VIỆT tự nhiên, sâu sắc, khúc chiết.\n\n"
        "YÊU CẦU NGÔN NGỮ (BẮT BUỘC TUÂN THỦ TUYỆT ĐỐI):\n"
        "1. BÀI VIẾT PHẢI LÀ TIẾNG VIỆT 100%. Mọi danh từ riêng, thuật ngữ phong thủy, can chi, tên sao, tên cửa, tên thần "
        "PHẢI ĐƯỢC VIẾT BẰNG PHIÊN ÂM HÁN-VIỆT THUẦN TÚY (Ví dụ: viết 'Trực Phù', 'Tử Môn', 'Thiên Nhuế', 'Phục Ngâm', "
        "'Bính Ngọ', 'Âm Độn Trung Nguyên 8 Cục', 'Khảm Nhất Cung', 'Khôn Nhị Cung' - TUYỆT ĐỐI KHÔNG để nguyên chữ Hán như 死门, 天芮, 伏吟, 阴遁).\n"
        "2. Không dùng từ ngữ hù dọa, mê tín (không nói 'tuyệt mạng', 'chắc chắn bại vong').\n"
        "3. Cấu trúc bài luận PHẢI ĐỦ 7 MỤC theo đúng SKILL.md:\n"
        "   1. Thông tin đã xác nhận (Việc cần xem, thời gian, phương vị, người hỏi)\n"
        "   2. Quy tắc và khẩu kính định cục (Thời gia chuyển bàn, Dương/Âm độn, múi giờ)\n"
        "   3. Tóm tắt bàn Kỳ Môn (Cục số, Tuần thủ, Trực Phù, Trực Sử, Không Vong, Ngựa trạm/Dịch Mã)\n"
        "   4. Dụng thần và Căn cứ trọng tâm (Xác định rõ việc này lấy gì làm Dụng thần chính, cung nào, cửa nào, sao nào)\n"
        "   5. Phán đoán cốt lõi (Khả năng thành bại, phân tích tương quan sinh khắc giữa đương số và sự việc)\n"
        "   6. Phương vị / Thời cơ / Lời khuyên hành động cụ thể (Nên tiến hay thủ, hướng nào thuận lợi, giờ nào nên bắt đầu)\n"
        "   7. Cảnh báo rủi ro & Lời khuyên thực tế (Ghim khối miễn trừ trách nhiệm chuẩn mực ở cuối)."
    )

    user_content = (
        f"DỮ LIỆU ĐƯƠNG SỐ & CÂU HỎI:\n{json.dumps(query_info, ensure_ascii=False, indent=2)}\n\n"
        f"DỮ LIỆU BÀN KỲ MÔN (JSON TÍNH TOÁN CỐ ĐỊNH TỪ SCRIPT):\n{json.dumps(chart_data, ensure_ascii=False, indent=2)}\n\n"
        "Hãy viết bài luận giải hoàn chỉnh bằng Tiếng Việt 100% (không dùng chữ Hán) theo đúng 7 mục quy chuẩn."
    )

    llm_result = await call_llm(system_prompt, user_content)
    if llm_result:
        if "Lời nhắc quan trọng" not in llm_result:
            llm_result += DISCLAIMER_QIMEN
        return llm_result

    # Fallback: Tự động biên soạn bài phân tích hoàn toàn bằng Tiếng Việt
    chart = chart_data.get("chart", {})
    ganzhi = chart_data.get("ganzhi", {})
    warnings = chart_data.get("warnings", [])
    patterns = chart.get("detected_patterns", [])

    # Dịch toàn bộ warnings sang tiếng Việt
    warnings_vn = [translate_warning_text(w) for w in warnings]
    warnings_text = "\n".join([f"- ⚠️ {w}" for w in warnings_vn]) if warnings_vn else "Bàn cờ ổn định, không có cảnh báo bất thường."

    # Dịch toàn bộ patterns sang tiếng Việt
    patterns_vn = []
    for p in patterns:
        p_name = p.get("name", "")
        p_detail = p.get("detail", "")
        p_palace = p.get("palace", "")
        p_nature = "Cát (Thuận lợi)" if p.get("nature") == "吉" else ("Hung (Bất lợi)" if p.get("nature") == "凶" else "Bình hòa")
        detail_vn = translate_pattern_detail(p_name, p_detail)
        patterns_vn.append(f"- **{detail_vn}** tại {PALACE_NUM_VN.get(p_palace, f'Cung {p_palace}')} • [{p_nature}]")
    patterns_text = "\n".join(patterns_vn) if patterns_vn else "Bàn cờ thế thế cân bằng, không kích hoạt cách cục cực đoan."

    # Chuyển đổi các thông số cốt lõi sang tiếng Việt
    dun_vn = "Âm Độn" if chart.get("dun_type") == "阴遁" else "Dương Độn"
    yuan_vn = "Thượng Nguyên" if chart.get("yuan") == "上元" else ("Trung Nguyên" if chart.get("yuan") == "中元" else "Hạ Nguyên")
    xunshou_vn = to_ganzhi_vn(chart.get("xunshou", ""))
    hidden_yi_vn = STEM_VN.get(chart.get("hidden_yi", ""), chart.get("hidden_yi", ""))

    zhifu_star = chart.get("zhifu", {}).get("star", "")
    zhifu_star_vn = STAR_VN.get(zhifu_star, zhifu_star)
    zhifu_palace = chart.get("zhifu", {}).get("palace", "")
    zhifu_palace_vn = PALACE_NUM_VN.get(zhifu_palace, f"Cung {zhifu_palace}")

    zhishi_door = chart.get("zhishi", {}).get("door", "")
    zhishi_door_vn = DOOR_VN.get(zhishi_door, zhishi_door)
    zhishi_palace = chart.get("zhishi", {}).get("palace", "")
    zhishi_palace_vn = PALACE_NUM_VN.get(zhishi_palace, f"Cung {zhishi_palace}")

    kongwang_vn = to_branch_list_vn(chart.get("kongwang", []))
    kongwang_palaces_vn = ", ".join([PALACE_NUM_VN.get(p, f"Cung {p}") for p in chart.get("kongwang_palaces", [])])

    yima_branch = chart.get("hour_yima", {}).get("branch", "")
    yima_branch_vn = BRANCH_VN.get(yima_branch, yima_branch)
    yima_palace = chart.get("hour_yima", {}).get("palace", "")
    yima_palace_vn = PALACE_NUM_VN.get(yima_palace, f"Cung {yima_palace}")

    # Tứ trụ can chi tiếng Việt
    year_gz = to_ganzhi_vn(ganzhi.get("year", ""))
    month_gz = to_ganzhi_vn(ganzhi.get("month", ""))
    day_gz = to_ganzhi_vn(ganzhi.get("day", ""))
    time_gz = to_ganzhi_vn(ganzhi.get("time", ""))
    day_stem_char = ganzhi.get("day", "")[0] if ganzhi.get("day") else ""
    day_stem_vn = STEM_VN.get(day_stem_char, day_stem_char)
    time_stem_char = ganzhi.get("time", "")[0] if ganzhi.get("time") else ""
    time_stem_vn = STEM_VN.get(time_stem_char, time_stem_char)

    return (
        f"### 1. Thông tin đã xác nhận\n"
        f"- **Lĩnh vực cần xem:** {query_info.get('question_type', 'Việc chung')}\n"
        f"- **Mục tiêu phán đoán:** {query_info.get('question_goal', 'Xem xu thế thuận nghịch')}\n"
        f"- **Thời điểm khởi bàn:** {chart_data.get('calendar', {}).get('solar', {}).get('ymd_hms', 'Hiện tại')} ({year_gz} • {month_gz} • {day_gz} • {time_gz})\n"
        f"- **Địa điểm:** {query_info.get('location', {}).get('city', 'Việt Nam')} ({chart_data.get('normalized_input', {}).get('timezone', 'Asia/Ho_Chi_Minh')})\n\n"
        f"### 2. Quy tắc và Khẩu kính định bàn\n"
        f"- Hệ thống: Thời Gia Chuyển Bàn Kỳ Môn (Mainline-cn-v1 chuẩn mực)\n"
        f"- Múi giờ: {chart_data.get('normalized_input', {}).get('timezone', 'Asia/Ho_Chi_Minh')}\n"
        f"- Trung Cung (Cung 5) ký gửi về Khôn (Cung 2), Thiên Cầm đi cùng Thiên Nhuế.\n\n"
        f"### 3. Tóm tắt Bàn Kỳ Môn (Tiếng Việt thuần túy)\n"
        f"- **Độn & Cục:** {dun_vn} • {yuan_vn} (Cục số {chart.get('ju_number', '')})\n"
        f"- **Tuần Thủ:** {xunshou_vn} — Ẩn Can trốn theo là `{hidden_yi_vn} ({chart.get('hidden_yi', '')})`\n"
        f"- **Trực Phù (Sao chỉ huy / Thiên tướng):** Sao **{zhifu_star_vn}** ngự tại {zhifu_palace_vn}\n"
        f"- **Trực Sử (Cửa chấp hành / Cửa hành sự):** Cửa **{zhishi_door_vn}** ngự tại {zhishi_palace_vn}\n"
        f"- **Tuần Không (Không Vong rơi vào rỗng):** Chi {kongwang_vn} — tương ứng tại {kongwang_palaces_vn}\n"
        f"- **Dịch Mã (Ngựa trạm chủ biến động):** Chi {yima_branch_vn} ({yima_branch}) — ngự tại {yima_palace_vn}\n\n"
        f"### 4. Dụng Thần & Căn Cứ Trọng Tâm\n"
        f"- **Can Ngày (Đại diện cho bạn):** Can `{day_stem_vn}` ngự tại Cung {chart.get('day_stem', {}).get('palace', '')}\n"
        f"- **Can Giờ (Đại diện cho sự việc bạn hỏi):** Can `{time_stem_vn}` ngự trên bàn cờ\n"
        f"- **Trực Sử:** Cửa `{zhishi_door_vn}` là then chốt quyết định tiến trình thực thi của sự việc.\n\n"
        f"### 5. Phán đoán Cốt lõi & Thế cờ\n"
        f"**Các cách cục nhận diện trên bàn cờ:**\n{patterns_text}\n\n"
        f"**Cảnh báo kỹ thuật:**\n{warnings_text}\n\n"
        f"### 6. Phương vị, Thời cơ & Lời khuyên hành động\n"
        f"- **Phương vị cát lợi:** Nên ưu tiên các phương vị có Sinh Môn (Cung {chart.get('door_index', {}).get('生门', 'chưa rõ')}) hoặc Khai Môn (Cung {chart.get('door_index', {}).get('开门', 'chưa rõ')}) khi cần xuất hành, đàm phán hay giao dịch ký kết.\n"
        f"- **Phòng tránh:** Tuyệt đối tránh hướng rơi vào Không Vong hoặc Môn Bức để không bị hao tổn tâm trí và tiền tài vô ích.\n"
        f"- **Tư thế hành động:** Khi gặp cục Phục Ngâm, tốt nhất nên 'tĩnh dĩ đãi động' (giữ thế tĩnh để chờ thời cơ), tập trung hoàn thiện nội lực thay vì nôn nóng mở rộng bộc phát.\n"
        f"\n*(Ghi chú: Thêm `GEMINI_API_KEY` vào file `.env` để kích hoạt Đại sư AI phân tích sâu hơn theo ngữ cảnh riêng của bạn)*"
        f"{DISCLAIMER_QIMEN}"
    )


async def interpret_ziwei(chart_data: Dict[str, Any], query_info: Dict[str, Any]) -> str:
    """Luận giải Tử Vi Đẩu Số 100% bằng tiếng Việt theo đúng chuẩn SKILL.md."""
    system_knowledge = load_ziwei_knowledge()
    system_prompt = (
        "Bạn là Chuyên gia Cao cấp Tử Vi Đẩu Số (Trường phái Tam Hợp dung hợp Tứ Hóa).\n"
        "Nhiệm vụ của bạn là dựa vào kết quả tính toán an sao cố định (trong JSON) để viết bài luận giải "
        "HOÀN TOÀN BẰNG TIẾNG VIỆT tự nhiên, sâu sắc, thực tế và dễ tiếp nhận cho đương số.\n\n"
        "QUY TẮC CỐT LÕI (BẮT BUỘC TUÂN THỦ):\n"
        "1. BÀI VIẾT PHẢI LÀ TIẾNG VIỆT 100%. Tên cung, tên sao, tên cách cục, Tứ Hóa đều dịch phiên âm Hán-Việt rõ ràng "
        "(Ví dụ: viết 'Tử Vi', 'Thiên Cơ', 'Thái Dương', 'Vũ Khúc', 'Mệnh Cung', 'Quan Lộc', 'Hóa Lộc', 'Hóa Kỵ' - KHÔNG dùng chữ Hán).\n"
        "2. Không dùng lời lẽ hù dọa, định mệnh tiêu cực. Hãy chuyển hóa sát khí thành thách thức, bài học và lời khuyên quản trị rủi ro.\n"
        "3. Bố cục bài luận đúng thứ tự trong SKILL.md:\n"
        "   1. Tổng luận Bản mệnh & Khí chất nền tảng (Mệnh cung, Thân cung, Ngũ Hành Cục, Mệnh Chủ, Thân Chủ)\n"
        "   2. Tam phương tứ chính Mệnh Cung (Mệnh - Quan - Tài - Di: ưu thế bẩm sinh, thế đứng xã hội)\n"
        "   3. Cấu trúc 14 Chính tinh (Miếu, Vượng, Đắc, Hãm) cùng Cát tinh / Sát tinh chủ chốt\n"
        "   4. Tứ Hóa Năm Sinh (Hóa Lộc, Hóa Quyền, Hóa Khoa, Hóa Kỵ) & Cung vị tiếp nhận bài học lớn\n"
        "   5. Phân tích trọng điểm các cung cốt lõi (Quan Lộc, Tài Bạch, Phu Thê, Phúc Đức)\n"
        "   6. Vận hạn Đại Hạn & Lưu Niên\n"
        "   7. Lời khuyên định hướng & Tu dưỡng (Đính kèm khối miễn trừ trách nhiệm ở cuối)."
    )

    user_content = (
        f"THÔNG TIN ĐƯƠNG SỐ:\n{json.dumps(query_info, ensure_ascii=False, indent=2)}\n\n"
        f"LÁ SỐ TỬ VI (JSON TÍNH TOÁN CỐ ĐỊNH):\n{json.dumps(chart_data, ensure_ascii=False, indent=2)}\n\n"
        "Hãy viết bài luận giải Tử Vi chuyên sâu bằng Tiếng Việt 100% theo cấu trúc chuẩn."
    )

    llm_result = await call_llm(system_prompt, user_content)
    if llm_result:
        if "Lời nhắc quan trọng" not in llm_result:
            llm_result += DISCLAIMER_ZIWEI
        return llm_result

    # Fallback nếu chưa cấu hình LLM
    chart = chart_data.get("chart", {})
    ming = chart.get("ming_gong", {})
    shen = chart.get("shen_gong", {})
    ju = chart.get("wuxing_ju", {})
    sihua = chart.get("year_sihua", {})
    horoscope = chart_data.get("horoscope")

    ming_branch_vn = BRANCH_VN.get(ming.get("branch", ""), ming.get("branch", ""))
    ming_ganzhi_vn = to_ganzhi_vn(ming.get("ganzhi", ""))
    shen_palace_vn = shen.get("palace", "")
    shen_branch_vn = BRANCH_VN.get(shen.get("branch", ""), shen.get("branch", ""))

    sihua_vn_items = []
    for k, v in sihua.items():
        star_name = v.get("star", "")
        star_vn = star_name
        palace_vn = v.get("palace", "")
        sihua_vn_items.append(f"**{k}**: Sao {star_vn} tại Cung {palace_vn}")
    sihua_text = " • ".join(sihua_vn_items)

    horo_lines = []
    if horoscope:
        q_year = horoscope.get('query_lunar_year') or horoscope.get('query_year', '')
        y_ganzhi = to_ganzhi_vn(horoscope.get('year_ganzhi', ''))
        nom_age = horoscope.get('nominal_age', '')
        horo_lines.append(f"- **Năm xem xét:** {q_year} ({y_ganzhi}) — Tuổi mụ: {nom_age} tuổi")
        curr_ming = horoscope.get('yearly', {}).get('yearly_ming_gong', {}) or horoscope.get('current_yearly_ming_gong', {})
        p_name = curr_ming.get('palace_name', '')
        p_branch = BRANCH_VN.get(curr_ming.get('branch', ''), curr_ming.get('branch', ''))
        if p_name:
            horo_lines.append(f"- **Lưu Niên Mệnh Cung:** Cư tại {p_name} (Chi {p_branch})")
    else:
        horo_lines.append("- Chọn năm lưu niên cụ thể để kích hoạt phân tích vận hạn.")
    horo_text = "\n".join(horo_lines)

    direction_vn = "Thuận hành" if chart.get("decadal_direction") == "顺行" else "Nghịch hành"

    return (
        f"### 1. Tổng luận Bản Mệnh & Khí chất nền tảng\n"
        f"- **Mệnh Cung:** Ngự tại Chi `{ming_branch_vn}` (Can Chi: `{ming_ganzhi_vn}`).\n"
        f"- **Thân Cung:** Cư tại Cung `{shen_palace_vn}` (Chi `{shen_branch_vn}`).\n"
        f"- **Ngũ Hành Cục:** `{ju.get('name', '')}` (Cục số {ju.get('number', '')} — khởi đại hạn ở tuổi {ju.get('number', '')}).\n"
        f"- **Mệnh Chủ:** `{chart.get('ming_zhu', '')}` | **Thân Chủ:** `{chart.get('shen_zhu', '')}`\n"
        f"- **Chiều vận Đại hạn:** `{direction_vn}`\n\n"
        f"### 2. Tứ Hóa Năm Sinh (Điểm tựa & Thách thức tiên thiên)\n"
        f"- {sihua_text}\n"
        f"*(Hóa Lộc chủ phúc duyên và nguồn tài chính; Hóa Quyền chủ năng lực hành động và quyền uy; Hóa Khoa chủ danh dự, thi cử, khoa bảng; Hóa Kỵ chủ tâm niệm dồn tụ, bài học cần tôi luyện).*\n\n"
        f"### 3. Vận trình Thời gian\n"
        f"{horo_text}\n\n"
        f"### 4. Lời khuyên định hướng & Quản trị rủi ro\n"
        f"- Thấu hiểu cung Mệnh để phát huy sở trường bẩm sinh; quan sát cung Thân để điều chỉnh định hướng nửa đời sau.\n"
        f"- Chú trọng cung có Hóa Kỵ năm sinh: Đây là nơi bạn dễ hao tâm tổn trí nhất nhưng cũng chính là nơi ẩn chứa năng lượng bứt phá lớn nhất khi bạn đối diện với tính kỷ luật cao.\n"
        f"\n*(Ghi chú: Thêm `GEMINI_API_KEY` vào file `.env` để kích hoạt luận giải AI toàn diện từng cung và sao)*"
        f"{DISCLAIMER_ZIWEI}"
    )


async def interpret_bazi(chart_data: Dict[str, Any], query_info: Dict[str, Any]) -> str:
    """Luận giải Bát Tự 100% bằng tiếng Việt theo đúng chuẩn 8 mục trong SKILL.md."""
    system_knowledge = load_bazi_knowledge()
    system_prompt = (
        "Bạn là Chuyên gia Cao cấp về Tứ Trụ Bát Tự (Trường phái Tử Bình chính tông).\n"
        "Nhiệm vụ của bạn là dựa vào bảng Tứ Trụ, Thập Thần, Đại Vận đã tính toán cố định từ script (trong JSON) "
        "để viết bài phân tích sâu sắc HOÀN TOÀN BẰNG TIẾNG VIỆT tự nhiên, mạch lạc, có tính đối chiếu cao.\n\n"
        "QUY TẮC CỐT LÕI (BẮT BUỘC TUÂN THỦ):\n"
        "1. BÀI VIẾT PHẢI LÀ TIẾNG VIỆT 100%. Tên can, tên chi, thập thần, ngũ hành đều dùng phiên âm Hán-Việt rõ ràng "
        "(Ví dụ: viết 'Ất Hợi', 'Bính Tuất', 'Giáp Tuất', 'Tân Mùi', 'Tỷ Kiên', 'Kiếp Tài', 'Thực Thần', 'Thương Quan', "
        "'Chính Quan', 'Thất Sát', 'Chính Ấn', 'Thiên Ấn' - KHÔNG dùng chữ Hán).\n"
        "2. Không dùng từ ngữ mê tín, hù dọa tiêu cực ('khắc cha mẹ', 'sát thê', 'số bần hàn').\n"
        "3. Bố cục bài luận ĐỦ 8 MỤC theo đúng SKILL.md:\n"
        "   1. Bảng Tứ Trụ (Năm, Tháng, Ngày, Giờ kèm Can, Chi, Thập Thần, Tàng Can)\n"
        "   2. Phân tích Nhật Chủ vượng suy & Cách cục\n"
        "   3. Hỷ Dụng Thần & Kỵ Thần\n"
        "   4. Cấu hình Thập Thần & Phân tích tính cách, sở trường\n"
        "   5. Phân tích các phương diện cuộc sống (Sự nghiệp, Tài vận, Tình cảm gia đạo, Sức khỏe ngũ hành)\n"
        "   6. Đại Vận & Lưu Niên tường giải\n"
        "   7. Danh sách kiểm chứng sự kiện quá khứ (Past event checklist)\n"
        "   8. Tổng kết cốt lõi, Điểm trọng yếu cần phòng tránh & Khối miễn trừ trách nhiệm."
    )

    user_content = (
        f"THÔNG TIN ĐƯƠNG SỐ:\n{json.dumps(query_info, ensure_ascii=False, indent=2)}\n\n"
        f"DỮ LIỆU TỨ TRỤ BÁT TỰ (JSON TÍNH TOÁN CỐ ĐỊNH):\n{json.dumps(chart_data, ensure_ascii=False, indent=2)}\n\n"
        "Hãy viết bài luận giải Tứ Trụ hoàn chỉnh bằng Tiếng Việt 100% theo đúng 8 mục chuẩn mực."
    )

    llm_result = await call_llm(system_prompt, user_content)
    if llm_result:
        if "Lời nhắc quan trọng" not in llm_result:
            llm_result += DISCLAIMER_BAZI
        return llm_result

    # Fallback nếu chưa có LLM API Key
    pillars = chart_data.get("four_pillars", {})
    dm = chart_data.get("day_master", {})
    wuxing = chart_data.get("wuxing_counts", {}).get("vn_summary", "")
    dayun = chart_data.get("dayun", {})
    interactions = chart_data.get("interactions", {})

    return (
        f"### 1. Bảng Tứ Trụ Bát Tự\n"
        f"| Trụ | Can Chi | Thập Thần Can | Chi & Tàng Can | Ngũ Hành |\n"
        f"|---|---|---|---|---|\n"
        f"| **Năm** | {pillars.get('year', {}).get('vn_ganzhi')} | {pillars.get('year', {}).get('stem_vn_shishen')} | {pillars.get('year', {}).get('branch_vn')} [{', '.join(pillars.get('year', {}).get('hidden_stems', []))}] | {pillars.get('year', {}).get('stem_element')}/{pillars.get('year', {}).get('branch_element')} |\n"
        f"| **Tháng** | {pillars.get('month', {}).get('vn_ganzhi')} | {pillars.get('month', {}).get('stem_vn_shishen')} | {pillars.get('month', {}).get('branch_vn')} [{', '.join(pillars.get('month', {}).get('hidden_stems', []))}] | {pillars.get('month', {}).get('stem_element')}/{pillars.get('month', {}).get('branch_element')} |\n"
        f"| **Ngày** | {pillars.get('day', {}).get('vn_ganzhi')} | **Nhật Chủ (Bản thân)** | {pillars.get('day', {}).get('branch_vn')} [{', '.join(pillars.get('day', {}).get('hidden_stems', []))}] | {pillars.get('day', {}).get('stem_element')}/{pillars.get('day', {}).get('branch_element')} |\n"
        f"| **Giờ** | {pillars.get('hour', {}).get('vn_ganzhi')} | {pillars.get('hour', {}).get('stem_vn_shishen')} | {pillars.get('hour', {}).get('branch_vn')} [{', '.join(pillars.get('hour', {}).get('hidden_stems', []))}] | {pillars.get('hour', {}).get('stem_element')}/{pillars.get('hour', {}).get('branch_element')} |\n\n"
        f"### 2. Phân tích Nhật Chủ & Ngũ Hành Khí Thế\n"
        f"- **Nhật Chủ:** `{dm.get('vn', '')}` — Ngũ hành `{dm.get('vn_element', '')}` ({dm.get('yinyang', '')}).\n"
        f"- **Sinh vào tháng:** `{dm.get('born_in_month_vn', '')}` — {'Đắc lệnh tháng' if dm.get('is_dangling') else 'Không đắc lệnh tháng'}.\n"
        f"- **Phân bổ Ngũ Hành:** {wuxing}.\n\n"
        f"### 3. Tương tác Địa Chi & Đặc điểm Mệnh cục\n"
        f"- Tương tác phát hiện: Lục xung: {len(interactions.get('liu_chong', []))}, Lục hợp: {len(interactions.get('liu_he', []))}, Tam hợp: {len(interactions.get('san_he', []))}, Tam hình: {len(interactions.get('san_xing', []))}.\n\n"
        f"### 4. Đại Vận Vận Trình\n"
        f"- **Hướng khởi vận:** {dayun.get('direction_text', '')}\n"
        f"- **Tuổi khởi vận:** Khoảng {dayun.get('start_age_display', 'chưa rõ')} (Khởi vận dương lịch: {dayun.get('start_solar_date', '')})\n"
        f"- Các bước Đại Vận: " + " ➔ ".join([f"{dy.get('vn_ganzhi')} ({dy.get('start_age')}-{dy.get('end_age')}t)" for dy in dayun.get("pillars", [])[:6]]) + "...\n\n"
        f"### 5. Định hướng cốt lõi\n"
        f"- Nắm rõ ngũ hành Hỷ Thần để lựa chọn ngành nghề, đối tác và phong cách sống phù hợp nhằm bồi đắp khí lực cho bản thân.\n"
        f"\n*(Ghi chú: Thêm `GEMINI_API_KEY` vào file `.env` để kích hoạt Đại sư AI phân tích tường giải 8 mục chi tiết)*"
        f"{DISCLAIMER_BAZI}"
    )


async def interpret_cross_check(bazi_data: Dict[str, Any], ziwei_data: Dict[str, Any], profile_name: str, focus_topic: str) -> str:
    """Đối chiếu chéo giữa Tứ Trụ Bát Tự và Tử Vi Đẩu Số 100% bằng tiếng Việt."""
    system_prompt = (
        "Bạn là Chuyên gia Nghiên cứu Huyền học Đông Phương hàng đầu, thông thạo cả Tứ Trụ Bát Tự và Tử Vi Đẩu Số.\n"
        "Nhiệm vụ của bạn là ĐỐI CHIẾU CHÉO 2 môn phái cho cùng một lá số của đương số.\n"
        "Quy tắc:\n"
        "1. TOÀN BỘ BÀI VIẾT PHẢI BẰNG TIẾNG VIỆT 100%, không dùng chữ Hán.\n"
        "2. Tìm ra ĐIỂM TƯƠNG ĐỒNG (Consensus) giữa 2 hệ thống: Nếu cả 2 đều chỉ ra cùng một xu thế, hãy làm nổi bật vì độ tin cậy rất cao.\n"
        "3. Giải thích ĐIỂM BỔ KHUYẾT: Môn này nhìn thấy chi tiết gì mà môn kia chưa thể hiện hết.\n"
        "4. Ngôn từ trang nhã, khách quan, không mê tín, đưa ra lời khuyên thực tế khả thi.\n"
        "5. Ghim khối miễn trừ trách nhiệm ở cuối."
    )

    user_content = (
        f"ĐƯƠNG SỐ: {profile_name}\n"
        f"CHỦ ĐỀ QUAN TÂM: {focus_topic}\n\n"
        f"DỮ LIỆU BÁT TỰ:\n{json.dumps(bazi_data, ensure_ascii=False, indent=2)}\n\n"
        f"DỮ LIỆU TỬ VI:\n{json.dumps(ziwei_data, ensure_ascii=False, indent=2)}\n\n"
        "Hãy viết bài đối chiếu chéo chuyên sâu bằng Tiếng Việt 100%."
    )

    llm_result = await call_llm(system_prompt, user_content)
    if llm_result:
        if "Lời nhắc quan trọng" not in llm_result:
            llm_result += DISCLAIMER_ZIWEI
        return llm_result

    # Fallback
    return (
        f"### Đối Chiếu Chéo: Bát Tự & Tử Vi Đẩu Số cho {profile_name}\n\n"
        f"#### 1. Tổng quan Trọng tâm Khảo sát\n"
        f"- **Chủ đề:** {focus_topic}\n"
        f"- **Nhật Chủ Bát Tự:** {bazi_data.get('day_master', {}).get('vn')} ({bazi_data.get('day_master', {}).get('vn_element')})\n"
        f"- **Mệnh Cung Tử Vi:** Chi {BRANCH_VN.get(ziwei_data.get('chart', {}).get('ming_gong', {}).get('branch'), '')}, Cục {ziwei_data.get('chart', {}).get('wuxing_ju', {}).get('name')}\n\n"
        f"#### 2. Các điểm tương đồng nổi bật\n"
        f"- Cả hai hệ thống đều xây dựng dựa trên trục thời gian năm - tháng - ngày - giờ sinh chuẩn xác.\n"
        f"- Khí thế ngũ hành của Nhật Chủ trong Bát Tự tương ứng bổ trợ mật thiết cho vị trí cung Mệnh/Thân và hệ thống Tứ Hóa trong Tử Vi.\n\n"
        f"#### 3. Lời khuyên tổng hòa\n"
        f"- Dùng Bát Tự để nắm bắt khí thế ngũ hành vĩ mô và thời điểm khởi phát đại vận.\n"
        f"- Dùng Tử Vi để quan sát cụ thể các mối quan hệ nhân sinh, môi trường làm việc và các lĩnh vực đời sống.\n"
        f"\n*(Ghi chú: Cấu hình `GEMINI_API_KEY` vào `.env` để kích hoạt báo cáo đối chiếu chuyên sâu do AI soạn thảo)*"
        f"{DISCLAIMER_ZIWEI}"
    )
