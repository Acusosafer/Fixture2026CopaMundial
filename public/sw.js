/* eslint-disable no-undef */
'use strict';

// ── Install / Activate ───────────────────────────────────────────────────────

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// ── Fetch (pass-through — requerido para que Chrome muestre "Instalar app") ──

self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});

// ── Push event ───────────────────────────────────────────────────────────────

self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: 'Mundial 2026', body: event.data.text() };
  }

  const { title = 'Mundial 2026', body = '', tag, data } = payload;

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: tag ?? 'mundial-push',
      renotify: true,
      data: data ?? {},
    })
  );
});

// ── Notification click ────────────────────────────────────────────────────────

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = event.notification.data?.url ?? '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
