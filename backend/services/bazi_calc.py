"""Bát Tự (Tứ Trụ) Calculation Service.

Sử dụng thư viện `lunar_python` để tính toán chính xác 100%:
- Đổi năm theo Lập Xuân (Lichun)
- Đổi tháng theo 12 Tiết khí
- Giờ Dạ Tý: mặc định `same_day` (23:00 - 00:00 vẫn tính ngày hôm đó, sect=2), hỗ trợ `next_day` (sect=1)
- Tính chiều thuận/nghịch Đại vận và tuổi khởi vận
- Thập thần thiên can & tàng can địa chi
- Nhận diện xung, hợp, hình theo references/tiangan-dizhi.md
"""
from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional, Tuple

from lunar_python import Lunar, Solar

# Bảng ngũ hành và âm dương cho 10 Thiên can
STEM_INFO: Dict[str, Dict[str, str]] = {
    "甲": {"yinyang": "阳", "element": "木", "vn": "Giáp", "vn_element": "Mộc (Dương)"},
    "乙": {"yinyang": "阴", "element": "木", "vn": "Ất", "vn_element": "Mộc (Âm)"},
    "丙": {"yinyang": "阳", "element": "火", "vn": "Bính", "vn_element": "Hỏa (Dương)"},
    "丁": {"yinyang": "阴", "element": "火", "vn": "Đinh", "vn_element": "Hỏa (Âm)"},
    "戊": {"yinyang": "阳", "element": "土", "vn": "Mậu", "vn_element": "Thổ (Dương)"},
    "己": {"yinyang": "阴", "element": "土", "vn": "Kỷ", "vn_element": "Thổ (Âm)"},
    "庚": {"yinyang": "阳", "element": "金", "vn": "Canh", "vn_element": "Kim (Dương)"},
    "辛": {"yinyang": "阴", "element": "金", "vn": "Tân", "vn_element": "Kim (Âm)"},
    "壬": {"yinyang": "阳", "element": "水", "vn": "Nhâm", "vn_element": "Thủy (Dương)"},
    "癸": {"yinyang": "阴", "element": "水", "vn": "Quý", "vn_element": "Thủy (Âm)"},
}

# Bảng địa chi, tàng can, thời thần
BRANCH_INFO: Dict[str, Dict[str, Any]] = {
    "子": {"element": "水", "yinyang": "阳", "hours": "23:00-01:00", "hidden": ["癸"], "vn": "Tý", "vn_element": "Thủy"},
    "丑": {"element": "土", "yinyang": "阴", "hours": "01:00-03:00", "hidden": ["己", "辛", "癸"], "vn": "Sửu", "vn_element": "Thổ"},
    "寅": {"element": "木", "yinyang": "阳", "hours": "03:00-05:00", "hidden": ["甲", "丙", "戊"], "vn": "Dần", "vn_element": "Mộc"},
    "卯": {"element": "木", "yinyang": "阴", "hours": "05:00-07:00", "hidden": ["乙"], "vn": "Mão", "vn_element": "Mộc"},
    "辰": {"element": "土", "yinyang": "阳", "hours": "07:00-09:00", "hidden": ["戊", "乙", "癸"], "vn": "Thìn", "vn_element": "Thổ"},
    "巳": {"element": "火", "yinyang": "阴", "hours": "09:00-11:00", "hidden": ["丙", "戊", "庚"], "vn": "Tỵ", "vn_element": "Hỏa"},
    "午": {"element": "火", "yinyang": "阳", "hours": "11:00-13:00", "hidden": ["丁", "己"], "vn": "Ngọ", "vn_element": "Hỏa"},
    "未": {"element": "土", "yinyang": "阴", "hours": "13:00-15:00", "hidden": ["己", "丁", "乙"], "vn": "Mùi", "vn_element": "Thổ"},
    "申": {"element": "金", "yinyang": "阳", "hours": "15:00-17:00", "hidden": ["庚", "壬", "戊"], "vn": "Thân", "vn_element": "Kim"},
    "酉": {"element": "金", "yinyang": "阴", "hours": "17:00-19:00", "hidden": ["辛"], "vn": "Dậu", "vn_element": "Kim"},
    "戌": {"element": "土", "yinyang": "阳", "hours": "19:00-21:00", "hidden": ["戊", "辛", "丁"], "vn": "Tuất", "vn_element": "Thổ"},
    "亥": {"element": "水", "yinyang": "阴", "hours": "21:00-23:00", "hidden": ["壬", "甲"], "vn": "Hợi", "vn_element": "Thủy"},
}

