import React, { useState } from 'react';
import { X, UserPlus, Check, Trash2, Edit2, User, Sparkles } from 'lucide-react';

export default function ProfileModal({
  isOpen,
  onClose,
  profiles = [],
  activeProfile,
  onSelectProfile,
  onSaveProfile,
  onDeleteProfile,
}) {
  const [editingId, setEditingId] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const initialForm = {
    name: '',
    gender: '男',
    calendar_type: 'solar',
    birth_time: '1995-10-10 14:30',
    is_leap_month: false,
    city: 'Ho Chi Minh City',
    timezone: 'Asia/Ho_Chi_Minh',
    late_zi_rule: 'same_day',
    leap_month_rule: 'split_15',
    notes: '',
  };

  const [formData, setFormData] = useState(initialForm);

  if (!isOpen) return null;

  const handleStartCreate = () => {
    setFormData(initialForm);
    setEditingId(null);
    setIsCreating(true);
  };

  const handleStartEdit = (p) => {
    setFormData({
      name: p.name,
      gender: p.gender,
      calendar_type: p.calendar_type,
      birth_time: p.birth_time.replace('T', ' ').slice(0, 16),
      is_leap_month: p.is_leap_month || false,
      city: p.city || 'Ho Chi Minh City',
      timezone: p.timezone || 'Asia/Ho_Chi_Minh',
      late_zi_rule: p.late_zi_rule || 'same_day',
      leap_month_rule: p.leap_month_rule || 'split_15',
      notes: p.notes || '',
    });
    setEditingId(p.id);
    setIsCreating(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSaveProfile(formData, editingId);
    setIsCreating(false);
    setEditingId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#FFFDF9] border border-amber-900/20 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-6 text-stone-800">
        {/* Header */}
        <div className="px-5 py-4 border-b border-amber-900/15 flex items-center justify-between bg-[#FAF7F0]">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-amber-700" />
            <h2 className="text-base font-bold text-stone-800">
              Quản lý Hồ sơ (Tôi & Bạn bè)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-[#F3EFE6] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 max-h-[75vh] overflow-y-auto">
          {/* List existing profiles if not in editing mode */}
          {!isCreating && !editingId && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-stone-600">Chọn hồ sơ để xem hoặc thêm mới:</span>
                <button
                  onClick={handleStartCreate}
                  className="inline-flex items-center gap-1.5 text-xs bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-semibold px-3 py-1.5 rounded-xl transition shadow"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Thêm Hồ Sơ Mới</span>
                </button>
              </div>

              <div className="grid gap-2.5">
                {profiles.length === 0 ? (
                  <div className="text-center py-8 text-stone-500 text-sm">
                    Chưa có hồ sơ nào. Bấm nút phía trên để tạo hồ sơ đầu tiên!
                  </div>
                ) : (
                  profiles.map((p) => {
                    const isActive = activeProfile && activeProfile.id === p.id;
                    return (
                      <div
                        key={p.id}
                        className={`p-3.5 rounded-xl border transition flex items-center justify-between ${
                          isActive
                            ? 'bg-[#F4FAF6] border-[#059669]/60 shadow-sm'
                            : 'bg-[#FFFEFC] border-stone-200 hover:border-amber-700/40'
                        }`}
                      >
                        <div
                          className="flex-1 cursor-pointer"
                          onClick={() => {
                            onSelectProfile(p);
                            onClose();
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-stone-800 text-sm">{p.name}</span>
                            <span className="text-[11px] px-1.5 py-0.5 rounded bg-[#FAF7F0] text-stone-700 border border-stone-300 font-medium">
                              {p.gender === '男' ? 'Nam ♂' : 'Nữ ♀'}
                            </span>
                            {isActive && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#059669] text-white font-bold">
                                Đang chọn
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-stone-600 mt-1">
                            {p.calendar_type === 'lunar' ? 'Âm lịch: ' : 'Dương lịch: '}
                            <span className="text-stone-800 font-mono font-medium">{p.birth_time}</span>
                            {p.city ? ` • ${p.city}` : ''}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 ml-2">
                          <button
                            onClick={() => handleStartEdit(p)}
                            className="p-1.5 rounded-lg text-stone-500 hover:text-amber-800 hover:bg-[#F3EFE6]"
                            title="Sửa hồ sơ"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Bạn có chắc muốn xóa hồ sơ "${p.name}"?`)) {
                                onDeleteProfile(p.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50"
                            title="Xóa hồ sơ"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Form for Create / Edit */}
          {(isCreating || editingId) && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                <span className="text-sm font-bold text-amber-900">
                  {editingId ? 'Chỉnh sửa hồ sơ' : 'Thêm hồ sơ mới'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingId(null);
                  }}
                  className="text-xs text-stone-500 hover:text-stone-800 font-medium"
                >
                  Quay lại danh sách
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Họ và tên / Biệt danh *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ví dụ: Trần Đạt, Minh Anh..."
                  className="w-full bg-[#FAF7F0] border border-stone-300 rounded-xl px-3 py-2 text-sm text-stone-800 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Giới tính *</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full bg-[#FAF7F0] border border-stone-300 rounded-xl px-3 py-2 text-sm text-stone-800 focus:outline-none focus:border-amber-600"
                  >
                    <option value="男">Nam (男)</option>
                    <option value="女">Nữ (女)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Loại lịch *</label>
                  <select
                    value={formData.calendar_type}
                    onChange={(e) => setFormData({ ...formData, calendar_type: e.target.value })}
                    className="w-full bg-[#FAF7F0] border border-stone-300 rounded-xl px-3 py-2 text-sm text-stone-800 focus:outline-none focus:border-amber-600"
                  >
                    <option value="solar">Dương lịch (Solar)</option>
                    <option value="lunar">Âm lịch (Lunar)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Ngày và giờ sinh (đến phút) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.birth_time}
                  onChange={(e) => setFormData({ ...formData, birth_time: e.target.value })}
                  placeholder="YYYY-MM-DD HH:MM (Ví dụ: 1995-10-10 14:30)"
                  className="w-full bg-[#FAF7F0] border border-stone-300 rounded-xl px-3 py-2 text-sm text-stone-800 font-mono focus:outline-none focus:border-amber-600"
                />
                <span className="text-[10px] text-stone-500 mt-1 block">
                  Định dạng: Năm-Tháng-Ngày Giờ:Phút (24h)
                </span>
              </div>

              {formData.calendar_type === 'lunar' && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#FAF7F0] border border-stone-300">
                  <input
                    type="checkbox"
                    id="leap_month"
                    checked={formData.is_leap_month}
                    onChange={(e) => setFormData({ ...formData, is_leap_month: e.target.checked })}
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <label htmlFor="leap_month" className="text-xs text-stone-700 cursor-pointer">
                    Sinh vào Tháng Nhuận âm lịch
                  </label>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Thành phố sinh</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-[#FAF7F0] border border-stone-300 rounded-xl px-3 py-2 text-sm text-stone-800 focus:outline-none focus:border-amber-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Múi giờ</label>
                  <input
                    type="text"
                    value={formData.timezone}
                    onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                    className="w-full bg-[#FAF7F0] border border-stone-300 rounded-xl px-3 py-2 text-sm text-stone-800 focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              {/* Advanced Settings Accordion */}
              <div className="pt-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-xs text-amber-800 flex items-center gap-1 font-semibold hover:underline"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                  <span>{showAdvanced ? 'Ẩn cài đặt khẩu quyết nâng cao' : 'Hiện cài đặt khẩu quyết nâng cao'}</span>
                </button>

                {showAdvanced && (
                  <div className="mt-3 space-y-3 p-3 bg-[#FAF7F0] border border-stone-300 rounded-xl text-xs">
                    <div>
                      <label className="block text-stone-700 mb-1 font-medium">
                        Quy tắc giờ Dạ Tý (23:00 - 00:00)
                      </label>
                      <select
                        value={formData.late_zi_rule}
                        onChange={(e) => setFormData({ ...formData, late_zi_rule: e.target.value })}
                        className="w-full bg-white border border-stone-300 rounded-lg p-2 text-stone-800"
                      >
                        <option value="same_day">same_day (Thuộc ngày cũ - chuẩn Bát Tự)</option>
                        <option value="next_day">next_day (Sang ngày mới - chuẩn Tử Vi Tam Hợp)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-stone-700 mb-1 font-medium">
                        Quy tắc tháng nhuận (cho Tử Vi)
                      </label>
                      <select
                        value={formData.leap_month_rule}
                        onChange={(e) => setFormData({ ...formData, leap_month_rule: e.target.value })}
                        className="w-full bg-white border border-stone-300 rounded-lg p-2 text-stone-800"
                      >
                        <option value="split_15">split_15 (1-15 tính tháng này, 16+ tính tháng sau)</option>
                        <option value="current">current (Tính trọn vẹn theo tháng này)</option>
                        <option value="next">next (Tính trọn vẹn theo tháng sau)</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingId(null);
                  }}
                  className="flex-1 py-2 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs font-bold shadow"
                >
                  {editingId ? 'Lưu Thay Đổi' : 'Tạo Hồ Sơ'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
