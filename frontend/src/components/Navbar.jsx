import React, { useState } from 'react';
import { Compass, Users, History, Download, Sparkles, Palette } from 'lucide-react';
import { ELEMENT_THEMES } from '../utils/theme';

export default function Navbar({
  activeProfile,
  onOpenProfiles,
  onOpenHistory,
  onOpenInstall,
  currentTheme = 'Mộc',
  theme,
  onChangeTheme,
}) {
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const themeObj = theme || ELEMENT_THEMES[currentTheme] || ELEMENT_THEMES['Mộc'];

  return (
    <header
      style={{ borderBottomColor: themeObj.cornerColor + '30' }}
      className="sticky top-0 z-40 bg-[#FFFDF9]/95 backdrop-blur-md border-b shadow-[0_2px_12px_rgba(40,25,15,0.05)] px-3 sm:px-4 py-2.5 transition-colors duration-300"
    >
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Brand & Theme Badge */}
        <div className="flex items-center gap-2">
          <div
            style={{ backgroundColor: themeObj.cornerColor }}
            className="w-8 h-8 rounded-xl p-0.5 flex items-center justify-center shadow-md transition-colors duration-300"
          >
            <Compass className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 leading-tight">
              <span>Huyền Học</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${themeObj.badge}`}>
                {themeObj.name.split('•')[0].trim()}
              </span>
            </h1>
            <p className="text-[10px] text-slate-600">Kỳ Môn • Tử Vi • Bát Tự</p>
          </div>
        </div>

        {/* Action Controls: Theme, Install, Profile, History */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Theme Selector Button */}
          <div className="relative">
            <button
              onClick={() => setShowThemeMenu(!showThemeMenu)}
              style={{ borderColor: themeObj.cornerColor }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#FAF7F0] border text-xs text-slate-800 transition shadow-xs"
              title="Đổi phong cách Ngũ Hành Bản Mệnh"
            >
              <span>{themeObj.iconEmoji}</span>
              <span className={`font-bold text-[11px] ${themeObj.accentText}`}>{themeObj.name.split('•')[0]}</span>
            </button>

            {/* Dropdown Menu Ngũ Hành */}
            {showThemeMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#FFFDF9] border border-amber-900/20 shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-2.5 py-1.5 text-[10px] font-bold text-amber-950 uppercase tracking-wider border-b border-amber-100/80 flex items-center justify-between">
                  <span>Ngũ Hành Bản Mệnh (Á Đông Sáng)</span>
                  <span>❖</span>
                </div>
                {Object.values(ELEMENT_THEMES).map((th) => (
                  <button
                    key={th.id}
                    onClick={() => {
                      onChangeTheme && onChangeTheme(th.id);
                      setShowThemeMenu(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs text-left transition my-0.5 ${
                      currentTheme === th.id
                        ? `${th.badge} font-bold shadow-xs ring-1 ring-amber-500/30`
                        : 'text-slate-700 hover:bg-[#F5EFE6]'
                    }`}
                  >
                    <span className="text-base shrink-0">{th.iconEmoji}</span>
                    <div className="flex-1 truncate">
                      <div className="font-bold leading-tight">{th.name}</div>
                      <div className="text-[10px] opacity-80 truncate">{th.motto}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Install PWA Button */}
          <button
            onClick={onOpenInstall}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-bold text-xs shadow-sm transition ${themeObj.primaryButton}`}
            title="Cài đặt App vào điện thoại"
          >
            <Download className="w-3.5 h-3.5 text-white" />
            <span className="text-[11px]">Tải App</span>
          </button>

          {/* Profile Switcher */}
          <button
            onClick={onOpenProfiles}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#FAF7F0] border border-amber-900/20 hover:border-amber-600/60 text-xs text-slate-800 transition shadow-sm"
          >
            <Users className="w-3.5 h-3.5 text-amber-700" />
            <span className="max-w-[75px] sm:max-w-[100px] truncate font-medium text-slate-800">
              {activeProfile ? activeProfile.name : 'Hồ sơ'}
            </span>
          </button>

          {/* History Drawer Button */}
          <button
            onClick={onOpenHistory}
            className="p-2 rounded-xl bg-[#FAF7F0] border border-amber-900/20 hover:border-amber-600/60 text-slate-700 transition shadow-sm"
            title="Lịch sử xem"
          >
            <History className="w-4 h-4 text-sky-700" />
          </button>
        </div>
      </div>
    </header>
  );
}