SHISHEN_VN: Dict[str, str] = {
    "比肩": "Tỷ Kiên",
    "劫财": "Kiếp Tài",
    "食神": "Thực Thần",
    "伤官": "Thương Quan",
    "偏财": "Thiên Tài",
    "正财": "Chính Tài",
    "七杀": "Thất Sát",
    "正官": "Chính Quan",
    "偏印": "Thiên Ấn",
    "正印": "Chính Ấn",
    "日主": "Nhật Chủ (Bản Thân)",
}

WUXING_VN: Dict[str, str] = {
    "木": "Mộc",
    "火": "Hỏa",
    "土": "Thổ",
    "金": "Kim",
    "水": "Thủy",
}

# Tương tác Địa chi
LIU_CHONG = [("子", "午"), ("丑", "未"), ("寅", "申"), ("卯", "酉"), ("辰", "戌"), ("巳", "亥")]
LIU_HE = [
    ("子", "丑", "土"), ("寅", "亥", "木"), ("卯", "戌", "火"),
    ("辰", "酉", "金"), ("巳", "申", "水"), ("午", "未", "土"),
]
SAN_HE = [
    (["申", "子", "辰"], "水局"),
    (["亥", "卯", "未"], "木局"),
    (["寅", "午", "戌"], "火局"),
    (["巳", "酉", "丑"], "金局"),
]
SAN_XING = [
    (["寅", "巳", "申"], "无恩之刑 (Vô Ân Chi Hình)"),
    (["丑", "戌", "未"], "恃势之刑 (Thị Thế Chi Hình)"),
    (["子", "卯"], "无礼之刑 (Vô Lễ Chi Hình)"),
]
ZI_XING = ["辰", "午", "酉", "亥"]


def parse_datetime(dt_str: str) -> datetime:
    """Parse string formatted as YYYY-MM-DD HH:MM or similar."""
    clean = dt_str.strip().replace("T", " ")
    for fmt in ("%Y-%m-%d %H:%M:%S", "%Y-%m-%d %H:%M", "%Y-%m-%d"):
        try:
            return datetime.strptime(clean, fmt)
        except ValueError:
            pass
    raise ValueError(f"Không thể phân tích định dạng ngày giờ: {dt_str}")


def detect_branch_interactions(branches: List[str]) -> Dict[str, List[Dict[str, Any]]]:
    """Phát hiện lục xung, lục hợp, tam hợp, tam hình, tự hình giữa 4 địa chi."""
    interactions: Dict[str, List[Dict[str, Any]]] = {
        "liu_chong": [],
        "liu_he": [],
        "san_he": [],
        "san_xing": [],
        "zi_xing": [],
    }

    # Lục xung
    for b1, b2 in LIU_CHONG:
        if b1 in branches and b2 in branches:
            interactions["liu_chong"].append({
                "branches": [b1, b2],
                "name": f"{b1}{b2} tương xung ({BRANCH_INFO[b1]['vn']}-{BRANCH_INFO[b2]['vn']} xung)",
                "nature": "Xung động, biến đổi, đối kháng",
            })

    # Lục hợp
    for b1, b2, elem in LIU_HE:
        if b1 in branches and b2 in branches:
            interactions["liu_he"].append({
                "branches": [b1, b2],
                "result_element": elem,
                "name": f"{b1}{b2} lục hợp hóa {elem} ({BRANCH_INFO[b1]['vn']}-{BRANCH_INFO[b2]['vn']} hợp {WUXING_VN.get(elem, elem)})",
                "nature": "Hòa hợp, gắn kết, hợp tác",
            })

    # Tam hợp
    for group, name in SAN_HE:
        count = sum(1 for b in group if b in branches)
        if count == 3:
            interactions["san_he"].append({
                "branches": group,
                "name": f"Tam hợp {name}",
                "nature": "Liên kết ngũ hành cực mạnh",
                "is_complete": True,
            })
        elif count == 2:
            present = [b for b in group if b in branches]
            interactions["san_he"].append({
                "branches": present,
                "name": f"Bán tam hợp {name} ({', '.join(present)})",
                "nature": "Khí thế bán hợp hướng về hành cục",
                "is_complete": False,
            })

    # Tam hình
    for group, name in SAN_XING:
        count = sum(1 for b in group if b in branches)
        if count == len(group):
            interactions["san_xing"].append({
                "branches": group,
                "name": name,
                "nature": "Áp lực, xích mích, cần cẩn trọng kỷ luật",
            })

    # Tự hình
    for b in ZI_XING:
        if branches.count(b) >= 2:
            interactions["zi_xing"].append({
                "branch": b,
                "name": f"{b}{b} tự hình ({BRANCH_INFO[b]['vn']} tự hình)",
                "nature": "Tự tạo áp lực, trăn trở nội tâm",
            })

    return interactions


