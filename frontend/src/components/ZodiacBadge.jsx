import React from 'react';

/**
 * 12 Con Giáp SVG Vector Badges phong cách Đông Phương Cổ Điển.
 * Được lồng trong huy hiệu tròn đồng tiền phong thủy với họa tiết hồi văn và màu sắc theo Ngũ Hành.
 */

// SVG icons cách điệu nghệ thuật cho 12 con giáp
const ZODIAC_ICONS = {
  // 1. Tý (Chuột / Rat) - Thủy
  '子': (
    <svg viewBox="0 0 48 48" fill="none" className="w-full h-full" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 28c-4-2-6-8-3-12 2.5-3.5 7-4 10-1" fill="currentColor" fillOpacity="0.15" />
      <path d="M19 15c2-4 7-6 11-4 4 2 5.5 6.5 4 10.5" />
      <path d="M34 21.5c4 2 6 6.5 5 11-1.5 5-6.5 8.5-12 8.5H19c-6.5 0-11-5-10.5-11.5.3-4.5 3.5-8 7.5-9.5" />
      <circle cx="28" cy="18" r="1.5" fill="currentColor" />
      <path d="M38 27c4 1 7-1 8-4" />
      <path d="M14 12c-2-3-1-7 2-8 3-1 6 1 6 4" />
      <path d="M26 12c1-3 4-5 7-4 3 1 4 4 2 7" />
      <path d="M16 35c-4 2-8 7-7 11" strokeWidth="1.8" />
    </svg>
  ),

  // 2. Sửu (Trâu / Ox) - Thổ
  '丑': (
    <svg viewBox="0 0 48 48" fill="none" className="w-full h-full" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      {/* Sừng trâu uốn cong hùng dũng */}
      <path d="M8 12c3 6 8 8 16 8s13-2 16-8c1-2-1-4-3-3-5 3-9 4-13 4s-8-1-13-4c-2-1-4 1-3 3z" fill="currentColor" fillOpacity="0.2" />
      <path d="M15 19c-3 4-4 9-2 14 2 5 7 8 11 8s9-3 11-8c2-5 1-10-2-14" />
      <ellipse cx="24" cy="31" rx="8" ry="5" fill="currentColor" fillOpacity="0.15" />
      <circle cx="20" cy="31" r="1.2" fill="currentColor" />
      <circle cx="28" cy="31" r="1.2" fill="currentColor" />
      <circle cx="18" cy="23" r="1.5" fill="currentColor" />
      <circle cx="30" cy="23" r="1.5" fill="currentColor" />
      {/* Tai trâu */}
      <path d="M12 21c-4-1-7 2-6 5 2 2 5 1 6-1" />
      <path d="M36 21c4-1 7 2 6 5-2 2-5 1-6-1" />
    </svg>
  ),

  // 3. Dần (Hổ / Tiger) - Mộc
  '寅': (
    <svg viewBox="0 0 48 48" fill="none" className="w-full h-full" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      {/* Đầu hổ oai dũng */}
      <path d="M14 14c-4-4-9-1-8 4 1 5 5 7 8 7" />
      <path d="M34 14c4-4 9-1 8 4-1 5-5 7-8 7" />
      <path d="M14 18c-3 5-3 12 1 17 3 4 8 6 9 6s6-2 9-6c4-5 4-12 1-17" fill="currentColor" fillOpacity="0.12" />
      {/* Vằn trán chữ Vương (王) */}
      <path d="M20 12h8" strokeWidth="2" />
      <path d="M21 15h6" strokeWidth="2" />
      <path d="M19 18h10" strokeWidth="2" />
      <path d="M24 12v6" strokeWidth="2" />
      {/* Mắt hổ & mũi */}
      <circle cx="18" cy="25" r="1.8" fill="currentColor" />
      <circle cx="30" cy="25" r="1.8" fill="currentColor" />
      <path d="M22 30h4l-2 3z" fill="currentColor" />
      <path d="M24 33v3m-4-1c2 2 6 2 8 0" />
      {/* Râu hổ */}
      <path d="M15 31l-6-1m6 3l-7 2m24-4l6-1m-6 3l7 2" strokeWidth="1.6" />
    </svg>
  ),

  // 4. Mão (Mèo / Cat) - Mộc
  '卯': (
    <svg viewBox="0 0 48 48" fill="none" className="w-full h-full" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      {/* Tai mèo nhọn tinh nhanh */}
      <path d="M12 19L15 8c2 2 6 6 7 8" fill="currentColor" fillOpacity="0.18" />
      <path d="M36 19L33 8c-2 2-6 6-7 8" fill="currentColor" fillOpacity="0.18" />
      {/* Khuôn mặt mèo */}
      <path d="M14 20c-4 5-4 13 1 18 3 3 8 4 9 4s6-1 9-4c5-5 5-13 1-18" />
      {/* Mắt mèo */}
      <ellipse cx="19" cy="25" rx="2" ry="3" fill="currentColor" />
      <ellipse cx="29" cy="25" rx="2" ry="3" fill="currentColor" />
      {/* Mũi & miệng */}
      <path d="M23 30l1 1 1-1" />
      <path d="M24 31v2m-3-1c1.5 1.5 4.5 1.5 6 0" />
      {/* Râu mèo */}
      <path d="M16 29l-8-1m8 3l-7 3m20-5l8-1m-8 3l7 3" strokeWidth="1.6" />
    </svg>
  ),

  // 5. Thìn (Rồng / Dragon) - Thổ
  '辰': (
    <svg viewBox="0 0 48 48" fill="none" className="w-full h-full" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      {/* Sừng rồng & bờm uốn lượn */}
      <path d="M18 13c-2-5-6-7-10-5 2 4 5 6 9 6" />
      <path d="M30 13c2-5 6-7 10-5-2 4-5 6-9 6" />
      {/* Đầu rồng oai nghiêm */}
      <path d="M14 22c-2-4 0-8 4-10 4-1 8 0 12 0s8-1 12 0c4 2 6 6 4 10-2 3-5 5-9 6H23c-4-1-7-3-9-6z" fill="currentColor" fillOpacity="0.18" />
      <circle cx="19" cy="20" r="1.8" fill="currentColor" />
      <circle cx="29" cy="20" r="1.8" fill="currentColor" />
      {/* Râu rồng cuộn mây */}
      <path d="M16 26c-4 2-8 6-8 11 3-1 6-4 8-8" strokeWidth="1.8" />
      <path d="M32 26c4 2 8 6 8 11-3-1-6-4-8-8" strokeWidth="1.8" />
      {/* Miệng rồng ngậm ngọc */}
      <path d="M20 28c1 3 3 5 4 5s3-2 4-5" />
      <circle cx="24" cy="38" r="3.5" fill="currentColor" fillOpacity="0.3" strokeWidth="1.8" />
    </svg>
  ),

  // 6. Tỵ (Rắn / Snake) - Hỏa
  '巳': (
    <svg viewBox="0 0 48 48" fill="none" className="w-full h-full" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      {/* Thân rắn uốn lượn phong thủy */}
      <path d="M24 8c-5 0-8 3-8 7 0 5 7 7 11 9 4 2 6 5 6 9s-4 8-9 8-9-3-9-8" />
      {/* Đầu rắn */}
      <path d="M24 8c4 0 7 2 7 5s-3 5-7 5-7-2-7-5 3-5 7-5z" fill="currentColor" fillOpacity="0.18" />
      <circle cx="26" cy="11" r="1.2" fill="currentColor" />
      {/* Lưỡi rắn uốn cong */}
      <path d="M31 13h4l2-2m-2 2l2 2" strokeWidth="1.6" />
      {/* Đuôi nhọn */}
      <path d="M15 33c0 3 3 5 7 5 5 0 8-3 8-7" />
    </svg>
  ),

  // 7. Ngọ (Ngựa / Horse) - Hỏa
  '午': (
    <svg viewBox="0 0 48 48" fill="none" className="w-full h-full" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      {/* Đầu ngựa chiến & bờm bay */}
      <path d="M15 36c-1-6 2-12 5-17l4-9c1-2 3-2 4 0l2 6" />
      <path d="M24 10l8 5c3 2 4 5 3 9l-4 4c-3 3-8 4-12 3" fill="currentColor" fillOpacity="0.18" />
      <path d="M27 9l3-4c1-1 2 0 2 2l-1 5" />
      {/* Bờm ngựa tung bay */}
      <path d="M28 14c3-1 6 0 7 2m-6 3c4-1 7 1 8 4m-8 3c4 0 7 3 7 6" strokeWidth="1.8" />
      <circle cx="25" cy="19" r="1.5" fill="currentColor" />
      <circle cx="33" cy="25" r="1" fill="currentColor" />
    </svg>
  ),

  // 8. Mùi (Dê / Goat) - Thổ
  '未': (
    <svg viewBox="0 0 48 48" fill="none" className="w-full h-full" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      {/* Đôi sừng dê cong duyên dáng */}
      <path d="M19 14c-4-4-9-5-12-2-3 3-1 8 3 11 3 2 7 2 9 0" fill="currentColor" fillOpacity="0.15" />
      <path d="M29 14c4-4 9-5 12-2 3 3 1 8-3 11-3 2-7 2-9 0" fill="currentColor" fillOpacity="0.15" />
      {/* Mặt dê thanh nhã */}
      <path d="M17 19c-2 4-1 10 2 14 3 4 5 7 5 7s2-3 5-7c3-4 4-10 2-14" />
      <circle cx="20" cy="24" r="1.4" fill="currentColor" />
      <circle cx="28" cy="24" r="1.4" fill="currentColor" />
      {/* Chòm râu dê */}
      <path d="M24 37v5l-2-2m2 2l2-2" strokeWidth="1.8" />
    </svg>
  ),

  // 9. Thân (Khỉ / Monkey) - Kim
  '申': (
    <svg viewBox="0 0 48 48" fill="none" className="w-full h-full" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      {/* Đôi tai tròn lanh lợi */}
      <circle cx="10" cy="22" r="5" fill="currentColor" fillOpacity="0.2" />
      <circle cx="38" cy="22" r="5" fill="currentColor" fillOpacity="0.2" />
      {/* Khuôn mặt khỉ */}
      <path d="M14 22c0-7 4-12 10-12s10 5 10 12c0 6-4 11-10 11s-10-5-10-11z" />
      {/* Vòm mắt hình trái tim */}
      <path d="M16 21c2-3 5-4 8-1 3-3 6-2 8 1 0 4-3 7-8 7s-8-3-8-7z" fill="currentColor" fillOpacity="0.15" />
      <circle cx="20" cy="22" r="1.5" fill="currentColor" />
      <circle cx="28" cy="22" r="1.5" fill="currentColor" />
      {/* Mũi & miệng cười */}
      <circle cx="24" cy="29" r="1" fill="currentColor" />
      <path d="M20 31c2 2 6 2 8 0" strokeWidth="1.8" />
    </svg>
  ),

  // 10. Dậu (Gà / Rooster) - Kim
  '酉': (
    <svg viewBox="0 0 48 48" fill="none" className="w-full h-full" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      {/* Mào gà rực rỡ */}
      <path d="M19 14c-1-5 2-8 5-8 2 2 2 5 0 7 3-2 6-1 6 2 0 2-2 3-4 4" fill="currentColor" fillOpacity="0.25" />
      {/* Đầu & ức gà trống */}
      <path d="M17 22c-1 6 1 12 5 16 3 3 7 4 10 2 3-2 4-6 3-11l-3-6c-3-2-8-3-12-1" />
      {/* Mỏ gà */}
      <path d="M17 21l-6 3 6 2" fill="currentColor" fillOpacity="0.3" />
      {/* Tích gà (yếm đỏ) */}
      <path d="M17 26c-1 3 1 6 3 6s3-2 2-6" fill="currentColor" fillOpacity="0.3" />
      <circle cx="22" cy="20" r="1.5" fill="currentColor" />
    </svg>
  ),

  // 11. Tuất (Chó / Dog) - Thổ
  '戌': (
    <svg viewBox="0 0 48 48" fill="none" className="w-full h-full" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      {/* Đôi tai cụp hiền lành, trung thành */}
      <path d="M14 17c-4 3-7 8-5 12 1 2 4 2 6-1l1-8" fill="currentColor" fillOpacity="0.2" />
      <path d="M34 17c4 3 7 8 5 12-1 2-4 2-6-1l-1-8" fill="currentColor" fillOpacity="0.2" />
      {/* Khuôn mặt chó */}
      <path d="M16 18c2-4 5-6 8-6s6 2 8 6c2 4 2 10-1 15-2 3-5 5-7 5s-5-2-7-5c-3-5-3-11-1-15z" />
      <circle cx="20" cy="22" r="1.6" fill="currentColor" />
      <circle cx="28" cy="22" r="1.6" fill="currentColor" />
      {/* Mũi & miệng */}
      <ellipse cx="24" cy="28" rx="2.5" ry="1.8" fill="currentColor" />
      <path d="M24 30v2m-3-1c1.5 1.5 4.5 1.5 6 0" />
    </svg>
  ),

  // 12. Hợi (Lợn / Pig) - Thủy
  '亥': (
    <svg viewBox="0 0 48 48" fill="none" className="w-full h-full" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      {/* Đôi tai tròn */}
      <path d="M13 18c-3-2-6-1-7 2-1 3 1 6 4 6" fill="currentColor" fillOpacity="0.2" />
      <path d="M35 18c3-2 6-1 7 2 1 3-1 6-4 6" fill="currentColor" fillOpacity="0.2" />
      {/* Khuôn mặt lợn phúc hậu */}
      <ellipse cx="24" cy="24" rx="13" ry="11" />
      <circle cx="18" cy="21" r="1.6" fill="currentColor" />
      <circle cx="30" cy="21" r="1.6" fill="currentColor" />
      {/* Mũi lợn tròn đặc trưng */}
      <ellipse cx="24" cy="27" rx="5" ry="3.5" fill="currentColor" fillOpacity="0.25" strokeWidth="1.8" />
      <circle cx="22" cy="27" r="1" fill="currentColor" />
      <circle cx="26" cy="27" r="1" fill="currentColor" />
    </svg>
  ),
};

