/* Service Worker for AI Home Hub PWA – offline cache + push notifications */

const CACHE_NAME = 'ai-home-hub-v2';
const STATIC_ASSETS = [
  '/',
  '/style.css',
  '/app.js',
  '/manifest.json',
];

// API endpoints to cache for offline dashboard access
const CACHEABLE_API = [
  '/api/health',
  '/api/agent/status',
  '/api/health/setup',
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

/* Fetch: network-first for API (with offline fallback), cache-first for static */
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // WebSocket – always skip
  if (url.pathname.startsWith('/ws')) {
    return;
  }

  // Cacheable API endpoints: network-first with cache fallback
  if (CACHEABLE_API.some(path => url.pathname === path)) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Other API calls – always network
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // Static assets – stale-while-revalidate
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
