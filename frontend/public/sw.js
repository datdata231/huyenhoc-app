const CACHE_NAME = 'huyenhoc-cache-v9';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Network-first fetch strategy
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.status === 200 && (event.request.url.includes('/assets/') || event.request.url.includes('icon-'))) {
          const respClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, respClone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

// --- WEB PUSH NOTIFICATION LISTENER (8:00 AM & Real-time) ---
self.addEventListener('push', (event) => {
  let data = {
    title: 'Huyền Học Ngày Mới 🌿 (8:00 AM)',
    body: 'Vận trình & Bàn cờ Kỳ Môn hôm nay của bạn đã sẵn sàng. Chạm để xem chi tiết!',
    url: '/?src=notification_8am',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      data = Object.assign(data, parsed);
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/icon-192.png',
    badge: data.badge || '/icon-192.png',
    vibrate: [250, 100, 250, 100, 250],
    tag: 'daily-numerology-8am',
    renotify: true,
    data: {
      url: data.url || '/?src=push',
    },
    actions: [
      { action: 'open_app', title: '📖 Mở xem vận trình' },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click handling: Focus app or open window
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If user already has the app open, bring it to front
      for (let client of windowClients) {
        if (client.url.includes(self.registration.scope) && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
