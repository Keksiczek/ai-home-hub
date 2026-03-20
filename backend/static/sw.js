/* Service Worker for AI Home Hub PWA – offline cache + push notifications */

const CACHE_NAME = 'ai-home-hub-v1';
const STATIC_ASSETS = [
  '/',
  '/style.css',
  '/app.js',
  '/manifest.json',
];

/* Install: pre-cache static assets */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

/* Activate: clean up old caches */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

/* Fetch: network-first for API, cache-first for static */
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // API calls and WebSocket – always network
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/ws')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      const networkFetch = fetch(event.request).then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => cached);
      return cached || networkFetch;
    })
  );
});

/* Push notifications for job events */
self.addEventListener('push', event => {
  let data = { title: 'AI Home Hub', body: 'Job update' };
  try {
    data = event.data.json();
  } catch (e) {
    data.body = event.data ? event.data.text() : 'New notification';
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'AI Home Hub', {
      body: `${data.status || ''}: ${data.output_summary || data.body || ''}`.trim(),
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: data.job_id || 'general',
      data: data,
    })
  );
});

/* Notification click: open the app */
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then(clients => {
      if (clients.length > 0) {
        return clients[0].focus();
      }
      return self.clients.openWindow('/');
    })
  );
});
