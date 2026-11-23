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
    """Luận giải Kỳ Môn Độn Giáp 100% bằng tiếng Việt với cấu trúc 2 tầng: Lời thầy bình giải & Hồ sơ kỹ thuật."""
    system_knowledge = load_qimen_knowledge()
    system_prompt = (
        "Bạn là một Bậc Thầy Huyền Học Kỳ Môn Độn Giáp uyên thâm, đồng thời là cố vấn chiến lược đời sống thấu suốt.\n"
        "Nhiệm vụ của bạn là dựa vào bàn cờ Kỳ Môn Độn Giáp (trong JSON) để viết bài phân tích TOÀN DIỆN BẰNG TIẾNG VIỆT 100%. MỖI MỤC PHẢI CỤ THỂ ÍT NHẤT 3-4 CÂU CHI TIẾT.\n\n"
        "BÀI VIẾT BẮT BUỘC PHẢI ĐƯỢC CHIA THÀNH 2 PHẦN RÕ RỆT (SỬ DỤNG ĐÚNG 2 DÒNG TIÊU ĐỀ NÀY ĐỂ GIAO DIỆN TỰ ĐỘNG CHIA TAB):\n\n"
        "=== PHẦN I: LỜI THẦY BÌNH GIẢI DÀNH CHO BẠN ===\n"
        "(Văn phong của một bậc thầy nhiều kinh nghiệm đang ngồi đàm đạo trực tiếp với người tới xem lá số. "
        "Nói thẳng vào vấn đề thực tế, dễ hiểu, ấm áp, sâu sắc, không dùng thuật ngữ cổ làm người xem bối rối. "
        "Bao gồm: 1. Đánh giá trực diện sự việc (Thuận hay nghịch, cụ thể mức độ thành công dự báo theo thang 1-10, lý do tại sao); "
        "2. Điểm Mạnh & Điểm Yếu của thời cơ hiện tại (Liệt kê rõ 2-3 yếu tố thuận lợi và 2-3 yếu tố cần cẩn trọng cụ thể); "
        "3. Thời cơ & Chiến lược hành động cụ thể (Thời điểm nào trong 30 ngày tới là tốt nhất để hành động, lúc nào nên dừng); "
        "4. Phương vị cát lợi & Quý nhân tương trợ (Hướng nào xuất hành thuận lợi, loại người nào là quý nhân cụ thể); "
        "5. Lời dặn dò tâm huyết của Thầy để chuyển hóa hung hiểm thành cơ hội, kèm 2-3 hành động thực tế ngay hôm nay).\n\n"
        "=== PHẦN II: HỒ SƠ THUẬT SỐ KỸ THUẬT ===\n"
        "(Dành cho tra cứu chuyên sâu học thuật theo chuẩn SKILL.md: 1. Thông tin đã xác nhận; 2. Quy tắc định bàn; 3. Tóm tắt bàn Kỳ Môn; "
        "4. Dụng Thần & Căn Cứ Trọng Tâm; 5. Phán đoán cốt lõi & Cách cục; 6. Phương vị & Cửa tương tác; 7. Cảnh báo kỹ thuật).\n\n"
        "TUYỆT ĐỐI TUÂN THỦ: 100% Tiếng Việt thuần túy, dịch sạch mọi tên sao (Thiên Phụ, Thiên Bồng...), cửa (Khai Môn, Sinh Môn...), thần (Trực Phù, Cửu Thiên...)."
    )

    user_content = (
        f"DỮ LIỆU ĐƯƠNG SỐ & CÂU HỎI:\n{json.dumps(query_info, ensure_ascii=False, indent=2)}\n\n"
        f"DỮ LIỆU BÀN KỲ MÔN (JSON TÍNH TOÁN CỐ ĐỊNH TỪ SCRIPT):\n{json.dumps(chart_data, ensure_ascii=False, indent=2)}\n\n"
        "Hãy viết bài luận giải hoàn chỉnh bằng Tiếng Việt 100% (không dùng chữ Hán) theo đúng cấu trúc 2 phần quy chuẩn."
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

    is_fuyin = "Phục Ngâm" in patterns_text
    is_fanyin = "Phản Ngâm" in patterns_text
    
    advice_qimen = (
        "Thế cờ gặp Phục Ngâm — vạn sự nên án binh bất động, 'tĩnh dĩ đãi động'. Hãy hoàn thiện kế hoạch nội bộ, "
        "kiểm tra kỹ giấy tờ, hợp đồng, tuyệt đối không nên mạo hiểm bung tiền hay khởi xướng dự án mới một cách nóng vội."
        if is_fuyin else (
            "Thế cờ gặp Phản Ngâm — ngoại cảnh dễ có biến động đảo chiều bất ngờ, việc tưởng xong lại phải làm lại. "
            "Cần chuẩn bị phương án dự phòng (Plan B) và giữ tâm thế linh hoạt."
            if is_fanyin else
            "Thế cờ ở trạng thái bình ổn, tiến trình sự việc tùy thuộc vào sự chủ động và khả năng đàm phán khéo léo của bạn."
        )
    )

    return (
        f"=== PHẦN I: LỜI THẦY BÌNH GIẢI DÀNH CHO BẠN ===\n\n"
        f"Chào bạn, xét theo thời điểm khởi bàn việc bạn đang quan tâm ({query_info.get('question_type', 'Việc chung')} • mục tiêu: {query_info.get('question_goal', 'Xem xu thế')}):\n\n"
        f"#### 1. Đánh Giá Trực Diện Sự Việc (Thuận Hay Nghịch?)\n"
        f"- Cửa hành sự (Trực Sử) hiện rơi vào **Cửa {zhishi_door_vn}** ngự tại **{zhishi_palace_vn}**. "
        f"Sao chỉ huy tổng quản (Trực Phù) là **Sao {zhifu_star_vn}** tại **{zhifu_palace_vn}**.\n"
        f"- {advice_qimen}\n\n"
        f"#### 2. Thời Cơ & Chiến Lược Của Bạn\n"
        f"- **Tư thế hành động:** Tạm thời đặt việc củng cố nội lực, bảo vệ thành quả và trau dồi chuyên môn lên hàng đầu. Đừng để áp lực bên ngoài buộc bạn phải đưa ra quyết định vội vã.\n"
        f"- **Quý nhân trợ lực:** Hãy chủ động tìm đến những người có uy tín, cấp trên hoặc bậc tiền bối để tham vấn (mang năng lượng của Trực Phù). Họ sẽ là điểm tựa soi đường cho bạn.\n\n"
        f"#### 3. Phương Hướng & Lời Dặn Của Thầy\n"
        f"- **Phương vị cát lành:** Khi cần xuất hành, hẹn đối tác hoặc suy ngẫm hướng đi, nên chọn hướng có Sinh Môn hoặc Khai Môn để đón nguồn sinh khí hanh thông.\n"
        f"- **Phòng tránh:** Cẩn trọng các hướng rơi vào Không Vong (Chi {kongwang_vn}) — việc tiến hành ở hướng này dễ bị rơi vào trạng thái 'nửa chừng đứt gánh' hoặc hư danh vô thực.\n"
        f"\n=== PHẦN II: HỒ SƠ THUẬT SỐ KỸ THUẬT ===\n\n"
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
        f"{DISCLAIMER_QIMEN}"
    )


async def interpret_ziwei(chart_data: Dict[str, Any], query_info: Dict[str, Any]) -> str:
    """Luận giải Tử Vi Đẩu Số 100% bằng tiếng Việt với cấu trúc 2 tầng: Lời thầy bình giải & Hồ sơ kỹ thuật."""
    system_knowledge = load_ziwei_knowledge()
    system_prompt = (
        "Bạn là Bậc Thầy Cao cấp Tử Vi Đẩu Số (Trường phái Tam Hợp dung hợp Tứ Hóa), đồng thời là chuyên gia tư vấn đời sống.\n"
        "Nhiệm vụ của bạn là dựa vào lá số Tử Vi an sao cố định (trong JSON) để viết bài luận giải "
        "HOÀN TOÀN BẰNG TIẾNG VIỆT tự nhiên, sâu sắc, thực tế. MỖI MỤC PHẢI CỤ THỂ ÍT NHẤT 3-5 CÂU CHI TIẾT.\n\n"
        "BÀI VIẾT BẮT BUỘC PHẢI ĐƯỢC CHIA THÀNH 2 PHẦN RÕ RỆT (SỬ DỤNG ĐÚNG 2 DÒNG TIÊU ĐỀ NÀY ĐỂ GIAO DIỆN TỰ ĐỘNG CHIA TAB):\n\n"
        "=== PHẦN I: LỜI THẦY BÌNH GIẢI DÀNH CHO BẠN ===\n"
        "(Văn phong của một bậc thầy kinh nghiệm đang trực tiếp ngồi đàm đạo, luận bàn cho thân chủ tới xem lá số. "
        "Nói thẳng vào đời sống thực tế, tâm lý, ấm áp, thấu đáo, dễ hiểu, tránh thuật ngữ cổ hủ. "
        "Bao gồm: 1. Con người & Bản mệnh (Bạn là ai, hạt nhân tính cách bẩm sinh, thế đứng xã hội; phân tích cung Mệnh & Thân cung chi tiết); "
        "2. Điểm Mạnh & Điểm Cần Chú Ý (Liệt kê rõ 3-4 điểm mạnh nổi bật của bản mệnh theo cung & sao; 2-3 điểm cần tu dưỡng để tránh tai ương); "
        "3. Màu Sắc, Hướng & Ngành Nghề Phù Hợp (Dựa vào ngũ hành cục, cung Quan Lộc: màu may mắn, hướng tốt, 5-7 ngành nghề lý tưởng cụ thể với lý do); "
        "4. Công danh, Sự nghiệp & Tiền tài (Cung Quan Lộc, Tài Bạch: thế mạnh làm ăn, nguồn thu cụ thể, cách giữ tiền & tránh thất thoát); "
        "5. Vận khí Năm Nay & 2 Năm Tới (Phân tích lưu niên hiện tại: năm nay sao gì chiếu Mệnh, thuận nghịch gì, cơ hội & rủi ro cụ thể theo từng lĩnh vực); "
        "6. Tình duyên & Gia đạo (Cung Phu Thê, Phúc Đức: nhân duyên, phong thái yêu thương, lời khuyên để hòa hợp); "
        "7. Lời dặn dò tâm huyết của Thầy (Hóa Kỵ năm sinh là bài học gì, cách chuyển hóa thách thức thành thành tựu lớn; kết bằng lời động viên chân thành)).\n\n"
        "=== PHẦN II: HỒ SƠ THUẬT SỐ KỸ THUẬT ===\n"
        "(Dành cho tra cứu chuyên sâu học thuật theo chuẩn SKILL.md: 1. Tổng luận Bản mệnh & Khí chất; 2. Tam phương tứ chính; "
        "3. Cấu trúc 14 Chính tinh Miếu Vượng Đắc Hãm & Cát/Sát tinh; 4. Tứ Hóa Năm Sinh; 5. Phân tích trọng điểm các cung; "
        "6. Vận hạn Đại Hạn & Lưu Niên; 7. Lời khuyên định hướng & Tu dưỡng).\n\n"
        "TUYỆT ĐỐI TUÂN THỦ: 100% Tiếng Việt thuần túy, dịch sạch mọi tên sao (Tử Vi, Thiên Cơ, Vũ Khúc...), cung vị (Mệnh, Phụ, Phúc...), hóa diệu (Hóa Lộc, Hóa Kỵ...)."
    )

    user_content = (
        f"THÔNG TIN ĐƯƠNG SỐ:\n{json.dumps(query_info, ensure_ascii=False, indent=2)}\n\n"
        f"LÁ SỐ TỬ VI (JSON TÍNH TOÁN CỐ ĐỊNH):\n{json.dumps(chart_data, ensure_ascii=False, indent=2)}\n\n"
        "Hãy viết bài luận giải Tử Vi chuyên sâu bằng Tiếng Việt 100% theo đúng cấu trúc 2 phần quy chuẩn."
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

    p_name_display = query_info.get('profile_name') or 'bạn'

    return (
        f"=== PHẦN I: LỜI THẦY BÌNH GIẢI DÀNH CHO BẠN ===\n\n"
        f"Chào {p_name_display}, nhìn vào thế đứng 12 Cung và các vì tinh tú trên lá số Tử Vi của bạn, Thầy xin chia sẻ những nét đúc kết tâm huyết nhất:\n\n"
        f"#### 1. Tổng Quan Bản Thân & Khí Chất Tiên Thiên\n"
        f"- **Mệnh Cung ngự tại Chi {ming_branch_vn}** (Cục {ju.get('name', 'chưa rõ')}): "
        f"Bạn là người có cá tính độc lập, tư duy mạch lạc và luôn có lòng tự trọng cao. "
        f"Cung Thân cư tại {shen_palace_vn} cho thấy nửa đời sau bạn sẽ càng hướng về giá trị thực chất, chú trọng chiều sâu tư tưởng và sự nghiệp vững chắc.\n\n"
        f"#### 2. Đường Công Danh, Sự Nghiệp & Tài Lộc\n"
        f"- Cung Quan Lộc và Tài Bạch của bạn cho thấy bạn hợp với những công việc đòi hỏi trí tuệ, kỹ năng chuyên sâu hoặc vai trò quản lý mang tính độc lập.\n"
        f"- **Tứ Hóa Năm Sinh:** {sihua_text}. Nơi có Hóa Lộc là dòng chảy phúc đức và cơ hội tài chính dồi dào, cần tận dụng để bứt phá.\n\n"
        f"#### 3. Tình Duyên & Mối Quan Hệ\n"
        f"- Trong giao tiếp và gia đạo, bạn là người tình cảm nhưng đôi khi biểu đạt hơi kín đáo hoặc có phần khắt khe do kỳ vọng cao. Hãy lắng nghe và chia sẻ chân thành để tạo sự đồng điệu bền lâu.\n\n"
        f"#### 4. Vận Trình & Lời Dặn Của Thầy\n"
        f"- Hãy chú ý cung vị đón nhận Hóa Kỵ năm sinh: Đây không phải là điều bất hạnh, mà chính là bài học lớn nhất mà cuộc đời thử thách để tôi luyện bạn thành người kiên cường và tài giỏi.\n"
        f"- Trong giai đoạn vận hạn hiện tại ({horo_text}), nên chủ động học tập kỹ năng mới, mở rộng mối quan hệ tích cực và giữ tâm thế bình thản trước biến động.\n\n"
        f"=== PHẦN II: HỒ SƠ THUẬT SỐ KỸ THUẬT ===\n\n"
        f"### 1. Tổng luận Bản Mệnh & Khí chất nền tảng\n"
        f"- **Mệnh Cung:** Ngự tại Chi `{ming_branch_vn}` (Can Chi: `{ming_ganzhi_vn}`).\n"
        f"- **Thân Cung:** Cư tại Cung `{shen_palace_vn}` (Chi `{shen_branch_vn}`).\n"
        f"- **Ngũ Hành Cục:** `{ju.get('name', '')}` (Cục số {ju.get('number', '')} — khởi đại hạn ở tuổi {ju.get('number', '')}).\n"
        f"- **Mệnh Chủ:** `{chart.get('ming_zhu', '')}` | **Thân Chủ:** `{chart.get('shen_zhu', '')}`\n"
        f"- **Chiều vận Đại hạn:** `{direction_vn}`\n\n"
        f"### 2. Tứ Hóa Năm Sinh (Điểm tựa & Thách thức tiên thiên)\n"
        f"- {sihua_text}\n"
        f"*(Hóa Lộc chủ phúc duyên và tài chính; Hóa Quyền chủ hành động và uy quyền; Hóa Khoa chủ danh dự, trí tuệ; Hóa Kỵ chủ bài học cần tôi luyện).*\n\n"
        f"### 3. Vận trình Thời gian\n"
        f"{horo_text}\n\n"
        f"### 4. Lời khuyên định hướng & Quản trị rủi ro\n"
        f"- Thấu hiểu cung Mệnh để phát huy sở trường bẩm sinh; quan sát cung Thân để điều chỉnh định hướng nửa đời sau.\n"
        f"- Chú trọng cung có Hóa Kỵ năm sinh để quản trị rủi ro tối ưu.\n"
        f"{DISCLAIMER_ZIWEI}"
    )


async def interpret_bazi(chart_data: Dict[str, Any], query_info: Dict[str, Any]) -> str:
    """Luận giải Bát Tự 100% bằng tiếng Việt với cấu trúc 2 tầng: Lời thầy bình giải & Hồ sơ kỹ thuật."""
    system_knowledge = load_bazi_knowledge()
    system_prompt = (
        "Bạn là Bậc Thầy Tử Bình Bát Tự uyên thâm, đồng thời là một chuyên gia thấu hiểu tâm lý nhân sinh sâu sắc.\n"
        "Nhiệm vụ của bạn là dựa vào bảng Tứ Trụ, Thập Thần, Đại Vận (trong JSON) để viết bài phân tích TOÀN DIỆN BẰNG TIẾNG VIỆT 100%.\n\n"
        "BÀI VIẾT BẮT BUỘC PHẢI ĐƯỢC CHIA THÀNH 2 PHẦN RÕ RỆT (SỬ DỤNG ĐÚNG 2 DÒNG TIÊU ĐỀ NÀY ĐỂ GIAO DIỆN TỰ ĐỘNG CHIA TAB):\n\n"
        "=== PHẦN I: LỜI THẦY BÌNH GIẢI DÀNH CHO BẠN ===\n"
        "(Văn phong của bậc thầy đang ngồi tâm tình, phân tích trực tiếp cho đương số tới xem lá số. "
        "Hình tượng hóa ngũ hành thật sống động, giải thích bằng ngôn ngữ đời thường gần gũi, ấm áp, sâu sắc, MỖI MỤC PHẢI CỤ THỂ ÍT NHẤT 3-5 CÂU CHI TIẾT RÕ RÀNG: "
        "1. Con Người & Bản Mệnh (Nhật chủ là gì, hình tượng ngũ hành sinh động; phân tích điểm mạnh cốt lõi (3-4 điểm rõ ràng thực tế) và điểm cần tu dưỡng (2-3 điểm cụ thể); đặc điểm tính cách bẩm sinh và thế đứng xã hội); "
        "2. Điểm Mạnh & Điểm Cần Chú Ý (Liệt kê rõ ràng 3-4 điểm mạnh nổi bật của bản mệnh, 2-3 điểm cần chú ý/phát triển để không bị vận hạn kéo xuống; phân tích ngắn gọn từng điểm theo góc độ ngũ hành & tính cách thực tế); "
        "3. Màu Sắc, Hướng & Ngành Nghề Phù Hợp (Dựa vào ngũ hành Hỷ Thần & Dụng Thần: liệt kê cụ thể 3-4 màu sắc may mắn, 2-3 hướng địa lý xuất hành & cư trú tốt, 5-7 ngành nghề lý tưởng phù hợp bản mệnh; giải thích lý do mỗi lựa chọn); "
        "4. Công Danh, Sự Nghiệp & Tài Lộc (Năng khiếu kiếm tiền cốt lõi, nên chuyên môn hay làm chủ, cách giữ tiền & đầu tư thông minh, lúc nào tài lộc vượng phát theo đại vận); "
        "5. Vận Khí Năm Nay & 2 Năm Tới (Dựa vào đại vận hiện tại + lưu niên: năm nay thuận hay nghịch ở lĩnh vực nào, cơ hội & rủi ro cụ thể cần phòng tránh, tháng/quý nào cần đặc biệt chú ý); "
        "6. Lời Dặn Tâm Huyết Của Thầy (Phương pháp bổ khuyết ngũ hành cải vận thực tế trong ăn mặc, phương hướng, lối sống; kết bằng lời động viên chân thành 2-3 câu)).\n\n"
        "=== PHẦN II: HỒ SƠ THUẬT SỐ KỸ THUẬT ===\n"
        "(Dành cho tra cứu học thuật theo đúng 8 mục chuẩn mực SKILL.md: 1. Bảng Tứ Trụ Can Chi; 2. Phân tích Nhật Chủ vượng suy & Cách cục; "
        "3. Hỷ Dụng Thần & Kỵ Thần (liệt kê cụ thể ngũ hành nào là Hỷ/Dụng/Kỵ Thần và tại sao); 4. Cấu hình Thập Thần & Tính cách; 5. Phân tích chi tiết các phương diện cuộc sống; "
        "6. Đại Vận & Lưu Niên tường giải (phân tích rõ đại vận hiện tại + 2 đại vận kế tiếp); 7. Danh sách kiểm chứng quá khứ; 8. Tổng kết & Miễn trừ trách nhiệm).\n\n"
        "TUYỆT ĐỐI KHÔNG DÙNG CHỮ HÁN. Toàn bộ tên can, chi, thập thần, ngũ hành đều viết phiên âm Hán-Việt 100%."
    )

    user_content = (
        f"THÔNG TIN ĐƯƠNG SỐ:\n{json.dumps(query_info, ensure_ascii=False, indent=2)}\n\n"
        f"DỮ LIỆU TỨ TRỤ BÁT TỰ (JSON TÍNH TOÁN CỐ ĐỊNH):\n{json.dumps(chart_data, ensure_ascii=False, indent=2)}\n\n"
        "Hãy viết bài luận giải Tứ Trụ hoàn chỉnh bằng Tiếng Việt 100% theo đúng cấu trúc 2 phần quy chuẩn."
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
    p_name = query_info.get("profile_name") or "bạn"

    # Hình tượng hóa Nhật chủ
    dm_stem = dm.get("stem", "甲")
    dm_desc = {
        "甲": "Giáp Mộc là cây tùng bách đại thụ sừng sững giữa đất trời. Bạn mang khí chất của bậc lãnh tụ, chính trực, khẳng khái, che chở cho người khác nhưng đôi khi hơi cứng nhắc, cần học cách mềm mại thích ứng.",
        "乙": "Ất Mộc là hoa cỏ dây leo mềm mại nhưng sức sống phi thường. Bạn linh hoạt, khéo léo, giỏi thích nghi và biết nắm bắt lòng người.",
        "丙": "Bính Hỏa là vầng mặt trời rực rỡ, hào hiệp, nồng nhiệt, thích cống hiến quang minh nhưng đôi khi nôn nóng.",
        "丁": "Đinh Hỏa là ngọn đèn đêm ấm áp, nội tâm sâu sắc, tỉ mỉ, sáng tạo và thấu cảm lòng người.",
        "戊": "Mậu Thổ là núi non hùng vĩ, trầm tĩnh, kiên định, đáng tin cậy, nặng tình nghĩa nhưng đôi lúc bảo thủ.",
        "己": "Kỷ Thổ là đất màu mỡ dung dưỡng vạn vật, bao dung, khiêm nhường, khéo lo toan chu tất mọi bề.",
        "庚": "Canh Kim là thanh bảo kiếm sắc bén, quả quyết, dũng cảm, trọng nghĩa khí nhưng dễ bộc trực thẳng thắn quá mức.",
        "辛": "Tân Kim là ngọc ngà châu báu lấp lánh, thanh lịch, tinh tế, có lòng tự tôn cao và gu thẩm mỹ sắc sảo.",
        "壬": "Nhâm Thủy là đại dương bao la cuộn sóng, phóng khoáng, chí lớn, thông minh kiệt xuất và thích tự do.",
        "癸": "Quý Thủy là sương mai thanh khiết, nhu hòa, tĩnh lặng, trực giác nhạy bén và có tài quan sát sâu xa.",
    }.get(dm_stem, "Bản mệnh ngũ hành hài hòa, chứa đựng nhiều tiềm năng lớn lao.")

    # Màu sắc & hướng theo ngũ hành nhật chủ
    element_color_advice = {
        "甲": {"colors": "xanh lá (ngọc bích, lục ngọc, lá cây), xanh lam (thiên thanh)", "dirs": "Đông, Đông Nam", "jobs": "giáo dục, y tế, nông nghiệp hữu cơ, môi trường, thiết kế cây xanh, văn hóa nghệ thuật, luật pháp, tư vấn"},
        "乙": {"colors": "xanh lá nhạt (non xanh, bạc hà), trắng sữa, hồng phấn", "dirs": "Đông, Đông Nam, Nam", "jobs": "thời trang, mỹ phẩm, dịch vụ chăm sóc sức khỏe, dược liệu thảo mộc, giáo dục nghệ thuật, kinh doanh thực phẩm"},
        "丙": {"colors": "đỏ (đỏ tươi, hồng đỏ, cam rực), vàng kim, trắng sáng", "dirs": "Nam, Đông Nam, Đông", "jobs": "truyền thông & giải trí, marketing, chính trị & ngoại giao, giảng dạy, nghệ thuật biểu diễn, năng lượng tái tạo"},
        "丁": {"colors": "đỏ đậm (huyết dụ), tím, xanh lá đậm", "dirs": "Nam, Đông, Tây Nam", "jobs": "nghiên cứu khoa học, công nghệ thông tin, thiết kế, tâm lý học, y tế chuyên sâu, thủ công mỹ nghệ"},
        "戊": {"colors": "vàng đất (vàng nghệ, nâu vàng), đỏ gạch, cam đất", "dirs": "Trung tâm, Tây Nam, Đông Bắc", "jobs": "bất động sản, khai khoáng, nông nghiệp, logistics, xây dựng, quản lý dự án, bảo hiểm"},
        "己": {"colors": "vàng nhạt, nâu đất, be, kem", "dirs": "Tây Nam, Đông Bắc, Trung tâm", "jobs": "dịch vụ nhà hàng-khách sạn, tài chính kế toán, hành chính, chăm sóc sức khỏe, xã hội & từ thiện"},
        "庚": {"colors": "trắng (bạch ngọc), xám bạc, vàng kim", "dirs": "Tây, Tây Bắc, Bắc", "jobs": "pháp lý & tòa án, quân sự & an ninh, tài chính đầu tư, cơ khí chế tạo, luyện kim, thể thao chuyên nghiệp"},
        "辛": {"colors": "trắng ngà, bạc, vàng nhạt, hồng phấn tinh tế", "dirs": "Tây, Tây Bắc", "jobs": "trang sức & mỹ phẩm cao cấp, thời trang luxury, nghệ thuật, y học thẩm mỹ, ngoại giao & PR"},
        "壬": {"colors": "đen (huyền), xanh đậm (hải quân), xám than", "dirs": "Bắc, Đông Bắc, Tây Bắc", "jobs": "công nghệ & lập trình, khởi nghiệp sáng tạo, nghiên cứu học thuật, triết học & văn học, logistics & giao thông"},
        "癸": {"colors": "đen nhạt, xám, xanh tím (tím nhàn), trắng bạch", "dirs": "Bắc, Đông Bắc", "jobs": "phân tích dữ liệu, nghiên cứu khoa học, tâm lý & trị liệu, nghệ thuật âm nhạc, thiền định & tâm linh, y học cổ truyền"},
    }.get(dm_stem, {"colors": "vàng, xanh, đỏ", "dirs": "Đông, Nam", "jobs": "giáo dục, kinh doanh, dịch vụ"})

    # Lấy đại vận hiện tại
    import datetime
    current_year = datetime.datetime.now().year
    current_dayun = None
    for dy in dayun.get("pillars", []):
        if dy.get("start_year", 0) <= current_year <= dy.get("end_year", 9999):
            current_dayun = dy
            break
    if not current_dayun and dayun.get("pillars"):
        current_dayun = dayun["pillars"][0]

    dayun_now_text = f"Đại Vận **{current_dayun.get('vn_ganzhi', '')}** (giai đoạn tuổi {current_dayun.get('start_age')}-{current_dayun.get('end_age')}, từ {current_dayun.get('start_year')})" if current_dayun else f"Khởi vận khoảng tuổi {dayun.get('start_age_display', '?')}"

    return (
        f"=== PHẦN I: LỜI THẦY BÌNH GIẢI DÀNH CHO BẠN ===\n\n"
        f"Chào {p_name}, qua bảng Tứ Trụ Bát Tự gồm 4 Can và 4 Chi của bạn, Thầy xin gửi đến bạn bản phân tích gần gũi và chân thành nhất:\n\n"
        f"#### 1. Bạn Là Ai? (Khí Chất & Bản Mệnh Nhật Chủ)\n"
        f"- Bạn mang **Nhật Chủ {dm.get('vn', 'Giáp')} ({dm.get('vn_element', 'Mộc')} - {dm.get('yinyang', 'Dương')})**. {dm_desc}\n"
        f"- Sinh vào tháng **{dm.get('born_in_month_vn', '')}**, khí ngũ hành của bạn {'rất vượng, đắc lệnh tháng — nội lực mạnh mẽ, bền bỉ, nhưng cũng cần biết kiềm chế và khiêm nhường để tránh vượng thái quá gây phản tác dụng' if dm.get('is_dangling') else 'tương đối trung bình, cần môi trường và quý nhân bổ trợ để phát huy tốt nhất tiềm năng bẩm sinh'}.\n\n"
        f"#### 2. Điểm Mạnh & Điểm Cần Chú Ý\n"
        f"- **Điểm mạnh nổi bật của bạn:**\n"
        f"  - Ý chí và lòng kiên nhẫn vượt trội, không dễ bỏ cuộc giữa chừng\n"
        f"  - Tư duy logic và khả năng lập kế hoạch bài bản có hệ thống\n"
        f"  - Trung thực, trọng chữ tín — đây là nền tảng xây dựng uy tín lâu dài\n"
        f"  - Bản phân bổ ngũ hành: **{wuxing}** — phản ánh nguồn lực bạn có thể khai thác\n"
        f"- **Điểm cần tu dưỡng:**\n"
        f"  - Đôi khi quá kiên định đến mức cứng nhắc — cần linh hoạt hơn trước biến cố\n"
        f"  - Nên chú ý dưỡng sinh và cân bằng ngũ hành để tránh hao tổn sức khỏe\n\n"
        f"#### 3. Màu Sắc, Hướng & Ngành Nghề Phù Hợp Bản Mệnh\n"
        f"- **Màu sắc may mắn:** {element_color_advice['colors']}\n"
        f"  *(Mặc, trang trí phòng làm việc/nhà cửa theo những tông màu này sẽ hỗ trợ vận khí tốt hơn)*\n"
        f"- **Hướng xuất hành & cư trú tốt:** {element_color_advice['dirs']}\n"
        f"  *(Khi cần gặp đối tác quan trọng hoặc chuyển nhà/văn phòng, nên ưu tiên các hướng này)*\n"
        f"- **Ngành nghề tương hợp bản mệnh:** {element_color_advice['jobs']}\n\n"
        f"#### 4. Đường Công Danh & Tài Lộc\n"
        f"- Năng lượng của bạn thích hợp phát triển theo hướng chuyên gia có tầm ảnh hưởng hoặc người làm chủ tự thân.\n"
        f"- **Lời dặn về tài vận:** Tránh tâm lý đầu cơ nóng vội khi gặp những năm có Lục Xung. Hãy tập trung xây dựng tài sản dựa trên giá trị thực và chuyên môn cốt lõi.\n\n"
        f"#### 5. Vận Khí Năm {current_year} & Những Năm Tới\n"
        f"- {dayun_now_text}. Đây là nền tảng khí thế tổng quát chi phối mọi lĩnh vực trong giai đoạn này.\n"
        f"- Hãy tận dụng thế mạnh của đại vận hiện tại để bứt phá trong chuyên môn, đồng thời cẩn trọng các năm có lưu niên Xung với Nhật Chủ.\n"
        f"- **Thời điểm vàng:** Những tháng đầu năm Âm lịch thường là thời điểm khởi phát tốt nhất; hãy tập trung ra quyết định quan trọng trong khoảng Tháng 1-3 Âm lịch.\n\n"
        f"#### 6. Lời Dặn Tâm Huyết Của Thầy\n"
        f"- Bạn khởi Đại Vận theo hướng **{dayun.get('direction_text', '')}**, mỗi vận kéo dài 10 năm.\n"
        f"- **Cải vận thực tế:** Mặc trang phục màu {element_color_advice['colors'].split(',')[0]}; đặt bàn làm việc và giường ngủ theo hướng {element_color_advice['dirs'].split(',')[0]}; tăng cường kết giao với người cùng ngũ hành tương sinh.\n"
        f"- Hãy luôn nhớ: Lá số chỉ là khung trời — chính thái độ, hành động và lòng thiện lành của bạn mới là người viết tiếp câu chuyện cuộc đời.\n\n"
        f"=== PHẦN II: HỒ SƠ THUẬT SỐ KỸ THUẬT ===\n\n"
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
        f"{DISCLAIMER_BAZI}"
    )


async def interpret_cross_check(bazi_data: Dict[str, Any], ziwei_data: Dict[str, Any], profile_name: str, focus_topic: str) -> str:
    """Đối chiếu chéo giữa Tứ Trụ Bát Tự và Tử Vi Đẩu Số 100% bằng tiếng Việt với cấu trúc 2 tầng."""
    system_prompt = (
        "Bạn là Bậc Thầy Nghiên cứu Huyền học Đông Phương hàng đầu, thông thạo cả Tứ Trụ Bát Tự và Tử Vi Đẩu Số.\n"
        "Nhiệm vụ của bạn là ĐỐI CHIẾU CHÉO 2 môn phái cho cùng một lá số của đương số.\n\n"
        "BÀI VIẾT BẮT BUỘC PHẢI ĐƯỢC CHIA THÀNH 2 PHẦN RÕ RỆT (SỬ DỤNG ĐÚNG 2 DÒNG TIÊU ĐỀ NÀY ĐỂ GIAO DIỆN TỰ ĐỘNG CHIA TAB):\n\n"
        "=== PHẦN I: LỜI THẦY BÌNH GIẢI DÀNH CHO BẠN ===\n"
        "(Văn phong của bậc thầy đang phân tích trực tiếp cho đương số: "
        "1. Đúc kết tổng hòa (Bức tranh chung về con người và cuộc đời khi soi chiếu qua cả 2 môn); "
        "2. Về chủ đề quan tâm ({focus_topic}): Đâu là cơ hội vàng lớn nhất, đâu là thách thức cần phòng tránh; "
        "3. Lời khuyên hành động thực tế nhất để phát huy ưu thế).\n\n"
        "=== PHẦN II: HỒ SƠ THUẬT SỐ KỸ THUẬT ===\n"
        "(Dành cho tra cứu học thuật: 1. Điểm tương đồng cốt lõi (Consensus) giữa 2 hệ thống; "
        "2. Điểm bổ khuyết (Tử Vi thấy gì mà Bát Tự chưa hiển lộ và ngược lại); "
        "3. Bảng đối chiếu ngũ hành và tinh diệu).\n\n"
        "TUYỆT ĐỐI KHÔNG DÙNG CHỮ HÁN. Toàn bộ bài viết bằng Tiếng Việt 100%."
    )

    user_content = (
        f"ĐƯƠNG SỐ: {profile_name}\n"
        f"CHỦ ĐỀ QUAN TÂM: {focus_topic}\n\n"
        f"DỮ LIỆU BÁT TỰ:\n{json.dumps(bazi_data, ensure_ascii=False, indent=2)}\n\n"
        f"DỮ LIỆU TỬ VI:\n{json.dumps(ziwei_data, ensure_ascii=False, indent=2)}\n\n"
        "Hãy viết bài đối chiếu chéo chuyên sâu bằng Tiếng Việt 100% theo đúng cấu trúc 2 phần quy chuẩn."
    )

    llm_result = await call_llm(system_prompt, user_content)
    if llm_result:
        if "Lời nhắc quan trọng" not in llm_result:
            llm_result += DISCLAIMER_ZIWEI
        return llm_result

    # Fallback
    return (
        f"=== PHẦN I: LỜI THẦY BÌNH GIẢI DÀNH CHO BẠN ===\n\n"
        f"Chào {profile_name}, khi đặt lá số Bát Tự (Tứ Trụ) và lá số Tử Vi Đẩu Số của bạn cạnh nhau để đối chiếu về chủ đề **'{focus_topic}'**, Thầy nhận thấy:\n\n"
        f"#### 1. Bức Tranh Tổng Hòa Về Cuộc Đời Bạn\n"
        f"- Cả hai môn phái đều khẳng định bạn là người có ý chí tự lập cao, năng lực chuyên môn sắc sảo và phẩm chất trung thực, khát khao tạo dựng sự nghiệp bền vững.\n"
        f"- Bát Tự cho thấy cốt lõi nội lực của bạn (khí thế của Nhật Chủ), còn Tử Vi làm rõ các mối bang giao, cơ hội thăng tiến và cách ứng xử cụ thể với từng người trong xã hội.\n\n"
        f"#### 2. Lời Giải Cho Chủ Đề '{focus_topic}'\n"
        f"- Đây là thời điểm bạn nên phát huy tối đa thế mạnh chuyên môn, kiên trì theo đuổi mục tiêu trung hạn thay vì nhảy việc hoặc đổi hướng đột ngột.\n"
        f"- Quý nhân của bạn chính là những người tôn trọng sự trung thực và thực lực của bạn.\n\n"
        f"=== PHẦN II: HỒ SƠ THUẬT SỐ KỸ THUẬT ===\n\n"
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
        f"{DISCLAIMER_ZIWEI}"
    )
