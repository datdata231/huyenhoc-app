import React, { useState } from 'react';
import { Compass, Users, History, Download, Sparkles, Palette } from 'lucide-react';
import { ELEMENT_THEMES } from '../utils/theme';

export default function Navbar({
  activeProfile,
  onOpenProfiles,
  onOpenHistory,
  onOpenInstall,
  currentTheme = 'Mộc',
  onChangeTheme,
}) {
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const themeObj = ELEMENT_THEMES[currentTheme] || ELEMENT_THEMES['Mộc'];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-amber-500/20 px-3 sm:px-4 py-2.5 transition-colors">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Brand & Theme Badge */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-300 p-0.5 flex items-center justify-center shadow-md shadow-amber-500/20">
            <Compass className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-100 flex items-center gap-1.5 leading-tight">
              <span>Huyền Học</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Á Đông
              </span>
            </h1>
            <p className="text-[10px] text-slate-400">Kỳ Môn • Tử Vi • Bát Tự</p>
          </div>
        </div>

        {/* Action Controls: Theme, Install, Profile, History */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Theme Selector Button */}
          <div className="relative">
            <button
              onClick={() => setShowThemeMenu(!showThemeMenu)}
              className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-500/50 text-xs text-slate-200 transition shadow-sm"
              title="Đổi phong cách Ngũ Hành Bản Mệnh"
            >
              <span>{themeObj.iconEmoji}</span>
              <span className="hidden sm:inline font-medium text-[11px]">{themeObj.name.split('•')[0]}</span>
            </button>

            {/* Dropdown Menu Ngũ Hành */}
            {showThemeMenu && (
              <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-slate-900 border border-amber-500/30 shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-2.5 py-1 text-[10px] font-bold text-amber-400 uppercase tracking-wider border-b border-slate-800">
                  Ngũ Hành Bản Mệnh
                </div>
                {Object.values(ELEMENT_THEMES).map((th) => (
                  <button
                    key={th.id}
                    onClick={() => {
                      onChangeTheme && onChangeTheme(th.id);
                      setShowThemeMenu(false);
                    }}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs text-left transition ${
                      currentTheme === th.id
                        ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                        : 'text-slate-300 hover:bg-slate-800/80'
                    }`}
                  >
                    <span>{th.iconEmoji}</span>
                    <span className="flex-1 truncate">{th.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Install PWA Button */}
          <button
            onClick={onOpenInstall}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/20 hover:from-amber-500/30 hover:to-amber-600/30 border border-amber-500/40 text-xs text-amber-300 font-bold transition shadow-sm"
            title="Cài đặt App vào điện thoại"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px]">Tải App</span>
          </button>

          {/* Profile Switcher */}
          <button
            onClick={onOpenProfiles}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-amber-500/50 text-xs text-slate-200 transition shadow-sm"
          >
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span className="max-w-[75px] sm:max-w-[100px] truncate font-medium">
              {activeProfile ? activeProfile.name : 'Hồ sơ'}
            </span>
          </button>

          {/* History Drawer Button */}
          <button
            onClick={onOpenHistory}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 transition"
            title="Lịch sử xem"
          >
            <History className="w-4 h-4 text-sky-400" />
          </button>
        </div>
      </div>
    </header>
  );
}
