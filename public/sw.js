/**
 * Phuket Tatili - Saha & İskele Offline Service Worker (Aşama 4)
 *
 * Chalong/Rassada iskelelerinde veya teknelerde zayıf/kesintili hücresel
 * internet altında statik kabuk ve varlıkların anında açılmasını sağlar.
 * API çağrıları ağ önceliklidir; ağ yoksa IndexedDB çevrimdışı kuyruğu devreye girer.
 */

const CACHE_NAME = 'phuket-tatili-pwa-v2';
const PRECACHE_ASSETS = [
  '/',
  '/admin',
  '/favicon.svg',
  '/manifest.json',
  '/manifest-ekip.json',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[SW] Pre-caching non-fatal warning:', err);
      });
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // 1. API ve dinamik veri istekleri: Ağdan doğrudan çalışır
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // 2. Yalnızca GET isteklerini önbelleğe al
  if (request.method !== 'GET') {
    return;
  }

  // 3. Sayfa geçişleri / HTML gezintileri (Navigation): Ağ öncelikli, önbellek yedekli
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          const adminCached = await caches.match('/admin');
          if (adminCached) return adminCached;
          return new Response(
            `<!DOCTYPE html><html lang="tr"><head><meta charset="utf-8"><title>Çevrimdışı Kaptan & Saha | Phuket Tatili</title><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font-family:-apple-system,sans-serif;padding:1.5rem;text-align:center;background:#09121f;color:#fff;max-width:500px;margin:auto;}h1{color:#f59e0b;font-size:1.4rem;}p{color:#94a3b8;font-size:0.9rem;}a.btn{display:inline-block;margin:0.4rem;padding:0.75rem 1.25rem;background:#0284c7;color:#fff;text-decoration:none;border-radius:0.75rem;font-weight:bold;font-size:0.85rem;}a.sos{background:#e11d48;}</style></head><body><h1>📶 Andaman Denizi Çevrimdışı Mod</h1><p>Şu anda internet bağlantısı bulunmuyor. Yerel hafızadaki manifesto korunmaktadır.</p><div style="margin:1.5rem 0;"><a class="btn sos" href="tel:1155">🚨 Turist Polisi (1155)</a><a class="btn sos" href="tel:+6676211883">🚤 Deniz Polisi</a><a class="btn" href="tel:+66828950665">🇹🇭 7/24 Saha Destek</a></div><button onclick="location.reload()" style="padding:0.75rem 1.5rem;background:#334155;border:none;border-radius:0.5rem;color:#fff;font-weight:bold;cursor:pointer;">Sayfayı Yenile</button></body></html>`,
            { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          );
        })
    );
    return;
  }

  // 4. Statik varlıklar (CSS, JS, Fonts, Images, SVG): Önbellek öncelikli (Cache-first)
  const isStaticAsset =
    url.pathname.startsWith('/_astro/') ||
    url.pathname.startsWith('/assets/') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.webp') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.woff2');

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      })
    );
  }
});

// 5. PWA Anlık Push Bildirimleri (Web Push & Transfer Saati Güncellemeleri)
self.addEventListener('push', (event) => {
  let data = {
    title: 'Phuket Tatili Operasyon',
    body: 'Yeni bir transfer saati güncellemesi alındı.',
    icon: '/assets/logo-main-transparent.png',
    badge: '/favicon.svg',
    url: '/admin?tab=transfers',
    tag: 'transfer-update',
  };

  if (event.data) {
    try {
      data = Object.assign(data, event.data.json());
    } catch {
      data.body = event.data.text() || data.body;
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/assets/logo-main-transparent.png',
    badge: data.badge || '/favicon.svg',
    tag: data.tag || `transfer-${Date.now()}`,
    renotify: true,
    data: {
      url: data.url || '/admin?tab=transfers',
      dateOfArrival: Date.now(),
      ...data.data,
    },
    vibrate: [200, 100, 200, 100, 200],
    actions: [
      { action: 'open_transfers', title: '📋 Manifestoyu Aç' },
      { action: 'close', title: 'Kapat' },
    ],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Bildirime tıklanınca pencereyi aç veya mevcut transfer sekmesine odaklan
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const targetUrl = event.notification.data?.url || '/admin?tab=transfers';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('/admin') && 'focus' in client) {
          if ('navigate' in client && targetUrl) {
            client.navigate(targetUrl);
          }
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

// Sayfa içinden gelen doğrudan bildirim tetiklemelerini yönet
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, options } = event.data;
    self.registration.showNotification(title || 'Transfer Güncellemesi', {
      icon: '/assets/logo-main-transparent.png',
      badge: '/favicon.svg',
      vibrate: [200, 100, 200],
      ...options,
    });
  }
});
