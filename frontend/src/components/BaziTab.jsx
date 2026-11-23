import React, { useState, useEffect } from 'react';
import {
  Sparkles, Play, BookmarkPlus, CheckCircle2, ShieldAlert,
  GitCompare, Calendar, Flame, Activity
} from 'lucide-react';
import WarningsBanner from './WarningsBanner';
import DisclaimerFooter from './DisclaimerFooter';
import CrossCheckModal from './CrossCheckModal';
import { calculateBazi, calculateZiwei, interpretBazi, saveHistory } from '../utils/api';
import { STEM_MAP, BRANCH_MAP, SHISHEN_MAP } from '../utils/vietnamese_terms';

export default function BaziTab({ activeProfile }) {
  const [focusTopic, setFocusTopic] = useState('Tổng quan');
  const [loading, setLoading] = useState(false);
  const [interpreting, setInterpreting] = useState(false);
  const [error, setError] = useState(null);
  const [calcResult, setCalcResult] = useState(null);
  const [ziweiResult, setZiweiResult] = useState(null);
  const [interpretation, setInterpretation] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [openCrossCheck, setOpenCrossCheck] = useState(false);

  useEffect(() => {
    if (activeProfile) {
      handleCalculate();
    }
  }, [activeProfile?.id]);

  const handleCalculate = async () => {
    if (!activeProfile) {
      setError('Vui lòng chọn hoặc tạo hồ sơ trước khi lập lá số Bát Tự.');
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
        late_zi_rule: activeProfile.late_zi_rule || 'same_day',
        city: activeProfile.city || 'Ho Chi Minh City',
        profile_id: activeProfile.id,
        profile_name: activeProfile.name,
      };

      const result = await calculateBazi(payload);
      setCalcResult(result);

      // Pre-fetch Ziwei for cross-check compatibility
      try {
        const zwRes = await calculateZiwei({
          calendar_type: activeProfile.calendar_type || 'solar',
          birth_time: activeProfile.birth_time,
          gender: activeProfile.gender || '男',
          is_leap_month: activeProfile.is_leap_month || false,
          late_zi_rule: activeProfile.late_zi_rule || 'next_day',
          leap_month_rule: activeProfile.leap_month_rule || 'split_15',
          query_year: new Date().getFullYear(),
        });
        setZiweiResult(zwRes);
      } catch (zwErr) {
        console.warn('Pre-fetch Ziwei for cross check note:', zwErr);
      }

      // Auto trigger AI interpretation
      setInterpreting(true);
      try {
        const aiRes = await interpretBazi(result, payload, focusTopic);
        setInterpretation(aiRes.interpretation);
      } catch (aiErr) {
        console.warn('AI Interpretation error:', aiErr);
        setError('Đã tính toán Tứ Trụ thành công, nhưng dịch vụ AI chưa phản hồi. Bạn vẫn có thể xem bảng Can Chi và Đại Vận bên dưới.');
      } finally {
        setInterpreting(false);
      }
    } catch (err) {
      setError(err.message || 'Lỗi khi tính toán Tứ Trụ');
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
        system: 'bazi',
        title: `Bát Tự: ${activeProfile?.name} - Nhật Chủ ${calcResult.day_master?.vn} (${calcResult.day_master?.stem})`,
        query_summary: `Khởi vận: ${calcResult.dayun?.start_age_display} • ${calcResult.wuxing_counts?.vn_summary}`,
        chart_data: calcResult,
        interpretation: interpretation,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (e) {
      alert('Không thể lưu: ' + e.message);
    }
  };

  const fp = calcResult?.four_pillars;
  const dm = calcResult?.day_master;
  const dayun = calcResult?.dayun;
  const interactions = calcResult?.interactions;
  const wuxingCounts = calcResult?.wuxing_counts?.counts || {};

  return (
    <div className="space-y-5 pb-8">
      {/* Profile & Action Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-500" />
            <h2 className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
              Bát Tự Tứ Trụ (Tử Bình Chính Tông)
            </h2>
          </div>
          {activeProfile && (
            <span className="text-xs font-bold text-slate-200 bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-700">
              {activeProfile.name} ({activeProfile.gender === '男' ? 'Nam' : 'Nữ'})
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={focusTopic}
            onChange={(e) => setFocusTopic(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
          >
            <option value="Tổng quan">Tổng quan Vận mệnh</option>
            <option value="Sự nghiệp">Sự nghiệp & Cách cục</option>
            <option value="Tài vận">Tài vận & Cơ hội làm giàu</option>
            <option value="Tình cảm">Hôn nhân & Gia đạo</option>
            <option value="Đại vận">Đại Vận & Chuyển biến tương lai</option>
          </select>

          <button
            onClick={handleCalculate}
            disabled={loading}
            className="py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow transition disabled:opacity-50"
          >
            {loading ? (
              <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-slate-950" />
            )}
            <span>Tính Lại</span>
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-950/40 border border-rose-800 rounded-xl text-xs text-rose-300 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {calcResult && (
        <div className="space-y-4 animate-in fade-in duration-300">
          {/* Warnings Banner */}
          <WarningsBanner warnings={calcResult.warnings} />

          {/* Four Pillars Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-slate-200">Bảng Tứ Trụ Bát Tự</span>
              <span className="text-[11px] text-amber-400">
                Sinh dương lịch: {calcResult.calendar?.solar?.ymd_hms}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              {['hour', 'day', 'month', 'year'].map((pKey) => {
                const pillar = fp?.[pKey];
                if (!pillar) return null;
                const isDay = pKey === 'day';
                const pTitle = { hour: 'Trụ Giờ', day: 'Trụ Ngày', month: 'Trụ Tháng', year: 'Trụ Năm' }[pKey];
                const stemMeta = STEM_MAP[pillar.stem] || {};
                const branchMeta = BRANCH_MAP[pillar.branch] || {};
                const shishenMeta = SHISHEN_MAP[pillar.stem_shishen] || {};

                return (
                  <div
                    key={pKey}
                    className={`p-2.5 rounded-xl border flex flex-col justify-between ${
                      isDay
                        ? 'bg-amber-500/10 border-amber-500/60 shadow-sm ring-1 ring-amber-500/40'
                        : 'bg-slate-950/80 border-slate-800'
                    }`}
                  >
                    <span className="text-[10px] text-slate-400 font-medium block mb-1">
                      {pTitle}
                    </span>

                    {/* Stem & Shishen */}
                    <div className="my-1">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border ${shishenMeta.color || 'bg-slate-800 text-slate-300'}`}>
                        {pillar.stem_vn_shishen}
                      </span>
                      <div className="mt-1.5 text-lg font-bold font-mono text-slate-100">
                        <span className={stemMeta.color}>{pillar.stem}</span>
                      </div>
                      <span className="text-[11px] text-slate-300 block">{pillar.stem_vn}</span>
                      <span className="text-[9px] text-slate-500 block">({stemMeta.element})</span>
                    </div>

                    <div className="w-full border-t border-slate-800/80 my-1.5" />

                    {/* Branch */}
                    <div className="my-1">
                      <div className="text-lg font-bold font-mono text-slate-100">
                        <span className={branchMeta.color}>{pillar.branch}</span>
                      </div>
                      <span className="text-[11px] text-slate-300 block">{pillar.branch_vn}</span>
                      <span className="text-[9px] text-slate-500 block">({branchMeta.animal} • {branchMeta.element})</span>
                    </div>

                    {/* Hidden Stems */}
                    <div className="mt-2 pt-1.5 border-t border-slate-800/80 space-y-1">
                      <span className="text-[9px] text-slate-400 block font-semibold">Tàng can:</span>
                      {pillar.hidden_details?.map((hd, hIdx) => (
                        <div key={hIdx} className="text-[10px] flex items-center justify-between text-slate-300 bg-slate-900/60 px-1 py-0.5 rounded">
                          <span className="font-mono text-amber-400">{hd.stem}</span>
                          <span className="text-[9px] text-slate-400">{hd.vn_shishen}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Day Master & Five Elements distribution */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Day Master */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 shadow-sm space-y-1.5">
              <span className="text-xs font-bold text-amber-400 block">Nhật Chủ (Bản Thân)</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-slate-100 font-mono">{dm?.stem}</span>
                <div>
                  <div className="font-semibold text-slate-200">
                    {dm?.vn} • Ngũ hành: {dm?.vn_element} ({dm?.yinyang})
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Sinh vào tháng {dm?.born_in_month_vn} ({dm?.born_in_month}): {dm?.is_dangling ? 'Đắc Lệnh tháng' : 'Không đắc lệnh'}
                  </div>
                </div>
              </div>
            </div>

            {/* Five Elements count */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 shadow-sm space-y-1.5">
              <span className="text-xs font-bold text-slate-300 block">Phân Bổ Ngũ Hành (4 Can + 4 Chi)</span>
              <div className="grid grid-cols-5 gap-1.5 text-center pt-1">
                {[
                  { key: '木', label: 'Mộc', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
                  { key: '火', label: 'Hỏa', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
                  { key: '土', label: 'Thổ', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
                  { key: '金', label: 'Kim', color: 'bg-slate-400/20 text-slate-200 border-slate-400/40' },
                  { key: '水', label: 'Thủy', color: 'bg-sky-500/20 text-sky-300 border-sky-500/40' },
                ].map((elem) => (
                  <div key={elem.key} className={`p-1.5 rounded-xl border ${elem.color}`}>
                    <span className="text-[10px] block">{elem.label}</span>
                    <span className="text-sm font-bold block">{wuxingCounts[elem.key] || 0}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Branch Interactions */}
          {interactions && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 shadow-sm space-y-2 text-xs">
              <span className="text-xs font-bold text-sky-400 block">Tương Tác Địa Chi</span>
              <div className="space-y-1">
                {interactions.liu_chong?.length > 0 && (
                  <div className="text-rose-300">
                    ⚠️ <strong>Lục xung:</strong> {interactions.liu_chong.map((x) => x.name).join(', ')}
                  </div>
                )}
                {interactions.liu_he?.length > 0 && (
                  <div className="text-emerald-300">
                    ✨ <strong>Lục hợp:</strong> {interactions.liu_he.map((x) => x.name).join(', ')}
                  </div>
                )}
                {interactions.san_he?.length > 0 && (
                  <div className="text-amber-300">
                    🌟 <strong>Tam hợp / Bán hợp:</strong> {interactions.san_he.map((x) => x.name).join(', ')}
                  </div>
                )}
                {interactions.san_xing?.length > 0 && (
                  <div className="text-orange-300">
                    ⚡ <strong>Tam hình:</strong> {interactions.san_xing.map((x) => x.name).join(', ')}
                  </div>
                )}
                {interactions.zi_xing?.length > 0 && (
                  <div className="text-purple-300">
                    🌀 <strong>Tự hình:</strong> {interactions.zi_xing.map((x) => x.name).join(', ')}
                  </div>
                )}
                {Object.values(interactions).every((arr) => !arr || arr.length === 0) && (
                  <div className="text-slate-400">Không có xung hình hợp đặc biệt trong nguyên cục, khí thế ổn định.</div>
                )}
              </div>
            </div>
          )}

          {/* DaYun Pillars (Đại Vận) */}
          {dayun && dayun.pillars && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div>
                  <span className="text-xs font-bold text-slate-200 block">Chu Kỳ Đại Vận (10 Năm / Vận)</span>
                  <span className="text-[10px] text-slate-400">
                    Khởi vận: {dayun.start_age_display} ({dayun.direction_text})
                  </span>
                </div>
                {dayun.start_solar_date && (
                  <span className="text-[10px] text-amber-400 font-mono">
                    Ngày khởi: {dayun.start_solar_date}
                  </span>
                )}
              </div>

              {/* DaYun Scrollable List */}
              <div className="flex gap-2 overflow-x-auto pb-2 pt-1">
                {dayun.pillars.map((dy) => (
                  <div
                    key={dy.index}
                    className="shrink-0 p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-center w-20 flex flex-col justify-between"
                  >
                    <span className="text-[10px] text-slate-400 font-mono block">
                      {dy.start_age}-{dy.end_age}t
                    </span>
                    <div className="my-1">
                      <span className="text-base font-bold text-amber-300 block font-mono">
                        {dy.ganzhi}
                      </span>
                      <span className="text-[10px] text-slate-300 block">{dy.vn_ganzhi}</span>
                    </div>
                    <span className="text-[9px] text-slate-500 font-mono block">
                      {dy.start_year}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cross-Check Button */}
          <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-950/40 to-purple-950/40 border border-amber-800/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GitCompare className="w-4 h-4 text-amber-400" />
              <div>
                <span className="text-xs font-bold text-slate-200 block">Đối chiếu chéo với Tử Vi</span>
                <span className="text-[10px] text-slate-400 block">So sánh điểm tương đồng và bổ khuyết giữa 2 môn phái</span>
              </div>
            </div>
            <button
              onClick={() => setOpenCrossCheck(true)}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow transition"
            >
              Xem Đối Chiếu
            </button>
          </div>

          {/* AI Interpretation Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <Sparkles className="w-4 h-4" />
                <span>Luận Giải Tứ Trụ Bát Tự (8 Mục Chuẩn SKILL.md)</span>
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
                <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-400">Đại sư đang thẩm định Nhật Chủ, Hỷ Dụng Thần & Đại Vận...</p>
              </div>
            ) : interpretation ? (
              <div className="prose prose-invert prose-sm max-w-none text-xs leading-relaxed text-slate-200 whitespace-pre-line space-y-3">
                {interpretation}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-500 text-xs">
                Chưa có bài luận giải. Bấm nút phía trên để bắt đầu luận đoán.
              </div>
            )}
          </div>

          {/* Standard Disclaimer Footer */}
          <DisclaimerFooter system="bazi" />

          {/* Cross Check Modal */}
          <CrossCheckModal
            isOpen={openCrossCheck}
            onClose={() => setOpenCrossCheck(false)}
            baziData={calcResult}
            ziweiData={ziweiResult}
            profileName={activeProfile?.name || 'Đương số'}
          />
        </div>
      )}
    </div>
  );
}