def build_bazi_output(payload: Dict[str, Any]) -> Dict[str, Any]:
    """Tính toán Tứ Trụ (Bát Tự) chuẩn từ payload đầu vào."""
    calendar_type = str(payload.get("calendar_type", "solar")).lower()
    birth_time_str = str(payload.get("birth_time", "")).strip()
    if not birth_time_str:
        raise ValueError("Thiếu trường bắt buộc 'birth_time'")

    gender_raw = str(payload.get("gender", "男")).strip()
    is_male = gender_raw in ("男", "male", "nam", "1", 1)
    gender_code = 1 if is_male else 0
    gender_text = "男 (Nam)" if is_male else "女 (Nữ)"

    # Khẩu kính Dạ Tý: same_day (23:00 - 00:00 vẫn là ngày hôm đó, sect=2)
    late_zi_rule = str(payload.get("late_zi_rule", "same_day")).lower()
    sect = 1 if late_zi_rule == "next_day" else 2

    # Khẩu kính tháng nhuận (cho lịch âm)
    is_leap_month = bool(payload.get("is_leap_month", False))

    dt = parse_datetime(birth_time_str)
    warnings: List[str] = []

    # Xử lý theo loại lịch
    if calendar_type == "lunar":
        lunar = Lunar.fromYmdHms(dt.year, dt.month, dt.day, dt.hour, dt.minute, dt.second)
        solar = lunar.getSolar()
    else:
        solar = Solar.fromYmdHms(dt.year, dt.month, dt.day, dt.hour, dt.minute, dt.second)
        lunar = solar.getLunar()

    # Khởi tạo Bát Tự từ lunar
    ec = lunar.getEightChar()
    ec.setSect(sect)

    # Cảnh báo giờ Dạ Tý
    if dt.hour == 23 or (dt.hour == 0 and dt.minute == 0):
        if late_zi_rule == "same_day":
            warnings.append(
                "Sinh vào khoảng 23:00-00:00 (giờ Dạ Tý): Áp dụng khẩu kính chuẩn 'same_day' "
                "(vẫn tính can chi ngày hôm đó, can giờ khởi theo ngày hôm đó)."
            )
        else:
            warnings.append(
                "Sinh vào khoảng 23:00-00:00 (giờ Dạ Tý): Áp dụng khẩu kính 'next_day' (can chi ngày chuyển sang ngày hôm sau)."
            )

    # Kiểm tra giao tiết khí gần (trong vòng 24 giờ)
    prev_jie = lunar.getPrevJie()
    next_jie = lunar.getNextJie()
    if prev_jie:
        prev_solar = prev_jie.getSolar()
        prev_dt = datetime(prev_solar.getYear(), prev_solar.getMonth(), prev_solar.getDay(),
                            prev_solar.getHour(), prev_solar.getMinute(), prev_solar.getSecond())
        if abs((dt - prev_dt).total_seconds()) < 86400:
            warnings.append(f"Sinh rất gần tiết khí {prev_jie.getName()} ({prev_solar.toYmdHms()}), độ chính xác phút sinh rất quan trọng.")

    # 4 Trụ Can Chi
    year_stem = ec.getYearGan()
    year_branch = ec.getYearZhi()
    month_stem = ec.getMonthGan()
    month_branch = ec.getMonthZhi()
    day_stem = ec.getDayGan()
    day_branch = ec.getDayZhi()
    hour_stem = ec.getTimeGan()
    hour_branch = ec.getTimeZhi()

    # Thập thần & Tàng can
    def pack_pillar(stem: str, branch: str, shishen_gan: str, hide_gans: List[str], shishen_zhis: List[str]) -> Dict[str, Any]:
        stem_inf = STEM_INFO.get(stem, {})
        branch_inf = BRANCH_INFO.get(branch, {})
        hidden_details = []
        for g, s in zip(hide_gans, shishen_zhis):
            g_inf = STEM_INFO.get(g, {})
            hidden_details.append({
                "stem": g,
                "vn": g_inf.get("vn", g),
                "element": g_inf.get("element", ""),
                "vn_element": g_inf.get("vn_element", ""),
                "shishen": s,
                "vn_shishen": SHISHEN_VN.get(s, s),
            })
        return {
            "ganzhi": f"{stem}{branch}",
            "vn_ganzhi": f"{stem_inf.get('vn', stem)} {branch_inf.get('vn', branch)}",
            "stem": stem,
            "stem_vn": stem_inf.get("vn", stem),
            "stem_element": stem_inf.get("element", ""),
            "stem_yinyang": stem_inf.get("yinyang", ""),
            "stem_shishen": shishen_gan,
            "stem_vn_shishen": SHISHEN_VN.get(shishen_gan, shishen_gan),
            "branch": branch,
            "branch_vn": branch_inf.get("vn", branch),
            "branch_element": branch_inf.get("element", ""),
            "branch_yinyang": branch_inf.get("yinyang", ""),
            "hidden_stems": hide_gans,
            "hidden_details": hidden_details,
        }

    pillar_year = pack_pillar(
        year_stem, year_branch,
        ec.getYearShiShenGan(),
        ec.getYearHideGan(),
        ec.getYearShiShenZhi(),
    )
    pillar_month = pack_pillar(
        month_stem, month_branch,
        ec.getMonthShiShenGan(),
        ec.getMonthHideGan(),
        ec.getMonthShiShenZhi(),
    )
    pillar_day = pack_pillar(
        day_stem, day_branch,
        "日主",
        ec.getDayHideGan(),
        ec.getDayShiShenZhi(),
    )
    pillar_hour = pack_pillar(
        hour_stem, hour_branch,
        ec.getTimeShiShenGan(),
        ec.getTimeHideGan(),
        ec.getTimeShiShenZhi(),
    )

    # Đếm số lượng ngũ hành trên 4 can + 4 chi
    all_stems = [year_stem, month_stem, day_stem, hour_stem]
    all_branches = [year_branch, month_branch, day_branch, hour_branch]
    wuxing_counts = {"木": 0, "火": 0, "土": 0, "金": 0, "水": 0}
    for s in all_stems:
        elem = STEM_INFO.get(s, {}).get("element")
        if elem in wuxing_counts:
            wuxing_counts[elem] += 1
    for b in all_branches:
        elem = BRANCH_INFO.get(b, {}).get("element")
        if elem in wuxing_counts:
            wuxing_counts[elem] += 1

    # Phân tích sơ khởi Nhật chủ
    day_master_info = STEM_INFO.get(day_stem, {})
    month_branch_info = BRANCH_INFO.get(month_branch, {})
    is_dangling = day_master_info.get("element") == month_branch_info.get("element")

    # Tính Đại Vận
    yun = ec.getYun(gender_code, sect)
    is_forward = yun.isForward()
    start_age_years = yun.getStartYear()
    start_age_months = yun.getStartMonth()
    start_solar = yun.getStartSolar()

    dayun_list = []
    for dy in yun.getDaYun():
        if dy.getIndex() == 0:
            continue  # Bỏ qua giai đoạn trước khởi vận
        dy_ganzhi = dy.getGanZhi()
        if not dy_ganzhi or len(dy_ganzhi) < 2:
            continue
        d_stem = dy_ganzhi[0]
        d_branch = dy_ganzhi[1]
        d_stem_inf = STEM_INFO.get(d_stem, {})
        d_branch_inf = BRANCH_INFO.get(d_branch, {})
        start_age = dy.getStartAge()
        start_year = dy.getStartYear()
        end_year = start_year + 9
        dayun_list.append({
            "index": dy.getIndex(),
            "start_age": start_age,
            "end_age": start_age + 9,
            "start_year": start_year,
            "end_year": end_year,
            "ganzhi": dy_ganzhi,
            "vn_ganzhi": f"{d_stem_inf.get('vn', d_stem)} {d_branch_inf.get('vn', d_branch)}",
            "stem": d_stem,
            "stem_element": d_stem_inf.get("element", ""),
            "branch": d_branch,
            "branch_element": d_branch_inf.get("element", ""),
        })

    # Tương tác Địa chi
    interactions = detect_branch_interactions(all_branches)

    return {
        "normalized_input": {
            "calendar_type": calendar_type,
            "original_birth_time": birth_time_str,
            "solar_datetime": solar.toYmdHms(),
            "gender": gender_raw,
            "gender_text": gender_text,
            "late_zi_rule": late_zi_rule,
            "is_leap_month": is_leap_month,
        },
        "calendar": {
            "solar": {
                "year": solar.getYear(),
                "month": solar.getMonth(),
                "day": solar.getDay(),
                "hour": solar.getHour(),
                "minute": solar.getMinute(),
                "ymd_hms": solar.toYmdHms(),
            },
            "lunar": {
                "year": lunar.getYear(),
                "month": lunar.getMonth(),
                "day": lunar.getDay(),
                "month_text": lunar.getMonthInChinese(),
                "day_text": lunar.getDayInChinese(),
                "is_leap_month": lunar.getMonth() < 0,
            },
            "jieqi": {
                "prev_jie": prev_jie.getName() if prev_jie else None,
                "prev_jie_time": prev_jie.getSolar().toYmdHms() if prev_jie else None,
                "next_jie": next_jie.getName() if next_jie else None,
                "next_jie_time": next_jie.getSolar().toYmdHms() if next_jie else None,
            },
        },
        "four_pillars": {
            "year": pillar_year,
            "month": pillar_month,
            "day": pillar_day,
            "hour": pillar_hour,
        },
        "day_master": {
            "stem": day_stem,
            "vn": day_master_info.get("vn", day_stem),
            "element": day_master_info.get("element", ""),
            "vn_element": day_master_info.get("vn_element", ""),
            "yinyang": day_master_info.get("yinyang", ""),
            "born_in_month": month_branch,
            "born_in_month_vn": month_branch_info.get("vn", month_branch),
            "is_dangling": is_dangling,
        },
        "wuxing_counts": {
            "counts": wuxing_counts,
            "vn_summary": f"Mộc: {wuxing_counts['木']}, Hỏa: {wuxing_counts['火']}, Thổ: {wuxing_counts['土']}, Kim: {wuxing_counts['金']}, Thủy: {wuxing_counts['水']}",
        },
        "dayun": {
            "is_forward": is_forward,
            "direction_text": "顺排 (Thuận hành)" if is_forward else "逆排 (Nghịch hành)",
            "start_age_years": start_age_years,
            "start_age_months": start_age_months,
            "start_solar_date": start_solar.toYmd() if start_solar else None,
            "start_age_display": f"{start_age_years} tuổi {start_age_months} tháng",
            "pillars": dayun_list,
        },
        "interactions": interactions,
        "ruleset": {
            "year_rule": "Lập Xuân đổi năm (Lichun transition)",
            "month_rule": "Tiết khí đổi tháng (24 Jieqi transition)",
            "late_zi_rule": "Dạ Tý same_day (23:00 - 00:00 thuộc ngày hôm đó)" if late_zi_rule == "same_day" else "Dạ Tý next_day (23:00 - 00:00 sang ngày hôm sau)",
            "dayun_rule": "Dương nam / Âm nữ thuận hành; Âm nam / Dương nữ nghịch hành. Khởi vận tính từ ngày sinh đến tiết khí kế/trước.",
        },
        "warnings": warnings,
    }
