import React, { useState } from 'react';
import { Sparkles, ScrollText, UserCheck, BookOpen, Copy, Check } from 'lucide-react';
import MarkdownUIRenderer from './MarkdownUIRenderer';

/**
 * Hiển thị bài Luận Giải theo chuẩn 2 góc nhìn với giao diện Native UI:
 * 1. Lời Thầy Bình Giải (Dành cho người xem lá số - Thẻ UI trực quan, lời dặn ấm áp, không còn ký hiệu ### hay ***)
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
    masterContent = parts[0].replace('=== PHẦN I: LỜI THẦY BÌNH GIẢI DÀNH CHO BẠN ===', '').trim();
    technicalContent = parts[1].trim();
  } else {
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
    <div className="space-y-4">
      {/* 2 Chế độ xem: Lời Thầy vs Hồ Sơ Kỹ Thuật */}
      <div className="flex items-center justify-between border-b border-amber-900/15 pb-2">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#F5F1E8] border border-amber-900/15">
          <button
            onClick={() => setActiveSubTab('master')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeSubTab === 'master'
                ? 'bg-[#FFFDF9] text-amber-900 border border-amber-700/40 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-amber-700" />
            <span>Lời Thầy Bình Giải (Dành Cho Bạn)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('technical')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeSubTab === 'technical'
                ? 'bg-[#FFFDF9] text-sky-900 border border-sky-600/40 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <ScrollText className="w-3.5 h-3.5 text-sky-700" />
            <span>Hồ Sơ Thuật Số Kỹ Thuật</span>
          </button>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FAF7F0] hover:bg-[#F3EFE6] border border-stone-300 text-[11px] text-stone-700 transition"
          title="Sao chép nội dung"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-stone-500" />}
          <span>{copied ? 'Đã chép' : 'Sao chép'}</span>
        </button>
      </div>

      {/* Nội dung tương ứng */}
      {activeSubTab === 'master' ? (
        <div className="space-y-3.5">
          <div className="flex items-center gap-2 text-amber-900 text-xs sm:text-sm font-bold px-1">
            <Sparkles className="w-4 h-4 text-amber-700 shrink-0" />
            <span>Tâm Thư & Lời Bình Giải Của Bậc Thầy Huyền Học</span>
          </div>

          <MarkdownUIRenderer text={masterContent} mode="master" />
        </div>
      ) : (
        <div className="space-y-3.5">
          <div className="flex items-center gap-2 text-sky-900 text-xs font-bold px-1">
            <BookOpen className="w-4 h-4 text-sky-700 shrink-0" />
            <span>Hồ Sơ Kỹ Thuật & Căn Cứ Học Thuật Cổ Điển</span>
          </div>

          <MarkdownUIRenderer text={technicalContent} mode="technical" />
        </div>
      )}
    </div>
  );
}
