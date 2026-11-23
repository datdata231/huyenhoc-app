import React from 'react';
import { Compass, Users, History, Sparkles } from 'lucide-react';

export default function Navbar({
  activeProfile,
  onOpenProfiles,
  onOpenHistory,
}) {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 px-4 py-2.5">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 p-0.5 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Compass className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-100 flex items-center gap-1.5 leading-tight">
              <span>Huyền Học</span>
              <span className="text-[10px] font-normal px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                PWA
              </span>
            </h1>
            <p className="text-[10px] text-slate-400">Kỳ Môn • Tử Vi • Bát Tự</p>
          </div>
        </div>

        {/* Profile & History actions */}
        <div className="flex items-center gap-2">
          {/* Profile Switcher */}
          <button
            onClick={onOpenProfiles}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-amber-500/50 text-xs text-slate-200 transition shadow-sm"
          >
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span className="max-w-[90px] truncate font-medium">
              {activeProfile ? activeProfile.name : 'Chọn hồ sơ'}
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
