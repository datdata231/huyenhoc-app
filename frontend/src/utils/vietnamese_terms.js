/**
 * Vietnamese translation & styling dictionaries for Chinese Numerology terms.
 */

export const STEM_MAP = {
  '甲': { vn: 'Giáp', element: 'Mộc', yinyang: 'Dương', color: 'text-emerald-400' },
  '乙': { vn: 'Ất', element: 'Mộc', yinyang: 'Âm', color: 'text-emerald-300' },
  '丙': { vn: 'Bính', element: 'Hỏa', yinyang: 'Dương', color: 'text-rose-400' },
  '丁': { vn: 'Đinh', element: 'Hỏa', yinyang: 'Âm', color: 'text-rose-300' },
  '戊': { vn: 'Mậu', element: 'Thổ', yinyang: 'Dương', color: 'text-amber-400' },
  '己': { vn: 'Kỷ', element: 'Thổ', yinyang: 'Âm', color: 'text-amber-300' },
  '庚': { vn: 'Canh', element: 'Kim', yinyang: 'Dương', color: 'text-slate-200' },
  '辛': { vn: 'Tân', element: 'Kim', yinyang: 'Âm', color: 'text-slate-300' },
  '壬': { vn: 'Nhâm', element: 'Thủy', yinyang: 'Dương', color: 'text-sky-400' },
  '癸': { vn: 'Quý', element: 'Thủy', yinyang: 'Âm', color: 'text-sky-300' },
};

export const BRANCH_MAP = {
  '子': { vn: 'Tý', animal: 'Chuột', element: 'Thủy', color: 'text-sky-400' },
  '丑': { vn: 'Sửu', animal: 'Trâu', element: 'Thổ', color: 'text-amber-400' },
  '寅': { vn: 'Dần', animal: 'Hổ', element: 'Mộc', color: 'text-emerald-400' },
  '卯': { vn: 'Mão', animal: 'Mèo', element: 'Mộc', color: 'text-emerald-300' },
  '辰': { vn: 'Thìn', animal: 'Rồng', element: 'Thổ', color: 'text-amber-400' },
  '巳': { vn: 'Tỵ', animal: 'Rắn', element: 'Hỏa', color: 'text-rose-400' },
  '午': { vn: 'Ngọ', animal: 'Ngựa', element: 'Hỏa', color: 'text-rose-500' },
  '未': { vn: 'Mùi', animal: 'Dê', element: 'Thổ', color: 'text-amber-300' },
  '申': { vn: 'Thân', animal: 'Khỉ', element: 'Kim', color: 'text-slate-200' },
  '酉': { vn: 'Dậu', animal: 'Gà', element: 'Kim', color: 'text-slate-300' },
  '戌': { vn: 'Tuất', animal: 'Chó', element: 'Thổ', color: 'text-amber-400' },
  '亥': { vn: 'Hợi', animal: 'Lợn', element: 'Thủy', color: 'text-sky-300' },
};

export const SHISHEN_MAP = {
  '比肩': { vn: 'Tỷ Kiên', short: 'Tỷ', color: 'bg-emerald-950 text-emerald-300 border-emerald-700' },
  '劫财': { vn: 'Kiếp Tài', short: 'Kiếp', color: 'bg-emerald-900 text-emerald-200 border-emerald-600' },
  '食神': { vn: 'Thực Thần', short: 'Thực', color: 'bg-blue-950 text-blue-300 border-blue-700' },
  '伤官': { vn: 'Thương Quan', short: 'Thương', color: 'bg-indigo-950 text-indigo-300 border-indigo-700' },
  '偏财': { vn: 'Thiên Tài', short: 'T.Tài', color: 'bg-amber-950 text-amber-300 border-amber-700' },
  '正财': { vn: 'Chính Tài', short: 'C.Tài', color: 'bg-yellow-950 text-yellow-300 border-yellow-700' },
  '七杀': { vn: 'Thất Sát', short: 'Sát', color: 'bg-rose-950 text-rose-300 border-rose-700' },
  '正官': { vn: 'Chính Quan', short: 'Quan', color: 'bg-red-950 text-red-300 border-red-700' },
  '偏印': { vn: 'Thiên Ấn', short: 'Kiêu', color: 'bg-purple-950 text-purple-300 border-purple-700' },
  '正印': { vn: 'Chính Ấn', short: 'Ấn', color: 'bg-violet-950 text-violet-300 border-violet-700' },
  '日主': { vn: 'Nhật Chủ', short: 'Tôi', color: 'bg-gold-500 text-slate-950 font-bold' },
};

