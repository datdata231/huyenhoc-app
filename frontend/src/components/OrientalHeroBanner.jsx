import React from 'react';
import { Bell, Sparkles, Compass, Flame, BookOpen, Crown, ChevronRight } from 'lucide-react';

export default function OrientalHeroBanner({
  activeProfile,
  theme,
  currentTheme,
  onOpenNotifications,
  onOpenProfiles,
  activeTab,
  onSwitchTab,
}) {
  const profileName = activeProfile?.name || 'Đạo Hữu';
  const isWood = currentTheme === 'Mộc' || !currentTheme;

  return (
    <div className="relative mb-5 overflow-hidden rounded-3xl border border-amber-900/25 shadow-xl bg-gradient-to-b from-[#FFFDF8] via-[#FAF5EC] to-[#F3EBE0]">
      {/* Background Cloud Waves Pattern */}
      <div className="absolute inset-0 bg-cloud-pattern opacity-40 pointer-events-none" />

      {/* Top Status Bar (Inspired by 5ptiengtrung.vn) */}
      <div className="relative z-10 px-3.5 sm:px-5 pt-3.5 pb-2.5 flex items-center justify-between border-b border-amber-900/10 bg-[#FFFDF9]/80 backdrop-blur-xs">
        {/* User Identity & Bamboo Hat Avatar */}
        <button
          onClick={onOpenProfiles}
          className="flex items-center gap-2 group text-left transition"
        >
          <div className="relative w-9 h-9 rounded-full bg-gradient-to-br from-amber-600 via-amber-700 to-amber-900 p-0.5 shadow-md flex items-center justify-center">
            {/* Bamboo Hat SVG Avatar */}
            <div className="w-full h-full rounded-full bg-[#FAF7F0] flex items-center justify-center text-amber-950 font-bold text-xs font-serif overflow-hidden">
              <span className="text-sm">🎋</span>
            </div>
            <div className="absolute -bottom-1 -right-1 bg-red-600 text-white text-[8px] font-bold px-1 rounded-full border border-white">
              MỆNH
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-amber-950 group-hover:text-amber-700 transition">
                {profileName}
              </span>
              <span className="seal-stamp text-[8px] py-0 px-1 bg-amber-500/10 text-amber-800 border-amber-700/60">
                GIÁP MỘC
              </span>
            </div>
            <span className="text-[10px] text-stone-500">Nhật Chủ Tứ Trụ • Cát Tường</span>
          </div>
        </button>

        {/* Charms & 8:00 AM Notification Button */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Daily streak flame */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100/70 border border-amber-300 text-amber-900 text-[10px] font-bold">
            <span className="text-xs">🔥</span>
            <span>Cát Khí</span>
          </div>

          {/* Bell Notification shortcut */}
          <button
            onClick={onOpenNotifications}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white text-[10px] font-bold shadow-xs transition"
            title="Cài đặt thông báo 8h sáng"
          >
            <Bell className="w-3 h-3 animate-pulse-subtle" />
            <span className="hidden sm:inline">Chuông</span>
            <span>8:00</span>
          </button>
        </div>
      </div>

      {/* Magnificent Oriental Temple Roof / Sơn Môn Pavilion Illustration */}
      <div className="relative px-4 pt-3 pb-4 sm:px-6">
        {/* Oriental Temple Archway SVG (Ngói Lưu Ly Cổ Kính & Cột Sơn Son) */}
        <div className="relative mx-auto max-w-sm sm:max-w-md my-1 text-center">
          <svg
            className="w-full h-24 sm:h-28 mx-auto drop-shadow-md"
            viewBox="0 0 400 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Jade Glazed Roof Gradient */}
              <linearGradient id="roofJade" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#2E6F56" />
                <stop offset="50%" stopColor="#1B4D3E" />
                <stop offset="100%" stopColor="#0F3327" />
              </linearGradient>
              {/* Gold Eaves Trim */}
              <linearGradient id="goldTrim" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#F59E0B" />
                <stop offset="50%" stopColor="#FDE68A" />
                <stop offset="100%" stopColor="#D97706" />
              </linearGradient>
              {/* Pillars Vermilion Red */}
              <linearGradient id="pillarRed" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#991B1B" />
                <stop offset="50%" stopColor="#DC2626" />
                <stop offset="100%" stopColor="#7F1D1D" />
              </linearGradient>
            </defs>

            {/* Distant Misty Mountains & Floating Cloud Swirls */}
            <path
              d="M20,70 Q70,45 130,65 T260,60 T380,72 L400,110 L0,110 Z"
              fill="#D6CFBF"
              opacity="0.35"
            />
            <path
              d="M60,65 Q110,35 180,50 T310,48 T390,65 L400,110 L0,110 Z"
              fill="#C2B8A3"
              opacity="0.4"
            />

            {/* Auspicious Clouds */}
            <path
              d="M40,82 C30,82 25,75 32,68 C34,60 46,60 52,66 C57,63 68,66 67,73 C72,75 72,82 64,82 Z"
              fill="#FFFFFF"
              opacity="0.8"
            />
            <path
              d="M340,85 C330,85 325,78 332,71 C334,63 346,63 352,69 C357,66 368,69 367,76 C372,78 372,85 364,85 Z"
              fill="#FFFFFF"
              opacity="0.8"
            />

            {/* Main Temple Curved Roof with Flying Dragon Eaves */}
            {/* Top Ridge with Golden Pearl */}
            <path
              d="M150,22 Q200,14 250,22 Q200,18 150,22 Z"
              fill="url(#goldTrim)"
            />
            <circle cx="200" cy="16" r="5" fill="#F59E0B" stroke="#78350F" strokeWidth="1" />
            <circle cx="200" cy="16" r="2.5" fill="#FEF08A" />

            {/* Upper Tier Roof with sweeping wings */}
            <path
              d="M80,48 C120,44 165,30 200,24 C235,30 280,44 320,48 C332,49 335,42 328,36 C285,32 240,20 200,18 C160,20 115,32 72,36 C65,42 68,49 80,48 Z"
              fill="url(#roofJade)"
              stroke="url(#goldTrim)"
              strokeWidth="1.5"
            />

            {/* Middle Plaque: HUYỀN HỌC BẢO ĐIỆN */}
            <rect x="155" y="44" width="90" height="24" rx="3" fill="#78350F" stroke="#F59E0B" strokeWidth="1.5" />
            <text x="200" y="60" textAnchor="middle" fill="#FEF3C7" fontSize="10" fontWeight="bold" fontFamily="serif" letterSpacing="2">
              玄學寶殿
            </text>

            {/* Lower Tier Roof with wider flying eaves */}
            <path
              d="M40,75 C95,70 155,54 200,48 C245,54 305,70 360,75 C378,76 382,66 372,58 C318,52 260,38 200,36 C140,38 82,52 28,58 C18,66 22,76 40,75 Z"
              fill="url(#roofJade)"
              stroke="url(#goldTrim)"
              strokeWidth="1.8"
            />

            {/* Vermilion Red Wooden Columns */}
            <rect x="130" y="72" width="12" height="42" fill="url(#pillarRed)" rx="1.5" />
            <rect x="258" y="72" width="12" height="42" fill="url(#pillarRed)" rx="1.5" />
            <rect x="175" y="72" width="10" height="42" fill="url(#pillarRed)" rx="1.5" />
            <rect x="215" y="72" width="10" height="42" fill="url(#pillarRed)" rx="1.5" />

            {/* Stone Pedestals */}
            <rect x="127" y="112" width="18" height="6" fill="#A8A29E" rx="1" />
            <rect x="255" y="112" width="18" height="6" fill="#A8A29E" rx="1" />
            <rect x="172" y="112" width="16" height="6" fill="#A8A29E" rx="1" />
            <rect x="212" y="112" width="16" height="6" fill="#A8A29E" rx="1" />

            {/* Peach Blossom Branch on the Left */}
            <path d="M45,85 Q65,65 85,75" stroke="#78350F" strokeWidth="2.5" fill="none" />
            <circle cx="50" cy="80" r="4" fill="#FB7185" />
            <circle cx="70" cy="68" r="3.5" fill="#F43F5E" />
            <circle cx="85" cy="74" r="4.5" fill="#FDA4AF" />
            <circle cx="85" cy="74" r="1.5" fill="#FFE4E6" />
          </svg>
        </div>

        {/* Oriental Speech Bubble / Sư Tỷ Lời Dặn (like in 5ptiengtrung.vn) */}
        <div className="relative mx-auto max-w-md bg-[#FFFDF9] border border-amber-900/20 rounded-2xl p-3 shadow-md text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="seal-stamp text-[9px] py-0 px-1 bg-red-600 text-white border-red-700">
              LỜI THẦY DẶN
            </span>
            <span className="text-xs font-bold text-amber-950 font-serif">
              Giờ Thìn Cát Nhật • Vận Khí Hanh Thông
            </span>
          </div>
          <p className="text-[11px] text-stone-600 leading-relaxed max-w-sm mx-auto">
            Bản mệnh <strong className="text-emerald-800">Giáp Mộc</strong> được <strong className="text-sky-800">Thủy Ấn</strong> sinh dưỡng. Hãy tra cứu Kỳ Môn hoặc Bát Tự để nắm bắt phương vị cát lợi hôm nay!
          </p>
        </div>

        {/* Feature Fast-Tabs Grid (Inspired by the 5ptiengtrung.vn grid) */}
        <div className="grid grid-cols-3 gap-2 mt-3.5 max-w-md mx-auto">
          {/* Tab 1: Qimen */}
          <button
            onClick={() => onSwitchTab('qimen')}
            className={`p-2.5 rounded-2xl border text-center transition flex flex-col items-center justify-center shadow-xs ${
              activeTab === 'qimen'
                ? 'bg-gradient-to-b from-amber-100 to-amber-50 border-amber-600/70 shadow-sm ring-1 ring-amber-500/40'
                : 'bg-[#FFFDF9]/90 border-amber-900/15 hover:bg-amber-50/50'
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-amber-700/10 text-amber-900 flex items-center justify-center mb-1 text-base">
              🧭
            </div>
            <span className="text-xs font-bold text-amber-950">Kỳ Môn</span>
            <span className="text-[9px] text-stone-500">Bàn cờ giờ thực</span>
          </button>

          {/* Tab 2: Ziwei */}
          <button
            onClick={() => onSwitchTab('ziwei')}
            className={`p-2.5 rounded-2xl border text-center transition flex flex-col items-center justify-center shadow-xs ${
              activeTab === 'ziwei'
                ? 'bg-gradient-to-b from-indigo-100 to-indigo-50 border-indigo-600/70 shadow-sm ring-1 ring-indigo-500/40'
                : 'bg-[#FFFDF9]/90 border-amber-900/15 hover:bg-indigo-50/50'
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-indigo-700/10 text-indigo-900 flex items-center justify-center mb-1 text-base">
              📜
            </div>
            <span className="text-xs font-bold text-indigo-950">Tử Vi</span>
            <span className="text-[9px] text-stone-500">12 Cung Mệnh</span>
          </button>

          {/* Tab 3: Bazi */}
          <button
            onClick={() => onSwitchTab('bazi')}
            className={`p-2.5 rounded-2xl border text-center transition flex flex-col items-center justify-center shadow-xs ${
              activeTab === 'bazi'
                ? 'bg-gradient-to-b from-emerald-100 to-emerald-50 border-emerald-600/70 shadow-sm ring-1 ring-emerald-500/40'
                : 'bg-[#FFFDF9]/90 border-amber-900/15 hover:bg-emerald-50/50'
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-700/10 text-emerald-900 flex items-center justify-center mb-1 text-base">
              🎴
            </div>
            <span className="text-xs font-bold text-emerald-950">Bát Tự</span>
            <span className="text-[9px] text-stone-500">Tứ Trụ Giáp Mộc</span>
          </button>
        </div>
      </div>
    </div>
  );
}
