/**
 * API client for Numerology backend.
 */

const API_BASE = '/api';

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}

// Profiles API
export async function fetchProfiles() {
  const res = await fetch(`${API_BASE}/profiles`);
  if (!res.ok) throw new Error('Không thể tải danh sách hồ sơ');
  return res.json();
}

export async function createProfile(data) {
  const res = await fetch(`${API_BASE}/profiles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Không thể tạo hồ sơ');
  }
  return res.json();
}

export async function updateProfile(id, data) {
  const res = await fetch(`${API_BASE}/profiles/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Không thể cập nhật hồ sơ');
  }
  return res.json();
}

export async function deleteProfile(id) {
  const res = await fetch(`${API_BASE}/profiles/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Không thể xóa hồ sơ');
  return res.json();
}

// Calculations API
export async function calculateQimen(req) {
  const res = await fetch(`${API_BASE}/calc/qimen`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Lỗi tính toán Kỳ Môn');
  }
  return res.json();
}

export async function calculateZiwei(req) {
  const res = await fetch(`${API_BASE}/calc/ziwei`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Lỗi tính toán Tử Vi');
  }
  return res.json();
}

export async function calculateBazi(req) {
  const res = await fetch(`${API_BASE}/calc/bazi`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Lỗi tính toán Bát Tự');
  }
  return res.json();
}

// Interpretation API
export async function interpretQimen(calcResult, query, profileName = 'Đương số') {
  const res = await fetch(`${API_BASE}/interpret/qimen`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      calculation_result: calcResult,
      user_query: query,
      profile_name: profileName,
    }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Lỗi khi luận giải Kỳ Môn');
  }
  return res.json();
}

export async function interpretZiwei(calcResult, query, focusTopic = 'Tổng quan') {
  const res = await fetch(`${API_BASE}/interpret/ziwei`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      calculation_result: calcResult,
      user_query: query,
      focus_topic: focusTopic,
    }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Lỗi khi luận giải Tử Vi');
  }
  return res.json();
}

export async function interpretBazi(calcResult, query, focusTopic = 'Tổng quan') {
  const res = await fetch(`${API_BASE}/interpret/bazi`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      calculation_result: calcResult,
      user_query: query,
      focus_topic: focusTopic,
    }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Lỗi khi luận giải Bát Tự');
  }
  return res.json();
}

export async function interpretCrossCheck(baziData, ziweiData, profileName, topic) {
  const res = await fetch(`${API_BASE}/interpret/cross-check`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      bazi_data: baziData,
      ziwei_data: ziweiData,
      profile_name: profileName,
      focus_topic: topic,
    }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Lỗi khi đối chiếu chéo');
  }
  return res.json();
}

// History API
export async function fetchHistory() {
  const res = await fetch(`${API_BASE}/history`);
  if (!res.ok) throw new Error('Không thể tải lịch sử');
  return res.json();
}

export async function saveHistory(item) {
  const res = await fetch(`${API_BASE}/history`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
  if (!res.ok) throw new Error('Không thể lưu vào lịch sử');
  return res.json();
}

export async function deleteHistory(id) {
  const res = await fetch(`${API_BASE}/history/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Không thể xóa mục lịch sử');
  return res.json();
}
