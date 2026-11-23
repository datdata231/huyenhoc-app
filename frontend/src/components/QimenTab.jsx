import React, { useState } from 'react';
import {
  Compass, Play, Clock, Sparkles, BookmarkPlus, ChevronDown, CheckCircle2,
  Calendar, MapPin, MessageSquare, ShieldAlert
} from 'lucide-react';
import WarningsBanner from './WarningsBanner';
import DisclaimerFooter from './DisclaimerFooter';
import InterpretationView from './InterpretationView';
import { calculateQimen, interpretQimen, saveHistory } from '../utils/api';
import {
  QIMEN_DOORS_MAP, QIMEN_STARS_MAP, QIMEN_GODS_MAP, STEM_MAP, BRANCH_MAP,
  translateDun, translateOriginYuan, formatGanzhiVn, translateStarVn,
  translateDoorVn, translateGodVn, translateDirectionVn, QIMEN_PALACE_VN
} from '../utils/vietnamese_terms';

export default function QimenTab({ activeProfile, theme }) {
  // Form state
  const [questionType, setQuestionType] = useState('Sự nghiệp');
  const [customType, setCustomType] = useState('');
  const [questionGoal, setQuestionGoal] = useState('Có thành công / thuận lợi hay không');
  const [customGoal, setCustomGoal] = useState('');
  const [timeMode, setTimeMode] = useState('now'); // 'now' or 'custom'
  const [customTime, setCustomTime] = useState(() => {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
  });
  const [city, setCity] = useState(activeProfile?.city || 'Ho Chi Minh City');
  const [timezone, setTimezone] = useState(activeProfile?.timezone || 'Asia/Ho_Chi_Minh');
  const [outputStyle, setOutputStyle] = useState('detailed');

  // Romance gender state
  const [userGender, setUserGender] = useState('男');
  const [targetGender, setTargetGender] = useState('女');

  // Execution & result state
  const [loading, setLoading] = useState(false);
  const [interpreting, setInterpreting] = useState(false);
  const [error, setError] = useState(null);
  const [calcResult, setCalcResult] = useState(null);
  const [interpretation, setInterpretation] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Palaces in 3x3 layout (Nine Palaces standard: 4-9-2, 3-5-7, 8-1-6)
  const gridOrder = [4, 9, 2, 3, 5, 7, 8, 1, 6];

  const handleCalculate = async () => {
    setError(null);
    setInterpretation('');
    setSavedSuccess(false);

    const type = questionType === 'Khác' ? customType : questionType;
    const goal = questionGoal === 'Khác' ? customGoal : questionGoal;

    if (!type.trim()) {
      setError('Vui lòng chọn hoặc nhập việc muốn xem.');
      return;
    }
    if (!goal.trim()) {
      setError('Vui lòng chọn hoặc nhập mục tiêu cụ thể cần phán đoán.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        question_type: type,
        question_goal: goal,
        calendar_type: timeMode === 'now' ? 'now' : 'solar',
        time_input: timeMode === 'now' ? '' : customTime,
        location: {
          country: 'Vietnam',
          city: city,
          timezone: timezone,
        },
        ruleset: 'mainline-cn-v1',
        output_style: outputStyle,
        user_gender: type === 'Tình cảm' ? userGender : undefined,
        target_gender: type === 'Tình cảm' ? targetGender : undefined,
      };

      const result = await calculateQimen(payload);
      setCalcResult(result);

      // Auto trigger AI interpretation
      setInterpreting(true);
      try {
        const aiRes = await interpretQimen(result, payload, activeProfile?.name || 'Đương số');
        setInterpretation(aiRes.interpretation);
      } catch (aiErr) {
        console.warn('AI Interpretation error:', aiErr);
        setError('Đã lập bàn thành công. Bạn có thể xem toàn bộ đồ hình và bài phân tích quy chuẩn bên dưới.');
      } finally {
        setInterpreting(false);
      }
    } catch (err) {
      setError(err.message || 'Lỗi khi khởi bàn Kỳ Môn');
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
        system: 'qimen',
        title: `Kỳ Môn: ${calcResult.normalized_input?.question_type} - ${calcResult.normalized_input?.question_goal}`,
        query_summary: `Thời gian: ${calcResult.calendar?.solar?.ymd_hms} • ${translateDun(calcResult.chart?.dun_type)} ${calcResult.chart?.ju_number} cục`,
        chart_data: calcResult,
        interpretation: interpretation,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (e) {
      alert('Không thể lưu vào lịch sử: ' + e.message);
    }
  };

  const getPalace = (num) => {
    if (!calcResult?.chart?.palaces) return null;
    return calcResult.chart.palaces.find((p) => p.palace === num);
  };

  // Helper to format stem display in VN
  const formatStemDisplay = (stemStr) => {
    if (!stemStr) return '—';
    return stemStr
      .split('+')
      .map((s) => STEM_MAP[s]?.vn || s)
      .join('+');
  };

  return (
    <div className="space-y-5 pb-8">
      {/* Intro Card */}
      <div className="oriental-card rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-2.5 text-emerald-800 font-bold text-sm mb-1">
          <Compass className="w-4 h-4 text-emerald-700" />
          <span>Kỳ Môn Hôm Nay (Thời Gia Chuyển Bàn)</span>
        </div>
        <p className="text-xs text-stone-600 leading-relaxed">
          Xem sự việc cấp bách, trạch cát giờ lành xuất hành, đàm phán, chọn phương vị cát lợi theo quy chuẩn cổ điển Mainline-CN-V1.
        </p>
      </div>

      {/* Structured Interview Form */}
      <div className="oriental-card rounded-2xl p-4 space-y-3.5 shadow-sm text-stone-800">
        <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
          1. Thông tin việc cần xem
        </h3>

        {/* Question Type */}
        <div>
          <label className="block text-xs text-stone-700 font-medium mb-1">
            Việc muốn xem là gì? *
          </label>
          <div className="grid grid-cols-3 gap-2 text-xs">
            {['Sự nghiệp', 'Tài vận', 'Tình cảm', 'Xuất hành', 'Học tập', 'Khác'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setQuestionType(t)}
                className={`py-2 px-2.5 rounded-xl border text-center font-medium transition ${
                  questionType === t
                    ? 'bg-amber-100 border-amber-600 text-amber-950 font-bold shadow-sm'
                    : 'bg-[#FAF7F0] border-stone-300 text-stone-700 hover:border-amber-700/50'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          {questionType === 'Khác' && (
            <input
              type="text"
              value={customType}
              onChange={(e) => setCustomType(e.target.value)}
              placeholder="Nhập việc cụ thể (ví dụ: đòi nợ, mua nhà...)"
              className="mt-2 w-full bg-[#FAF7F0] border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-none focus:border-amber-600"
            />
          )}
        </div>

        {/* If Love, prompt genders */}
        {questionType === 'Tình cảm' && (
          <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl space-y-2 text-stone-800">
            <span className="text-xs text-rose-900 font-bold block">
              Xác định giới tính 2 bên:
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[11px] text-stone-600 block mb-1">Giới tính của bạn:</label>
                <select
                  value={userGender}
                  onChange={(e) => setUserGender(e.target.value)}
                  className="w-full bg-[#FAF7F0] border border-stone-300 rounded-lg p-1.5 text-xs text-stone-800"
                >
                  <option value="男">Nam ♂</option>
                  <option value="女">Nữ ♀</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] text-stone-600 block mb-1">Giới tính đối phương:</label>
                <select
                  value={targetGender}
                  onChange={(e) => setTargetGender(e.target.value)}
                  className="w-full bg-[#FAF7F0] border border-stone-300 rounded-lg p-1.5 text-xs text-stone-800"
                >
                  <option value="女">Nữ ♀</option>
                  <option value="男">Nam ♂</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Question Goal */}
        <div>
          <label className="block text-xs text-stone-700 font-medium mb-1">
            Mục tiêu phán đoán cụ thể: *
          </label>
          <select
            value={questionGoal}
            onChange={(e) => setQuestionGoal(e.target.value)}
            className="w-full bg-[#FAF7F0] border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-none focus:border-amber-600"
          >
            <option value="Có thành công / thuận lợi hay không">Có thành công / thuận lợi hay không</option>
            <option value="Nên hành động vào thời điểm nào cát lợi">Nên hành động vào thời điểm nào cát lợi</option>
            <option value="Chọn phương vị / phương án nào có lợi nhất">Chọn phương vị / phương án nào có lợi nhất</option>
            <option value="Cần phòng tránh cạm bẫy / đối tượng nào">Cần phòng tránh cạm bẫy / đối tượng nào</option>
            <option value="Khác">Khác (tự nhập)</option>
          </select>
          {questionGoal === 'Khác' && (
            <input
              type="text"
              value={customGoal}
              onChange={(e) => setCustomGoal(e.target.value)}
              placeholder="Nhập mục tiêu cụ thể..."
              className="mt-2 w-full bg-[#FAF7F0] border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-none focus:border-amber-600"
            />
          )}
        </div>

        {/* Time input */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs text-stone-700 font-medium">Thời điểm khởi bàn *</label>
            <div className="flex items-center gap-1 text-[11px]">
              <button
                type="button"
                onClick={() => setTimeMode('now')}
                className={`px-2 py-0.5 rounded-md ${
                  timeMode === 'now' ? 'bg-emerald-700 text-white font-bold' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Ngay bây giờ
              </button>
              <button
                type="button"
                onClick={() => setTimeMode('custom')}
                className={`px-2 py-0.5 rounded-md ${
                  timeMode === 'custom' ? 'bg-amber-600 text-white font-bold' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Chọn giờ
              </button>
            </div>
          </div>

          {timeMode === 'custom' ? (
            <input
              type="text"
              value={customTime}
              onChange={(e) => setCustomTime(e.target.value)}
              placeholder="YYYY-MM-DD HH:MM"
              className="w-full bg-[#FAF7F0] border border-stone-300 rounded-xl px-3 py-2 text-xs font-mono text-stone-800"
            />
          ) : (
            <div className="p-2 rounded-xl bg-[#FAF7F0] border border-stone-200 text-xs text-stone-600 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-emerald-700" />
              <span>Khởi bàn ngay tại thời điểm tâm niệm phát khởi</span>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          onClick={handleCalculate}
          disabled={loading}
          className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition ${theme?.primaryButton || 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-md'}`}
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Đang tính toán bàn Kỳ Môn...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" />
              <span>Khởi Bàn Kỳ Môn Ngay</span>
            </>
          )}
        </button>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-800 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Calculation Output & 9 Palaces */}
      {calcResult && (
        <div className="space-y-4 animate-in fade-in duration-300">
          {/* Warnings Banner in Vietnamese */}
          <WarningsBanner
            warnings={calcResult.warnings}
            patterns={calcResult.chart?.detected_patterns}
          />

          {/* Quick Stats Pill Header in Vietnamese */}
          <div className="bg-[#FFFEFC] border border-amber-900/15 rounded-2xl p-4 shadow-sm text-stone-800">
            <div className="flex items-center justify-between mb-3 border-b border-stone-200 pb-2">
              <span className="text-xs font-bold text-stone-800">
                Bàn Cờ: {translateDun(calcResult.chart?.dun_type)} • {translateOriginYuan(calcResult.chart?.yuan)} (Cục {calcResult.chart?.ju_number})
              </span>
              <span className="text-[11px] text-amber-800 font-mono font-bold">
                {calcResult.calendar?.solar?.ymd_hms}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2 rounded-xl bg-[#FAF7F0] border border-stone-200">
                <span className="text-[10px] text-stone-500 block">Tứ Trụ Can Chi</span>
                <span className="font-semibold text-stone-800 text-[11px]">
                  {formatGanzhiVn(`${calcResult.ganzhi?.year} ${calcResult.ganzhi?.month} ${calcResult.ganzhi?.day} ${calcResult.ganzhi?.time}`)}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-[#FAF7F0] border border-stone-200">
                <span className="text-[10px] text-stone-500 block">Tuần Thủ (Ẩn Can)</span>
                <span className="font-semibold text-amber-900">
                  {STEM_MAP[calcResult.chart?.xunshou?.[0]]?.vn || ''} {BRANCH_MAP[calcResult.chart?.xunshou?.[1]]?.vn || ''} ({STEM_MAP[calcResult.chart?.hidden_yi]?.vn || calcResult.chart?.hidden_yi})
                </span>
              </div>
              <div className="p-2 rounded-xl bg-[#FAF7F0] border border-stone-200">
                <span className="text-[10px] text-stone-500 block">Trực Phù (Sao)</span>
                <span className="font-semibold text-sky-900">
                  {translateStarVn(calcResult.chart?.zhifu?.star)} (Cung {calcResult.chart?.zhifu?.palace})
                </span>
              </div>
              <div className="p-2 rounded-xl bg-[#FAF7F0] border border-stone-200">
                <span className="text-[10px] text-stone-500 block">Trực Sử (Cửa)</span>
                <span className="font-semibold text-emerald-900">
                  {translateDoorVn(calcResult.chart?.zhishi?.door)} (Cung {calcResult.chart?.zhishi?.palace})
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-2.5 text-[11px] text-stone-600">
              <span className="px-2 py-0.5 rounded bg-stone-100 border border-stone-200 text-stone-700">
                Tuần Không: {calcResult.chart?.kongwang?.map((b) => BRANCH_MAP[b]?.vn || b).join(', ')} (Cung {calcResult.chart?.kongwang_palaces?.join(', ')})
              </span>
              <span className="px-2 py-0.5 rounded bg-stone-100 border border-stone-200 text-stone-700">
                Dịch Mã: {BRANCH_MAP[calcResult.chart?.hour_yima?.branch]?.vn || calcResult.chart?.hour_yima?.branch} (Cung {calcResult.chart?.hour_yima?.palace})
              </span>
            </div>
          </div>

          {/* 3x3 Nine Palaces Grid */}
          <div className="bg-[#FFFEFC] border border-amber-900/15 rounded-2xl p-3 shadow-md">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-xs font-bold text-stone-800">Đồ Hình Cửu Cung (Lạc Thư)</span>
              <span className="text-[10px] text-stone-500">Nam trên — Bắc dưới</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {gridOrder.map((palaceNum) => {
                const p = getPalace(palaceNum);
                if (!p) return null;
                const isCenter = palaceNum === 5;
                const doorInfo = p.door ? QIMEN_DOORS_MAP[p.door] : null;
                const starInfo = p.star ? QIMEN_STARS_MAP[p.star] : null;
                const isKongwang = calcResult.chart?.kongwang_palaces?.includes(palaceNum);
                const isZhifu = calcResult.chart?.zhifu?.palace === palaceNum;
                const isZhishi = calcResult.chart?.zhishi?.palace === palaceNum;

                const palaceVnName = {
                  1: 'Khảm (1)', 2: 'Khôn (2)', 3: 'Chấn (3)', 4: 'Tốn (4)',
                  5: 'Trung Cung (5)', 6: 'Càn (6)', 7: 'Đoài (7)', 8: 'Cấn (8)', 9: 'Ly (9)'
                }[palaceNum];

                const directionVn = translateDirectionVn(p.direction);
                const godVn = QIMEN_GODS_MAP[p.god]?.vn || p.god;
                const starVn = QIMEN_STARS_MAP[p.star]?.vn || p.star;
                const hostedStarVn = p.hosted_star ? (QIMEN_STARS_MAP[p.hosted_star]?.vn || p.hosted_star) : null;
                const doorVn = doorInfo?.vn || p.door;

                return (
                  <div
                    key={palaceNum}
                    className={`p-2 rounded-xl border relative flex flex-col justify-between min-h-[120px] transition ${
                      isCenter
                        ? 'bg-[#F5F2EB] border-stone-300 text-stone-600'
                        : isKongwang
                        ? 'bg-purple-50/90 border-purple-300 shadow-xs'
                        : isZhifu
                        ? 'bg-sky-50/90 border-sky-400 shadow-xs'
                        : isZhishi
                        ? 'bg-emerald-50/90 border-emerald-400 shadow-xs'
                        : 'bg-[#FAF7F0] border-stone-300/80 shadow-xs'
                    }`}
                  >
                    {/* Corner badge: Palace Name & Direction */}
                    <div className="flex items-center justify-between text-[10px] text-stone-600">
                      <span className="font-bold text-stone-800">
                        {palaceVnName}
                      </span>
                      <span>{directionVn}</span>
                    </div>

                    {isCenter ? (
                      <div className="text-center my-auto py-2">
                        <span className="text-xs font-semibold text-stone-600 block">Trung Cung</span>
                        <span className="text-[10px] text-stone-500">Ký Khôn Nhị Cung (2)</span>
                      </div>
                    ) : (
                      <div className="my-1 space-y-1">
                        {/* God & Star */}
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-purple-900 font-semibold">
                            {godVn || '—'}
                          </span>
                          <span className="text-amber-900 font-semibold text-[10px]">
                            {starVn || '—'}
                            {hostedStarVn ? `+${hostedStarVn}` : ''}
                          </span>
                        </div>

                        {/* Door */}
                        <div className="text-center py-0.5">
                          {p.door ? (
                            <span
                              className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                                doorInfo?.nature?.includes('Cát')
                                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-400'
                                  : doorInfo?.nature?.includes('Hung')
                                  ? 'bg-rose-100 text-rose-900 border border-rose-400'
                                  : 'bg-stone-100 text-stone-800 border border-stone-300'
                              }`}
                            >
                              {doorVn}
                            </span>
                          ) : (
                            <span className="text-xs text-stone-400">—</span>
                          )}
                        </div>

                        {/* Heavenly Stem & Earthly Stem in Vietnamese */}
                        <div className="flex items-center justify-between text-[11px] pt-1 border-t border-stone-200">
                          <span className="text-sky-900 font-bold" title="Thiên Bàn Can">
                            {formatStemDisplay(p.sky_stems?.join('+') || p.sky_stem)}
                          </span>
                          <span className="text-amber-950 font-bold" title="Địa Bàn Can">
                            {formatStemDisplay(p.earth_stem)}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Bottom Status Tags */}
                    <div className="flex items-center justify-between text-[9px] pt-0.5">
                      {isZhifu && <span className="text-sky-800 font-bold">Trực Phù</span>}
                      {isZhishi && <span className="text-emerald-800 font-bold">Trực Sử</span>}
                      {isKongwang && <span className="text-purple-800 font-bold">Không Vong</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Interpretation Section */}
          <div className="bg-[#FFFEFC] border border-amber-900/15 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3 border-b border-amber-900/15 pb-2">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                <Sparkles className="w-4 h-4 text-amber-700" />
                <span>Luận Giải Kỳ Môn (7 Mục Chuẩn Tiếng Việt)</span>
              </div>
              <button
                onClick={handleSave}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FAF7F0] hover:bg-[#F3EFE6] border border-stone-300 text-xs text-stone-700 transition"
              >
                {savedSuccess ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-medium">Đã lưu</span>
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
              <div className="py-8 text-center space-y-2">
                <div className="w-6 h-6 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-amber-900 font-semibold">Bậc Thầy đang tham chiếu Dụng Thần & soạn bài giải bằng tiếng Việt...</p>
                <p className="text-[11px] text-stone-600">Đang chuẩn bị cả Lời Khuyên Hành Động Thực Tế và Hồ Sơ Kỹ Thuật...</p>
              </div>
            ) : interpretation ? (
              <InterpretationView interpretation={interpretation} title="Luận Giải Kỳ Môn" />
            ) : (
              <div className="text-center py-6 text-stone-400 text-xs">
                Chưa có bài luận giải. Bấm nút phía trên để bắt đầu khởi bàn.
              </div>
            )}
          </div>

          {/* Standard Disclaimer Footer */}
          <DisclaimerFooter system="qimen" />
        </div>
      )}
    </div>
  );
}
