import React from 'react';
import { X, Clock, Trash2, ArrowRight, BookOpen } from 'lucide-react';

export default function HistoryDrawer({
  isOpen,
  onClose,
  history = [],
  onSelectHistory,
  onDeleteHistory,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#FFFDF9] border-l border-amber-900/20 h-full flex flex-col shadow-2xl animate-in slide-in-from-right text-stone-800">
        {/* Header */}
        <div className="p-4 border-b border-amber-900/15 flex items-center justify-between bg-[#FAF7F0]">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-700" />
            <h3 className="font-bold text-sm text-stone-800">Lịch sử xem huyền học</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-[#F3EFE6]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {history.length === 0 ? (
            <div className="text-center py-12 text-stone-500 text-xs">
              Chưa có lịch sử nào được lưu. Sau khi tính toán và luận giải, bạn có thể lưu lại để xem lại sau!
            </div>
          ) : (
            history.map((item) => {
              const systemBadge = {
                qimen: { text: 'Kỳ Môn', color: 'bg-emerald-50 text-emerald-900 border-emerald-300' },
                ziwei: { text: 'Tử Vi', color: 'bg-purple-50 text-purple-900 border-purple-300' },
                bazi: { text: 'Bát Tự', color: 'bg-amber-50 text-amber-950 border-amber-300' },
                cross_check: { text: 'Đối Chiếu', color: 'bg-sky-50 text-sky-900 border-sky-300' },
              }[item.system] || { text: item.system, color: 'bg-stone-100 text-stone-700 border-stone-200' };

              return (
                <div
                  key={item.id}
                  className="p-3 rounded-xl border border-amber-900/15 bg-[#FFFEFC] hover:border-amber-700/50 transition group shadow-xs"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${systemBadge.color}`}>
                      {systemBadge.text}
                    </span>
                    <span className="text-[10px] text-stone-500 font-mono">
                      {item.created_at?.slice(0, 16).replace('T', ' ')}
                    </span>
                  </div>

                  <h4 className="font-bold text-stone-800 text-xs line-clamp-1 mb-1">
                    {item.title}
                  </h4>

                  <p className="text-[11px] text-stone-600 line-clamp-2 leading-relaxed mb-2.5">
                    {item.query_summary}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-stone-200">
                    <button
                      onClick={() => {
                        onSelectHistory(item);
                        onClose();
                      }}
                      className="inline-flex items-center gap-1 text-[11px] text-amber-800 hover:text-amber-950 font-bold"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Xem lại kết quả</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>

                    <button
                      onClick={() => onDeleteHistory(item.id)}
                      className="text-stone-400 hover:text-rose-600 p-1"
                      title="Xóa"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
