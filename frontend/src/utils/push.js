/**
 * Web Push Notification Utilities for PWA and Mobile Browsers.
 */

export function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function isPushNotificationSupported() {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

export async function getExistingSubscription() {
  if (!isPushNotificationSupported()) return null;
  try {
    const registration = await navigator.serviceWorker.ready;
    return await registration.pushManager.getSubscription();
  } catch (err) {
    console.warn('Error checking existing subscription:', err);
    return null;
  }
}

export async function subscribeUserTo8amPush(profileId = '') {
  if (!isPushNotificationSupported()) {
    throw new Error('Trình duyệt hiện tại không hỗ trợ Web Push Notification.');
  }

  // 1. Request permission
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error('Bạn cần bấm "Cho phép" (Allow) quyền nhận thông báo trên trình duyệt.');
  }

  // 2. Fetch VAPID public key from backend
  const keyRes = await fetch('/api/push/vapid-public-key');
  if (!keyRes.ok) {
    throw new Error('Không thể lấy mã bảo mật VAPID từ máy chủ.');
  }
  const keyData = await keyRes.json();
  const publicKey = keyData.publicKey;

  // 3. Register push subscription with browser service worker
  const registration = await navigator.serviceWorker.ready;
  const convertedKey = urlBase64ToUint8Array(publicKey);

  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedKey,
    });
  }

  // 4. Send subscription data to backend SQLite database
  const subJSON = subscription.toJSON();
  const postRes = await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      endpoint: subJSON.endpoint,
      p256dh: subJSON.keys?.p256dh,
      auth: subJSON.keys?.auth,
      profile_id: profileId,
    }),
  });

  if (!postRes.ok) {
    const errText = await postRes.text();
    throw new Error('Lưu đăng ký vào máy chủ thất bại: ' + errText);
  }

  return subscription;
}

export async function sendInstantTestNotification() {
  const subscription = await getExistingSubscription();
  if (!subscription) {
    throw new Error('Thiết bị chưa bật thông báo. Vui lòng bấm Bật thông báo trước.');
  }

  const subJSON = subscription.toJSON();
  const res = await fetch('/api/push/test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      endpoint: subJSON.endpoint,
      p256dh: subJSON.keys?.p256dh,
      auth: subJSON.keys?.auth,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Lỗi gửi tin' }));
    throw new Error(err.detail || 'Không thể gửi thông báo thử nghiệm');
  }

  return await res.json();
}
