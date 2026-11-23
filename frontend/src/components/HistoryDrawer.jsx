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
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            <h3 className="font-semibold text-sm text-slate-100">Lịch sử xem huyền học</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {history.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              Chưa có lịch sử nào được lưu. Sau khi tính toán và luận giải, bạn có thể lưu lại để xem lại sau!
            </div>
          ) : (
            history.map((item) => {
              const systemBadge = {
                qimen: { text: 'Kỳ Môn', color: 'bg-emerald-950/60 text-emerald-300 border-emerald-700/50' },
                ziwei: { text: 'Tử Vi', color: 'bg-purple-950/60 text-purple-300 border-purple-700/50' },
                bazi: { text: 'Bát Tự', color: 'bg-amber-950/60 text-amber-300 border-amber-700/50' },
                cross_check: { text: 'Đối Chiếu', color: 'bg-sky-950/60 text-sky-300 border-sky-700/50' },
              }[item.system] || { text: item.system, color: 'bg-slate-800 text-slate-300' };

              return (
                <div
                  key={item.id}
                  className="p-3 rounded-xl border border-slate-800 bg-slate-950/50 hover:bg-slate-800/40 transition group"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${systemBadge.color}`}>
                      {systemBadge.text}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {item.created_at?.slice(0, 16).replace('T', ' ')}
                    </span>
                  </div>

                  <h4 className="font-semibold text-slate-200 text-xs line-clamp-1 mb-1">
                    {item.title}
                  </h4>

                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-2.5">
                    {item.query_summary}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                    <button
                      onClick={() => {
                        onSelectHistory(item);
                        onClose();
                      }}
                      className="inline-flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 font-medium"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Xem lại kết quả</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>

                    <button
                      onClick={() => onDeleteHistory(item.id)}
                      className="text-slate-500 hover:text-rose-400 p-1"
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
