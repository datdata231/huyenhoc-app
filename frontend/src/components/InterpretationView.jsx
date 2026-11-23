import React, { useState } from 'react';
import { Sparkles, ScrollText, UserCheck, BookOpen, Copy, Check } from 'lucide-react';

/**
 * Hiển thị bài Luận Giải theo chuẩn 2 góc nhìn:
 * 1. Lời Thầy Bình Giải (Dành cho người xem lá số - Dễ hiểu, ấm áp, thực tế)
 * 2. Hồ Sơ Thuật Số Kỹ Thuật (Dành cho tra cứu chuyên sâu học thuật)
 */
export default function InterpretationView({ interpretation, title = "Bài Luận Giải" }) {
  const [activeSubTab, setActiveSubTab] = useState('master'); // 'master' | 'technical'
  const [copied, setCopied] = useState(false);

  if (!interpretation) return null;

  // Tách 2 phần dựa trên mốc đánh dấu tiêu chuẩn
  const divider = '=== PHẦN II: HỒ SƠ THUẬT SỐ KỸ THUẬT ===';
  let masterContent = '';
  let technicalContent = '';

  if (interpretation.includes(divider)) {
    const parts = interpretation.split(divider);
    // Bỏ dòng tiêu đề phần I nếu có
    masterContent = parts[0].replace('=== PHẦN I: LỜI THẦY BÌNH GIẢI DÀNH CHO BẠN ===', '').trim();
    technicalContent = parts[1].trim();
  } else {
    // Nếu chưa có phân tách (bản ghi cũ), mặc định đưa vào tab Lời Thầy
    masterContent = interpretation;
    technicalContent = interpretation;
  }

  const handleCopy = () => {
    const textToCopy = activeSubTab === 'master' ? masterContent : technicalContent;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-3">
      {/* 2 Chế độ xem: Lời Thầy vs Hồ Sơ Kỹ Thuật */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/80 border border-slate-800">
          <button
            onClick={() => setActiveSubTab('master')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeSubTab === 'master'
                ? 'bg-gradient-to-r from-amber-500/20 to-emerald-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Lời Thầy Bình Giải (Dành Cho Bạn)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('technical')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeSubTab === 'technical'
                ? 'bg-slate-800 text-sky-300 border border-sky-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ScrollText className="w-3.5 h-3.5 text-sky-400" />
            <span>Hồ Sơ Thuật Số Kỹ Thuật</span>
          </button>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-[11px] text-slate-300 transition"
          title="Sao chép nội dung"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
          <span>{copied ? 'Đã chép' : 'Sao chép'}</span>
        </button>
      </div>

      {/* Nội dung tương ứng */}
      {activeSubTab === 'master' ? (
        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/20 via-slate-900 to-emerald-950/20 border border-amber-500/30 shadow-md space-y-3">
          <div className="flex items-center gap-2 text-amber-300 text-xs font-bold pb-2 border-b border-amber-500/20">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Tâm Thư & Lời Bình Giải Của Bậc Thầy Huyền Học</span>
          </div>

          <div className="prose prose-invert prose-sm max-w-none text-xs sm:text-sm leading-relaxed text-slate-200 whitespace-pre-line space-y-3 font-normal">
            {masterContent}
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-sky-300 text-xs font-bold pb-2 border-b border-slate-800">
            <BookOpen className="w-4 h-4 text-sky-400 shrink-0" />
            <span>Hồ Sơ Kỹ Thuật & Căn Cứ Học Thuật Cổ Điển</span>
          </div>

          <div className="prose prose-invert prose-sm max-w-none text-xs leading-relaxed text-slate-300 whitespace-pre-line space-y-3 font-mono">
            {technicalContent}
          </div>
        </div>
      )}
    </div>
  );
}