export const MAJOR_STARS_MAP = {
  '紫微': { vn: 'Tử Vi', type: 'Đế Tinh', color: 'text-purple-400 font-semibold' },
  '天机': { vn: 'Thiên Cơ', type: 'Trí Tuệ', color: 'text-cyan-400 font-semibold' },
  '太阳': { vn: 'Thái Dương', type: 'Quang Minh', color: 'text-amber-400 font-semibold' },
  '武曲': { vn: 'Vũ Khúc', type: 'Tài Tinh', color: 'text-yellow-400 font-semibold' },
  '天同': { vn: 'Thiên Đồng', type: 'Phúc Tinh', color: 'text-sky-400 font-semibold' },
  '廉贞': { vn: 'Liêm Trinh', type: 'Đào Hoa Thứ', color: 'text-rose-400 font-semibold' },
  '天府': { vn: 'Thiên Phủ', type: 'Kho Lộc', color: 'text-amber-300 font-semibold' },
  '太阴': { vn: 'Thái Âm', type: 'Điền Sản', color: 'text-blue-300 font-semibold' },
  '贪狼': { vn: 'Tham Lang', type: 'Đào Hoa Chính', color: 'text-emerald-400 font-semibold' },
  '巨门': { vn: 'Cự Môn', type: 'Ám Tinh / Ngôn Ngữ', color: 'text-slate-300 font-semibold' },
  '天相': { vn: 'Thiên Tướng', type: 'Ấn Tinh', color: 'text-teal-300 font-semibold' },
  '天梁': { vn: 'Thiên Lương', type: 'Ấm Tinh / Thọ', color: 'text-emerald-300 font-semibold' },
  '七杀': { vn: 'Thất Sát', type: 'Tướng Tinh', color: 'text-red-400 font-semibold' },
  '破军': { vn: 'Phá Quân', type: 'Hao Tinh / Tiên Phong', color: 'text-orange-400 font-semibold' },
};

