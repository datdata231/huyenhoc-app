import React, { useState, useEffect } from 'react';
import {
  Sparkles, Play, BookmarkPlus, CheckCircle2, ShieldAlert,
  Calendar, Layers, Eye, ChevronRight
} from 'lucide-react';
import WarningsBanner from './WarningsBanner';
import DisclaimerFooter from './DisclaimerFooter';
import ZodiacBadge from './ZodiacBadge';
import InterpretationView from './InterpretationView';
import { calculateZiwei, interpretZiwei, saveHistory } from '../utils/api';
import {
  MAJOR_STARS_MAP, BRIGHTNESS_MAP, SIHUA_MAP, PALACE_NAMES_VN, BRANCH_MAP
} from '../utils/vietnamese_terms';

export default function ZiweiTab({ activeProfile }) {
  const currentYear = new Date().getFullYear();
  const [queryYear, setQueryYear] = useState(currentYear);
  const [focusTopic, setFocusTopic] = useState('Tổng quan');
  const [selectedPalaceIdx, setSelectedPalaceIdx] = useState(0); // For detailed single-palace mobile inspector

  const [loading, setLoading] = useState(false);
  const [interpreting, setInterpreting] = useState(false);
  const [error, setError] = useState(null);
  const [calcResult, setCalcResult] = useState(null);
  const [interpretation, setInterpretation] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Auto calculate when activeProfile changes or on first mount
  useEffect(() => {
    if (activeProfile) {
      handleCalculate();
    }
  }, [activeProfile?.id]);

  const handleCalculate = async () => {
    if (!activeProfile) {
      setError('Vui lòng chọn hoặc tạo một hồ sơ (Tôi hoặc Bạn bè) ở góc trên trước khi an sao.');
      return;
    }

    setError(null);
    setInterpretation('');
    setSavedSuccess(false);
    setLoading(true);

    try {
      const payload = {
        calendar_type: activeProfile.calendar_type || 'solar',
        birth_time: activeProfile.birth_time,
        gender: activeProfile.gender || '男',
        is_leap_month: activeProfile.is_leap_month || false,
        late_zi_rule: activeProfile.late_zi_rule || 'next_day',
        leap_month_rule: activeProfile.leap_month_rule || 'split_15',
        query_year: Number(queryYear),
        profile_id: activeProfile.id,
        profile_name: activeProfile.name,
      };

      const result = await calculateZiwei(payload);
      setCalcResult(result);

      // Auto trigger AI interpretation
      setInterpreting(true);
      try {
        const aiRes = await interpretZiwei(result, payload, focusTopic);
        setInterpretation(aiRes.interpretation);
      } catch (aiErr) {
        console.warn('AI Interpretation error:', aiErr);
        setError('Đã an sao Tử Vi thành công, nhưng dịch vụ AI chưa phản hồi. Bạn vẫn có thể xem đồ hình lá số và thông số kỹ thuật bên dưới.');
      } finally {
        setInterpreting(false);
      }
    } catch (err) {
      setError(err.message || 'Lỗi khi an sao Tử Vi');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!calcResult) return;
    try {
      await saveHistory({
        profile_id: activeProfile?.id,
        profile_name: activeProfile?.name || 'Vô danh',
        system: 'ziwei',
        title: `Tử Vi: ${activeProfile?.name} - Mệnh ${calcResult.chart?.ming_gong?.ganzhi} (Năm ${queryYear})`,
        query_summary: `Cục: ${calcResult.chart?.wuxing_ju?.name} • Thân cư: ${calcResult.chart?.shen_gong?.palace} • ${focusTopic}`,
        chart_data: calcResult,
        interpretation: interpretation,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (e) {
      alert('Không thể lưu: ' + e.message);
    }
  };

  const chart = calcResult?.chart;
  const horoscope = calcResult?.horoscope;
  const palaces = chart?.palaces || [];

  return (
    <div className="space-y-5 pb-8">
      {/* Profile & Year Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-400" />
            <h2 className="text-xs font-semibold text-purple-300 uppercase tracking-wider">
              Tử Vi Đẩu Số (Bản Mệnh & Lưu Niên)
            </h2>
          </div>
          {activeProfile && (
            <span className="text-xs font-bold text-slate-200 bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-700">
              {activeProfile.name} ({activeProfile.gender === '男' ? 'Nam' : 'Nữ'})
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2.5 text-xs">
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Năm lưu niên khảo sát:</label>
            <input
              type="number"
              value={queryYear}
              onChange={(e) => setQueryYear(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-100"
              placeholder="Ví dụ: 2026"
            />
          </div>
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Trọng tâm luận giải:</label>
            <select
              value={focusTopic}
              onChange={(e) => setFocusTopic(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
            >
              <option value="Tổng quan">Tổng quan Bản mệnh</option>
              <option value="Sự nghiệp">Sự nghiệp & Quan Lộc</option>
              <option value="Tài vận">Tài chính & Tài Bạch</option>
              <option value="Tình duyên">Tình duyên & Phu Thê</option>
              <option value="Lưu niên">Vận hạn Lưu Niên</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleCalculate}
          disabled={loading}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-900/30 transition disabled:opacity-50"
        >
          {loading ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Đang an sao 12 cung...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>An Sao & Luận Giải Tử Vi</span>
            </>
          )}
        </button>

        {error && (
          <div className="p-3 bg-rose-950/40 border border-rose-800 rounded-xl text-xs text-rose-300 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {calcResult && (
        <div className="space-y-4 animate-in fade-in duration-300">
          {/* Warnings & Rules Banner */}
          <WarningsBanner warnings={calcResult.warnings} />

          {/* Natal Meta Cards */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 shadow-sm">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Mệnh Cung</span>
                <span className="font-bold text-purple-300 text-sm">
                  {chart?.ming_gong?.ganzhi} ({BRANCH_MAP[chart?.ming_gong?.branch]?.vn})
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Thân Cung</span>
                <span className="font-bold text-sky-300 text-sm">
                  {chart?.shen_gong?.palace} ({BRANCH_MAP[chart?.shen_gong?.branch]?.vn})
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Ngũ Hành Cục</span>
                <span className="font-bold text-amber-300 text-sm">
                  {chart?.wuxing_ju?.name} ({chart?.wuxing_ju?.number} Cục)
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Mệnh / Thân Chủ</span>
                <span className="font-semibold text-slate-200">
                  {chart?.ming_zhu} / {chart?.shen_zhu}
                </span>
              </div>
            </div>

            {/* Horoscope info */}
            {horoscope && (
              <div className="mt-2.5 p-2 rounded-xl bg-indigo-950/30 border border-indigo-900/40 text-xs flex flex-wrap items-center justify-between gap-2">
                <span className="text-indigo-300">
                  Lưu niên <strong>{horoscope.query_lunar_year}</strong> ({horoscope.nominal_age} tuổi mụ)
                </span>
                <span className="text-slate-300">
                  Lưu Niên Mệnh Cung: <strong>{horoscope.yearly?.yearly_ming_gong?.palace_name} ({horoscope.yearly?.yearly_ming_gong?.branch})</strong>
                </span>
              </div>
            )}
          </div>

          {/* 12 Palaces Grid Display */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-md">
            <div className="flex items-center justify-between mb-2.5 px-1">
              <span className="text-xs font-bold text-slate-200">Đồ Hình 12 Cung Số</span>
              <span className="text-[10px] text-slate-400">Chạm vào cung để soi kỹ</span>
            </div>

            {/* Mobile-first scrollable or grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {palaces.map((p, idx) => {
                const isSelected = selectedPalaceIdx === idx;
                const isMing = p.name === '命宫';
                const isShen = p.is_shen_gong;

                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedPalaceIdx(idx)}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition relative flex flex-col justify-between min-h-[140px] ${
                      isSelected
                        ? 'bg-purple-950/40 border-purple-500 shadow-md ring-1 ring-purple-500'
                        : isMing
                        ? 'bg-purple-950/20 border-purple-800/80 hover:border-purple-600'
                        : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Top Row: Palace Name, Stem-Branch, Decade Age */}
                    <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-800/80">
                      <div className="flex items-center gap-1.5">
                        <ZodiacBadge branch={p.branch || (p.ganzhi && p.ganzhi[1])} size="sm" showHanzi={false} />
                        <span className={`font-bold ${isMing ? 'text-amber-400' : 'text-slate-200'}`}>
                          {p.name}
                        </span>
                        {isShen && (
                          <span className="text-[9px] px-1 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                            Thân
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {p.ganzhi} ({p.decadal_age_range})
                      </span>
                    </div>

                    {/* Major Stars (Chính tinh) */}
                    <div className="my-1.5 space-y-1">
                      {p.major_stars && p.major_stars.length > 0 ? (
                        p.major_stars.map((s, sIdx) => {
                          const starMeta = MAJOR_STARS_MAP[s.name] || {};
                          const brightMeta = BRIGHTNESS_MAP[s.brightness] || {};
                          return (
                            <div key={sIdx} className="flex items-center justify-between text-[11px]">
                              <span className={starMeta.color || 'text-slate-200'}>
                                {s.name} ({starMeta.vn || s.name})
                              </span>
                              <div className="flex items-center gap-1">
                                {s.brightness && (
                                  <span className={`text-[9px] px-1 rounded border ${brightMeta.badge || 'text-slate-400'}`}>
                                    {s.brightness}
                                  </span>
                                )}
                                {s.sihua && (
                                  <span className="text-[9px] bg-rose-500 text-white font-bold px-1 rounded">
                                    {s.sihua}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <span className="text-[11px] text-slate-500 italic">Vô chính diệu (Không chính tinh)</span>
                      )}
                    </div>

                    {/* Minor Stars Pills */}
                    <div className="flex flex-wrap gap-1 text-[9px] text-slate-400 pt-1 border-t border-slate-900">
                      {p.minor_stars?.slice(0, 4).map((m, mIdx) => (
                        <span key={mIdx} className="px-1 py-0.2 rounded bg-slate-900 border border-slate-800">
                          {m}
                        </span>
                      ))}
                      {(p.minor_stars?.length || 0) > 4 && (
                        <span className="text-slate-500">+{p.minor_stars.length - 4}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Palace Detail Modal / Inspector */}
          {palaces[selectedPalaceIdx] && (
            <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 shadow-sm space-y-2">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" />
                  <span>Chi tiết cung: {palaces[selectedPalaceIdx].name} ({PALACE_NAMES_VN[palaces[selectedPalaceIdx].name] || ''})</span>
                </span>
                <span className="text-xs font-mono text-slate-300">
                  {palaces[selectedPalaceIdx].ganzhi} • Đại hạn {palaces[selectedPalaceIdx].decadal_age_range} tuổi
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                <div>
                  <span className="text-[11px] text-slate-400 block mb-1 font-semibold">Chính Tinh:</span>
                  <div className="space-y-1 pl-2">
                    {palaces[selectedPalaceIdx].major_stars?.length > 0 ? (
                      palaces[selectedPalaceIdx].major_stars.map((s, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="text-slate-100 font-medium">
                            {s.name} ({MAJOR_STARS_MAP[s.name]?.vn || s.name})
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700">
                            {s.brightness ? `Độ sáng: ${s.brightness}` : '—'}
                          </span>
                          {s.sihua && (
                            <span className="text-[10px] bg-rose-600 text-white font-bold px-1.5 py-0.5 rounded">
                              {s.sihua}
                            </span>
                          )}
                        </div>
                      ))
                    ) : (
                      <span className="text-slate-500">Cung Vô Chính Diệu (mượn tinh diệu đối cung)</span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 block mb-1 font-semibold">Phụ Tinh & Sát Cát Tinh:</span>
                  <div className="flex flex-wrap gap-1.5 pl-2">
                    {palaces[selectedPalaceIdx].minor_stars?.map((m, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-[11px]">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AI Interpretation Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <Sparkles className="w-4 h-4" />
                <span>Luận Giải Tử Vi Đẩu Số (Chuẩn SKILL.md)</span>
              </div>
              <button
                onClick={handleSave}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition"
              >
                {savedSuccess ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Đã lưu</span>
                  </>
                ) : (
                  <>
                    <BookmarkPlus className="w-3.5 h-3.5 text-amber-400" />
                    <span>Lưu lá số</span>
                  </>
                )}
              </button>
            </div>

            {interpreting ? (
              <div className="py-8 text-center space-y-2">
                <div className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-purple-300 font-medium">Bậc Thầy đang giải đoán Tam Phương Tứ Chính, Tứ Hóa & Vận Hạn...</p>
                <p className="text-[11px] text-slate-400">Đang chuẩn bị Lời Bình Giải Thực Tế và Hồ Sơ Kỹ Thuật...</p>
              </div>
            ) : interpretation ? (
              <InterpretationView interpretation={interpretation} title="Luận Giải Tử Vi" />
            ) : (
              <div className="text-center py-6 text-slate-500 text-xs">
                Chưa có bài luận giải. Bấm nút phía trên để bắt đầu an sao.
              </div>
            )}
          </div>

          {/* Standard Disclaimer Footer */}
          <DisclaimerFooter system="ziwei" />
        </div>
      )}
    </div>
  );
}
