import React, { useState, useEffect } from 'react';
import {
  Sparkles, Play, BookmarkPlus, CheckCircle2, ShieldAlert,
  GitCompare, Calendar, Flame, Activity
} from 'lucide-react';
import WarningsBanner from './WarningsBanner';
import DisclaimerFooter from './DisclaimerFooter';
import CrossCheckModal from './CrossCheckModal';
import ZodiacBadge from './ZodiacBadge';
import InterpretationView from './InterpretationView';
import { calculateBazi, calculateZiwei, interpretBazi, saveHistory } from '../utils/api';
import { STEM_MAP, BRANCH_MAP, SHISHEN_MAP } from '../utils/vietnamese_terms';

export default function BaziTab({ activeProfile, theme }) {
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
    <div className="space-y-4 pb-8">
      {/* Profile & Action Bar (Á Đông Sáng) */}
      <div className="bg-[#FFFEFA] border border-amber-900/15 rounded-2xl p-4 shadow-sm space-y-3 oriental-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-600" />
            <h2 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
              Bát Tự Tứ Trụ (Tử Bình Chính Tông)
            </h2>
          </div>
          {activeProfile && (
            <span className="text-xs font-bold text-emerald-900 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-300 shadow-xs">
              {activeProfile.name} ({activeProfile.gender === '男' ? 'Nam' : 'Nữ'})
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={focusTopic}
            onChange={(e) => setFocusTopic(e.target.value)}
            className="flex-1 bg-[#FAF7F0] border border-amber-900/20 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-amber-500"
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
            className={`py-2 px-4 rounded-xl font-bold text-xs flex items-center gap-1.5 transition disabled:opacity-50 ${theme?.primaryButton || 'bg-gradient-to-r from-amber-600 to-amber-500 text-white shadow-sm'}`}
          >
            {loading ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-white" />
            )}
            <span>Tính Lại</span>
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {calcResult && (
        <div className="space-y-4 animate-in fade-in duration-300">
          {/* Warnings Banner */}
          <WarningsBanner warnings={calcResult.warnings} />

          {/* Bảng Tứ Trụ Bát Tự - Phiên bản nâng cấp */}
          <div className="bg-[#FFFEFA] border border-amber-900/15 rounded-2xl overflow-hidden shadow-sm oriental-card">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-50 via-[#FFFEFA] to-emerald-50 px-4 py-2.5 border-b border-amber-900/10 flex items-center justify-between">
              <span className="text-xs font-bold text-stone-900 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-600 to-amber-700 text-white text-[10px] flex items-center justify-center font-bold shadow-xs">四</span>
                <span>Tứ Trụ Bát Tự — Can Chi & Thập Thần</span>
              </span>
              <span className="text-[11px] font-medium text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                {calcResult.calendar?.solar?.ymd_hms}
              </span>
            </div>

            {/* Row tiêu đề (Giờ → Ngày → Tháng → Năm - truyền thống) */}
            <div className="grid grid-cols-4 text-center text-[10px] font-bold bg-[#FAF7F0] border-b border-amber-900/10">
              {['hour', 'day', 'month', 'year'].map(pKey => (
                <div key={pKey} className={`py-1.5 ${
                  pKey === 'day' ? 'bg-emerald-100/60 text-emerald-900 border-x border-emerald-300/50' : 'text-stone-500'
                }`}>
                  {{ hour: '時 Giờ', day: '日 Ngày', month: '月 Tháng', year: '年 Năm' }[pKey]}
                </div>
              ))}
            </div>

            {/* Can (Stem) Row */}
            <div className="grid grid-cols-4 text-center border-b border-amber-900/08">
              {['hour', 'day', 'month', 'year'].map((pKey) => {
                const pillar = fp?.[pKey];
                if (!pillar) return <div key={pKey} />;
                const isDay = pKey === 'day';
                const stemMeta = STEM_MAP[pillar.stem] || {};
                const shishenMeta = SHISHEN_MAP[pillar.stem_shishen] || {};
                return (
                  <div key={pKey} className={`py-3 px-1.5 flex flex-col items-center gap-1 ${
                    isDay ? 'bg-emerald-50/60 border-x border-emerald-300/40' : ''
                  }`}>
                    {/* Thập Thần badge */}
                    <span className={`text-[9px] px-1.5 py-0.5 rounded border font-bold leading-tight truncate max-w-full ${
                      shishenMeta.color || 'bg-amber-100 text-amber-900 border-amber-300'
                    }`}>
                      {pillar.stem_vn_shishen || '—'}
                    </span>
                    {/* Hán tự Can lớn */}
                    <span className={`text-3xl font-bold font-serif leading-none ${
                      stemMeta.color || 'text-amber-900'
                    } ${isDay ? 'drop-shadow-sm' : ''}`}>
                      {pillar.stem}
                    </span>
                    {/* Tên Việt */}
                    <span className="text-[11px] font-bold text-stone-800">{pillar.stem_vn}</span>
                    <span className="text-[9px] text-stone-500">({stemMeta.element})</span>
                    {isDay && <span className="seal-stamp text-[8px] py-0 px-1 mt-0.5">BẢN THÂN</span>}
                  </div>
                );
              })}
            </div>

            {/* Divider trang trí */}
            <div className="h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent mx-4" />

            {/* Chi (Branch) Row */}
            <div className="grid grid-cols-4 text-center border-b border-amber-900/08">
              {['hour', 'day', 'month', 'year'].map((pKey) => {
                const pillar = fp?.[pKey];
                if (!pillar) return <div key={pKey} />;
                const isDay = pKey === 'day';
                const branchMeta = BRANCH_MAP[pillar.branch] || {};
                return (
                  <div key={pKey} className={`py-3 px-1.5 flex flex-col items-center gap-1 ${
                    isDay ? 'bg-emerald-50/60 border-x border-emerald-300/40' : ''
                  }`}>
                    <ZodiacBadge branch={pillar.branch} size="md" showHanzi={true} />
                    <span className="text-[12px] font-bold text-stone-900 mt-0.5">{pillar.branch_vn}</span>
                    <span className="text-[9px] text-amber-800 font-semibold">
                      {branchMeta.animal} • {branchMeta.element}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Tàng Can Row */}
            <div className="grid grid-cols-4 text-center bg-[#FAF7F0]/60">
              {['hour', 'day', 'month', 'year'].map((pKey) => {
                const pillar = fp?.[pKey];
                if (!pillar) return <div key={pKey} />;
                const isDay = pKey === 'day';
                return (
                  <div key={pKey} className={`py-2.5 px-1 flex flex-col items-center gap-1 ${
                    isDay ? 'bg-emerald-50/40 border-x border-emerald-300/30' : ''
                  }`}>
                    <span className="text-[9px] text-stone-400 font-semibold uppercase tracking-wide">Tàng Can</span>
                    <div className="flex flex-col gap-0.5 w-full">
                      {pillar.hidden_details?.slice(0, 3).map((hd, hIdx) => (
                        <div key={hIdx} className="text-[9px] flex items-center justify-between bg-white/80 px-1.5 py-0.5 rounded border border-stone-200">
                          <span className="font-serif font-bold text-amber-900">{hd.stem}</span>
                          <span className="text-stone-500">{hd.vn_shishen}</span>
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
            {/* Day Master (Phiến Ngọc Giáp Mộc Cung Đình) */}
            <div className="bg-[#FFFEFA] border border-emerald-600/30 rounded-2xl p-4 shadow-sm space-y-2 oriental-card">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900 block flex items-center gap-1.5">
                  <span>🌿</span>
                  <span>Nhật Chủ: {dm?.vn} ({dm?.stem})</span>
                </span>
                <span className="seal-stamp text-[9px]">MỆNH MỘC</span>
              </div>
              <div className="flex items-center gap-3 pt-1">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-2xl font-serif font-bold text-emerald-900 shadow-inner">
                  {dm?.stem}
                </div>
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-900 text-sm">
                    {dm?.vn} Mộc ({dm?.yinyang}) • Cây Đại Thụ
                  </div>
                  <div className="text-[11px] text-slate-600">
                    Sinh tháng <strong>{dm?.born_in_month_vn}</strong> ({dm?.born_in_month}): {dm?.is_dangling ? '✨ Đắc Lệnh tháng (Vượng khí)' : 'Cần bồi đắp khí lực'}
                  </div>
                </div>
              </div>
            </div>

            {/* Five Elements count */}
            <div className="bg-[#FFFEFA] border border-amber-900/15 rounded-2xl p-4 shadow-sm space-y-2 oriental-card">
              <span className="text-xs font-bold text-slate-900 block">Phân Bổ Ngũ Hành (4 Can + 4 Chi)</span>
              <div className="grid grid-cols-5 gap-1.5 text-center pt-1">
                {[
                  { key: '木', label: 'Mộc', color: 'bg-emerald-50 text-emerald-800 border-emerald-300' },
                  { key: '火', label: 'Hỏa', color: 'bg-rose-50 text-rose-800 border-rose-300' },
                  { key: '土', label: 'Thổ', color: 'bg-amber-50 text-amber-900 border-amber-300' },
                  { key: '金', label: 'Kim', color: 'bg-slate-100 text-slate-800 border-slate-300' },
                  { key: '水', label: 'Thủy', color: 'bg-sky-50 text-sky-800 border-sky-300' },
                ].map((elem) => (
                  <div key={elem.key} className={`p-1.5 rounded-xl border ${elem.color} shadow-xs`}>
                    <span className="text-[10px] font-medium block">{elem.label}</span>
                    <span className="text-base font-bold block">{wuxingCounts[elem.key] || 0}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Branch Interactions */}
          {interactions && (
            <div className="bg-[#FFFEFA] border border-amber-900/15 rounded-2xl p-4 shadow-sm space-y-2 text-xs oriental-card">
              <span className="text-xs font-bold text-sky-900 block">Tương Tác Địa Chi</span>
              <div className="space-y-1">
                {interactions.liu_chong?.length > 0 && (
                  <div className="text-rose-800 font-medium">
                    ⚠️ <strong>Lục xung:</strong> {interactions.liu_chong.map((x) => x.name).join(', ')}
                  </div>
                )}
                {interactions.liu_he?.length > 0 && (
                  <div className="text-emerald-800 font-medium">
                    ✨ <strong>Lục hợp:</strong> {interactions.liu_he.map((x) => x.name).join(', ')}
                  </div>
                )}
                {interactions.san_he?.length > 0 && (
                  <div className="text-amber-900 font-medium">
                    🌟 <strong>Tam hợp / Bán hợp:</strong> {interactions.san_he.map((x) => x.name).join(', ')}
                  </div>
                )}
                {interactions.san_xing?.length > 0 && (
                  <div className="text-orange-900 font-medium">
                    ⚡ <strong>Tam hình:</strong> {interactions.san_xing.map((x) => x.name).join(', ')}
                  </div>
                )}
                {interactions.zi_xing?.length > 0 && (
                  <div className="text-purple-900 font-medium">
                    🌀 <strong>Tự hình:</strong> {interactions.zi_xing.map((x) => x.name).join(', ')}
                  </div>
                )}
                {Object.values(interactions).every((arr) => !arr || arr.length === 0) && (
                  <div className="text-slate-600">Không có xung hình hợp cực đoan trong nguyên cục, khí thế ổn định.</div>
                )}
              </div>
            </div>
          )}

          {/* DaYun Pillars (Đại Vận) */}
          {dayun && dayun.pillars && (
            <div className="bg-[#FFFEFA] border border-amber-900/15 rounded-2xl p-4 shadow-sm space-y-2.5 oriental-card">
              <div className="flex items-center justify-between border-b border-amber-900/10 pb-2">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Chu Kỳ Đại Vận (10 Năm / Vận)</span>
                  <span className="text-[10px] text-slate-600">
                    Khởi vận: {dayun.start_age_display} ({dayun.direction_text})
                  </span>
                </div>
                {dayun.start_solar_date && (
                  <span className="text-[10px] text-amber-900 font-semibold">
                    Ngày khởi: {dayun.start_solar_date}
                  </span>
                )}
              </div>

              {/* DaYun Scrollable List */}
              <div className="flex gap-2 overflow-x-auto pb-2 pt-1">
                {dayun.pillars.map((dy) => (
                  <div
                    key={dy.index}
                    className="shrink-0 p-2.5 rounded-xl border border-amber-900/15 bg-[#FAF7F0] text-center w-20 flex flex-col justify-between shadow-xs hover:border-amber-600 transition"
                  >
                    <span className="text-[10px] text-slate-600 font-bold block">
                      {dy.start_age}-{dy.end_age}t
                    </span>
                    <div className="my-1">
                      <span className="text-base font-bold font-serif text-amber-900 block">
                        {dy.ganzhi}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-800 block">{dy.vn_ganzhi}</span>
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
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-100/80 via-emerald-100/70 to-amber-100/80 border border-amber-500/30 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <GitCompare className="w-4 h-4 text-amber-800" />
              <div>
                <span className="text-xs font-bold text-slate-900 block">Đối chiếu chéo với Tử Vi</span>
                <span className="text-[10px] text-slate-600 block">So sánh điểm tương đồng và bổ khuyết giữa 2 môn phái</span>
              </div>
            </div>
            <button
              onClick={() => setOpenCrossCheck(true)}
              className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition"
            >
              Xem Đối Chiếu
            </button>
          </div>

          {/* AI Interpretation Section */}
          <div className="bg-[#FFFEFA] border border-amber-900/15 rounded-2xl p-4 shadow-sm oriental-card">
            <div className="flex items-center justify-between mb-3 border-b border-amber-900/10 pb-2">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Luận Giải Tứ Trụ Bát Tự</span>
              </div>
              <button
                onClick={handleSave}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FAF7F0] hover:bg-amber-100 border border-amber-900/15 text-xs text-amber-950 transition font-medium"
              >
                {savedSuccess ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-bold">Đã lưu</span>
                  </>
                ) : (
                  <>
                    <BookmarkPlus className="w-3.5 h-3.5 text-amber-700" />
                    <span>Lưu lá số</span>
                  </>
                )}
              </button>
            </div>

            {interpreting ? (
              <div className="py-10 flex flex-col items-center gap-4">
                {/* Animated Seal */}
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 rounded-full border-4 border-amber-200 animate-spin" style={{borderTopColor: '#b45309', animationDuration: '1.5s'}} />
                  <div className="absolute inset-2 rounded-full border-2 border-emerald-200 animate-spin" style={{borderRightColor: '#059669', animationDuration: '2s', animationDirection: 'reverse'}} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl animate-pulse-subtle">☯</span>
                  </div>
                </div>
                {/* Steps */}
                <div className="space-y-2 text-center">
                  <p className="text-sm text-amber-900 font-bold">Bậc Thầy đang luận đoán lá số...</p>
                  <div className="flex flex-col gap-1.5 text-left">
                    {[
                      { icon: '🔥', text: 'Phân tích Nhật Chủ & Hỷ Dụng Thần', done: true },
                      { icon: '🗺️', text: 'Luận giải màu sắc, hướng & nghề nghiệp', done: true },
                      { icon: '📅', text: 'Đánh giá vận khí năm nay & 2 năm tới', done: false },
                      { icon: '✍️', text: 'Biên soạn Lời Thầy & Hồ Sơ Kỹ Thuật', done: false },
                    ].map((step, i) => (
                      <div key={i} className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg transition-all ${
                        step.done ? 'bg-emerald-50 text-emerald-900' : 'bg-amber-50 text-amber-800 animate-pulse-subtle'
                      }`}>
                        <span>{step.icon}</span>
                        <span className={step.done ? 'line-through opacity-60' : 'font-medium'}>{step.text}</span>
                        {step.done && <span className="ml-auto text-emerald-600">✓</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : interpretation ? (
              <InterpretationView interpretation={interpretation} title="Luận Giải Bát Tự" />
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