export const BRIGHTNESS_MAP = {
  '庙': { vn: 'Miếu (Rất Sáng)', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  '旺': { vn: 'Vượng (Sáng)', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  '得地': { vn: 'Đắc Địa', badge: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
  '利': { vn: 'Lợi (Khá)', badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },
  '平': { vn: 'Bình Hòa', badge: 'bg-slate-500/20 text-slate-300 border-slate-500/40' },
  '不得地': { vn: 'Bất Đắc Địa', badge: 'bg-orange-500/20 text-orange-300 border-orange-500/40' },
  '落陷': { vn: 'Hãm Địa (Tối)', badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
};

export const SIHUA_MAP = {
  '化禄': { vn: 'Hóa Lộc (Phúc Duyên/Tài Lộc)', color: 'bg-emerald-500 text-slate-950 font-bold px-1.5 py-0.5 rounded' },
  '化权': { vn: 'Hóa Quyền (Năng Lực/Quyền Uy)', color: 'bg-amber-500 text-slate-950 font-bold px-1.5 py-0.5 rounded' },
  '化科': { vn: 'Hóa Khoa (Danh Tiếng/Trí Tuệ)', color: 'bg-sky-500 text-slate-950 font-bold px-1.5 py-0.5 rounded' },
  '化忌': { vn: 'Hóa Kỵ (Trở Ngại/Tu Dưỡng)', color: 'bg-rose-500 text-slate-50 font-bold px-1.5 py-0.5 rounded' },
};

export const QIMEN_DOORS_MAP = {
  '休门': { vn: 'Hưu Môn', nature: 'Cát', element: 'Thủy', desc: 'Nghỉ ngơi, hòa giải, tụ họp' },
  '生门': { vn: 'Sinh Môn', nature: 'Đại Cát', element: 'Thổ', desc: 'Kinh doanh, tài lộc, phát triển' },
  '伤门': { vn: 'Thương Môn', nature: 'Hung', element: 'Mộc', desc: 'Tranh chấp, đòi nợ, tổn thương' },
  '杜门': { vn: 'Đỗ Môn', nature: 'Bình', element: 'Mộc', desc: 'Ẩn giấu, phòng thủ, tĩnh lặng' },
  '景门': { vn: 'Cảnh Môn', nature: 'Bình', element: 'Hỏa', desc: 'Văn thư, tiệc tùng, rực rỡ' },
  '死门': { vn: 'Tử Môn', nature: 'Đại Hung', element: 'Thổ', desc: 'Bế tắc, cố chấp, bất động' },
  '惊门': { vn: 'Kinh Môn', nature: 'Hung', element: 'Kim', desc: 'Kinh sợ, pháp luật, tranh cãi' },
  '开门': { vn: 'Khai Môn', nature: 'Đại Cát', element: 'Kim', desc: 'Khai trương, thăng tiến, khởi đầu' },
};

export const QIMEN_STARS_MAP = {
  '天蓬': { vn: 'Thiên Bồng', element: 'Thủy', nature: 'Đại Đạo / Dũng cảm' },
  '天任': { vn: 'Thiên Nhậm', element: 'Thổ', nature: 'Lương thiện / Bền bỉ' },
  '天冲': { vn: 'Thiên Xung', element: 'Mộc', nature: 'Xông xáo / Tiên phong' },
  '天辅': { vn: 'Thiên Phụ', element: 'Mộc', nature: 'Văn khúc / Trợ giúp' },
  '天英': { vn: 'Thiên Anh', element: 'Hỏa', nature: 'Hào hoa / Nóng nảy' },
  '天芮': { vn: 'Thiên Nhuế', element: 'Thổ', nature: 'Bệnh tinh / Học hỏi' },
  '天禽': { vn: 'Thiên Cầm', element: 'Thổ', nature: 'Trung cung / Cát tường' },
  '天柱': { vn: 'Thiên Trụ', element: 'Kim', nature: 'Tranh luận / Phá dỡ' },
  '天心': { vn: 'Thiên Tâm', element: 'Kim', nature: 'Lãnh đạo / Y dược' },
};

export const QIMEN_GODS_MAP = {
  '值符': { vn: 'Trực Phù', nature: 'Vua các thần, đại cát, giải trừ ách nạn' },
  '螣蛇': { vn: 'Đằng Xà', nature: 'Biến động, lo âu, dây dưa khó dứt' },
  '太阴': { vn: 'Thái Âm', nature: 'Âm đức, bí mật, mưu sự kín đáo' },
  '六合': { vn: 'Lục Hợp', nature: 'Hòa hợp, hôn nhân, đàm phán, kết nối' },
  '白虎': { vn: 'Bạch Hổ', nature: 'Sát khí, quyết liệt, võ nghiệp, tai nạn' },
  '玄武': { vn: 'Huyền Vũ', nature: 'Mơ hồ, mưu mẹo, phòng ngừa mất mát' },
  '九地': { vn: 'Cửu Địa', nature: 'Kiên cố, ẩn nhẫn, bảo thủ, phòng thủ' },
  '九天': { vn: 'Cửu Thiên', nature: 'Chí lớn, bay cao, chủ động tiến công' },
};

export const PALACE_NAMES_VN = {
  '命宫': 'Mệnh Cung',
  '兄弟': 'Huynh Đệ',
  '夫妻': 'Phu Thê',
  '子女': 'Tử Tức',
  '财帛': 'Tài Bạch',
  '疾厄': 'Tật Ách',
  '迁移': 'Thiên Di',
  '交友': 'Nô Bộc',
  '官禄': 'Quan Lộc',
  '田宅': 'Điền Trạch',
  '福德': 'Phúc Đức',
  '父母': 'Phụ Mẫu',
};

export const QIMEN_PALACE_VN = {
  '坎宫': 'Khảm (Cung 1 - Bắc)',
  '坤宫': 'Khôn (Cung 2 - Tây Nam)',
  '震宫': 'Chấn (Cung 3 - Đông)',
  '巽宫': 'Tốn (Cung 4 - Đông Nam)',
  '中宫': 'Trung Cung (Cung 5 - Giữa)',
  '乾宫': 'Càn (Cung 6 - Tây Bắc)',
  '兑宫': 'Đoài (Cung 7 - Tây)',
  '艮宫': 'Cấn (Cung 8 - Đông Bắc)',
  '离宫': 'Ly (Cung 9 - Nam)',
};

export const DIRECTION_VN = {
  '北': 'Bắc',
  '东北': 'Đông Bắc',
  '东': 'Đông',
  '东南': 'Đông Nam',
  '南': 'Nam',
  '西南': 'Tây Nam',
  '西': 'Tây',
  '西北': 'Tây Bắc',
  '中': 'Trung tâm',
};

export const PATTERN_VN = {
  '伏吟': 'Phục Ngâm (Thế cờ trì trệ, nên giữ nguyên vị trí, không nên manh động)',
  '反吟': 'Phản Ngâm (Thế cờ đảo lộn, biến động đột ngột, việc đi rồi lại về)',
  '门反吟': 'Môn Phản Ngâm (Cửa xung đối, nội bộ xáo trộn, kế hoạch dễ thay đổi)',
  '星反吟': 'Tinh Phản Ngâm (Sao xung đối, ngoại cảnh biến động, thời cơ đảo chiều)',
  '门迫': 'Môn Bức (Cửa khắc cung, hao tổn sinh lực, hành động gặp lực cản lớn)',
  '门受制': 'Môn Thụ Chế (Cung khắc cửa, cửa bị kìm hãm, năng lực không phát huy được)',
  '三奇配吉门': 'Tam Kỳ Phối Cát Môn (Cát cách: Cơ hội thuận lợi, được quý nhân tương trợ)',
  '值符得位': 'Trực Phù Đắc Vị (Cát cách: Người chỉ huy vững vàng, nắm thế chủ động)',
  '青龙返首': 'Thanh Long Phản Thủ (Đại cát: Mưu sự dễ thành, tiền tài danh vọng đều thông)',
  '飞鸟跌穴': 'Phi Điểu Điệt Huyệt (Đại cát: Chim bay về tổ, không nhọc công mà gặt hái lớn)',
};

export function translateWarning(w) {
  if (!w) return '';
  if (w.includes('时干为甲，按旬首所遁之仪')) {
    const yiMatch = w.match(/之仪\s*(\S+)\s*入盘/);
    const yi = yiMatch ? yiMatch[1] : '';
    const yiVn = STEM_MAP[yi]?.vn || yi;
    return `Can giờ là Giáp (trốn sau Tuần thủ), theo quy tắc độn giáp lấy ẩn can "${yiVn} (${yi})" nhập bàn.`;
  }
  if (w.includes('本规则集中宫相关判断一律寄坤处理')) {
    return 'Quy chuẩn cố định: Trung Cung (Cung 5) ký gửi về Khôn (Cung 2) để xử lý.';
  }
  if (w.includes('值使移宫落中五，按寄坤处理')) {
    return 'Trực Sử di chuyển rơi vào Trung Cung số 5, xử lý ký gửi sang Cung 2 (Khôn).';
  }
  if (w.includes('当前时间距离节令起点较近') || w.includes('属于节气边界附近')) {
    return 'Thời điểm này rất gần ranh giới giao Tiết Khí, độ chính xác của phút khởi sự rất quan trọng.';
  }
  if (w.includes('距时辰交界不足 15 分钟')) {
    return 'Thời gian sinh cách ranh giới chuyển giờ dưới 15 phút, nếu giờ sinh có sai số có thể ảnh hưởng đến lá số.';
  }
  if (w.includes('出生于 23 点后，已按次日子时排盘')) {
    return 'Sinh sau 23:00 (giờ Dạ Tý): Áp dụng quy chuẩn chuyển sang giờ Tý của ngày hôm sau.';
  }
  return w;
}

export function translatePatternName(name) {
  return PATTERN_VN[name] || name;
}

export function translateNature(nature) {
  if (nature === '吉') return 'Cát (Thuận lợi)';
  if (nature === '凶') return 'Hung (Bất lợi)';
  if (nature === '中') return 'Bình hòa';
  return nature;
}

export function translateDun(dun) {
  if (dun === '阴遁') return 'Âm Độn';
  if (dun === '阳遁') return 'Dương Độn';
  return dun || '';
}

export function translateOriginYuan(yuan) {
  if (yuan === '上元') return 'Thượng Nguyên';
  if (yuan === '中元') return 'Trung Nguyên';
  if (yuan === '下元') return 'Hạ Nguyên';
  return yuan || '';
}

export function formatGanzhiVn(ganzhiStr) {
  if (!ganzhiStr) return '';
  const pairs = ganzhiStr.trim().split(/\s+/);
  return pairs
    .map((pair) => {
      if (pair.length >= 2) {
        const s = STEM_MAP[pair[0]]?.vn || pair[0];
        const b = BRANCH_MAP[pair[1]]?.vn || pair[1];
        return `${s} ${b} (${pair})`;
      }
      return pair;
    })
    .join(' • ');
}

export function translateStarVn(star) {
  if (!star) return '';
  const s = QIMEN_STARS_MAP[star];
  return s ? `${s.vn} (${star})` : star;
}

export function translateDoorVn(door) {
  if (!door) return '';
  const d = QIMEN_DOORS_MAP[door];
  return d ? `${d.vn} (${door})` : door;
}

export function translateGodVn(god) {
  if (!god) return '';
  const g = QIMEN_GODS_MAP[god];
  return g ? `${g.vn} (${god})` : god;
}

export function translateDirectionVn(dir) {
  return DIRECTION_VN[dir] || dir || '';
}