const ZODIAC_METAS = {
  '子': { vn: 'Tý', animal: 'Chuột', element: 'Thủy', elementVn: 'Thủy', colorClass: 'text-sky-400 border-sky-500/40 bg-sky-950/40 shadow-sky-500/10' },
  '丑': { vn: 'Sửu', animal: 'Trâu', element: 'Thổ', elementVn: 'Thổ', colorClass: 'text-amber-400 border-amber-500/40 bg-amber-950/40 shadow-amber-500/10' },
  '寅': { vn: 'Dần', animal: 'Hổ', element: 'Mộc', elementVn: 'Mộc', colorClass: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40 shadow-emerald-500/10' },
  '卯': { vn: 'Mão', animal: 'Mèo', element: 'Mộc', elementVn: 'Mộc', colorClass: 'text-emerald-300 border-emerald-500/40 bg-emerald-950/40 shadow-emerald-500/10' },
  '辰': { vn: 'Thìn', animal: 'Rồng', element: 'Thổ', elementVn: 'Thổ', colorClass: 'text-amber-400 border-amber-500/40 bg-amber-950/40 shadow-amber-500/10' },
  '巳': { vn: 'Tỵ', animal: 'Rắn', element: 'Hỏa', elementVn: 'Hỏa', colorClass: 'text-rose-400 border-rose-500/40 bg-rose-950/40 shadow-rose-500/10' },
  '午': { vn: 'Ngọ', animal: 'Ngựa', element: 'Hỏa', elementVn: 'Hỏa', colorClass: 'text-rose-500 border-rose-500/40 bg-rose-950/40 shadow-rose-500/10' },
  '未': { vn: 'Mùi', animal: 'Dê', element: 'Thổ', elementVn: 'Thổ', colorClass: 'text-amber-300 border-amber-500/40 bg-amber-950/40 shadow-amber-500/10' },
  '申': { vn: 'Thân', animal: 'Khỉ', element: 'Kim', elementVn: 'Kim', colorClass: 'text-slate-100 border-slate-400/40 bg-slate-800/60 shadow-slate-400/10' },
  '酉': { vn: 'Dậu', animal: 'Gà', element: 'Kim', elementVn: 'Kim', colorClass: 'text-slate-200 border-slate-400/40 bg-slate-800/60 shadow-slate-400/10' },
  '戌': { vn: 'Tuất', animal: 'Chó', element: 'Thổ', elementVn: 'Thổ', colorClass: 'text-amber-400 border-amber-500/40 bg-amber-950/40 shadow-amber-500/10' },
  '亥': { vn: 'Hợi', animal: 'Lợn', element: 'Thủy', elementVn: 'Thủy', colorClass: 'text-sky-300 border-sky-500/40 bg-sky-950/40 shadow-sky-500/10' },
};

export default function ZodiacBadge({ branch, size = 'md', showLabel = false, showHanzi = true }) {
  const meta = ZODIAC_METAS[branch] || {
    vn: branch,
    animal: 'Linh vật',
    element: 'Ngũ hành',
    colorClass: 'text-amber-400 border-amber-500/40 bg-amber-950/30',
  };

  const iconSvg = ZODIAC_ICONS[branch];

  // Kích thước huy hiệu
  const sizeMap = {
    sm: { box: 'w-7 h-7 p-1', text: 'text-[9px]', icon: 'w-5 h-5' },
    md: { box: 'w-11 h-11 p-1.5', text: 'text-[11px]', icon: 'w-8 h-8' },
    lg: { box: 'w-16 h-16 p-2', text: 'text-xs', icon: 'w-12 h-12' },
  };

  const s = sizeMap[size] || sizeMap.md;

  return (
    <div className="inline-flex flex-col items-center justify-center">
      {/* Huy hiệu tròn phong thủy Á Đông */}
      <div
        className={`relative ${s.box} rounded-full border shadow-md flex items-center justify-center transition-transform hover:scale-105 ${meta.colorClass}`}
        title={`${meta.vn} (${meta.animal}) • Hành ${meta.element}`}
      >
        {/* Viền hoa văn đồng tiền cổ bên trong */}
        <div className="absolute inset-0.5 rounded-full border border-dashed border-current opacity-30 pointer-events-none" />

        {/* Biểu tượng linh vật 12 con giáp */}
        <div className="relative z-10 w-full h-full flex items-center justify-center">
          {iconSvg || <span className="font-bold text-sm">{branch}</span>}
        </div>

        {/* Dấu ấn Triện Hán nhỏ ở góc dưới */}
        {showHanzi && (
          <span className="absolute -bottom-1 -right-1 text-[8px] font-serif font-bold px-1 py-0.2 rounded-full bg-slate-950/90 text-amber-300 border border-amber-500/50 leading-tight">
            {branch}
          </span>
        )}
      </div>

      {showLabel && (
        <div className="mt-1 text-center">
          <span className={`block font-bold leading-tight ${meta.colorClass.split(' ')[0]}`}>
            {meta.vn} ({meta.animal})
          </span>
          <span className="text-[9px] text-slate-400">
            Hành {meta.element}
          </span>
        </div>
      )}
    </div>
  );
}

export { ZODIAC_METAS };
