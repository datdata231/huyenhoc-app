import React, { useState } from 'react';
import { X, GitCompare, Sparkles, CheckCircle2, ShieldAlert } from 'lucide-react';
import { interpretCrossCheck } from '../utils/api';
import DisclaimerFooter from './DisclaimerFooter';
import InterpretationView from './InterpretationView';

export default function CrossCheckModal({
  isOpen,
  onClose,
  baziData,
  ziweiData,
  profileName = 'Đương số',
}) {
  const [topic, setTopic] = useState('Đối chiếu bản mệnh và xu hướng tương lai');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleRunCrossCheck = async () => {
    if (!baziData || !ziweiData) {
      setError('Cần tính toán cả Bát Tự và Tử Vi trước khi đối chiếu chéo.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await interpretCrossCheck(baziData, ziweiData, profileName, topic);
      setResult(res.interpretation);
    } catch (err) {
      setError(err.message || 'Lỗi khi đối chiếu chéo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-amber-400" />
            <h3 className="font-semibold text-sm text-slate-100">
              Đối Chiếu Chéo: Bát Tự (Tứ Trụ) ⇄ Tử Vi Đẩu Số
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 max-h-[75vh] overflow-y-auto space-y-4">
          {/* Quick Summary Side-by-Side */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-800/40">
              <span className="font-bold text-amber-400 block mb-1">Trụ Cột Bát Tự</span>
              <div className="text-slate-300 space-y-0.5">
                <div>Nhật Chủ: <strong>{baziData?.day_master?.vn} ({baziData?.day_master?.stem})</strong></div>
                <div>Ngũ Hành: <strong>{baziData?.day_master?.vn_element}</strong></div>
                <div>Đại Vận: <strong>{baziData?.dayun?.direction_text}</strong></div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-800/40">
              <span className="font-bold text-purple-400 block mb-1">Mệnh Cục Tử Vi</span>
              <div className="text-slate-300 space-y-0.5">
                <div>Mệnh Cung: <strong>{ziweiData?.chart?.ming_gong?.ganzhi}</strong></div>
                <div>Cục: <strong>{ziweiData?.chart?.wuxing_ju?.name}</strong></div>
                <div>Thân cư: <strong>{ziweiData?.chart?.shen_gong?.palace}</strong></div>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-300 block mb-1 font-medium">Chủ đề cần đối soát:</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                placeholder="Ví dụ: Sự nghiệp, khởi nghiệp, tình cảm hôn nhân..."
              />
              <button
                onClick={handleRunCrossCheck}
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow disabled:opacity-50"
              >
                {loading ? 'Đang phân tích...' : 'Đối Chiếu Ngay'}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-950/40 border border-rose-800 rounded-xl text-xs text-rose-300 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {result ? (
            <InterpretationView interpretation={result} title="Đối Chiếu Bát Tự & Tử Vi" />
          ) : (
            <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-800 rounded-xl">
              Nhấn nút <strong>"Đối Chiếu Ngay"</strong> để hệ thống so sánh điểm hội tụ giữa thế khí ngũ hành Bát Tự và tinh diệu cát hung Tử Vi.
            </div>
          )}

          <DisclaimerFooter system="ziwei" />
        </div>
      </div>
    </div>
  );
}
