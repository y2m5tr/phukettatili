/**
 * Phuket Tatili - Saha & İskele Offline Service Worker (Aşama 4)
 *
 * Chalong/Rassada iskelelerinde veya teknelerde zayıf/kesintili hücresel
 * internet altında statik kabuk ve varlıkların anında açılmasını sağlar.
 * API çağrıları ağ önceliklidir; ağ yoksa IndexedDB çevrimdışı kuyruğu devreye girer.
 */

const CACHE_NAME = 'phuket-tatili-pwa-v1';
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
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[SW] Pre-caching non-fatal warning:', err);
      });
    })
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
            `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Çevrimdışı | Phuket Tatili</title><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="font-family:sans-serif;padding:2rem;text-align:center;background:#09121f;color:#fff;"><h1>📶 Çevrimdışı Mod</h1><p>Şu anda internet bağlantısı bulunmuyor. Bağlantı sağlandığında ekran otomatik yenilenecektir.</p><button onclick="location.reload()" style="padding:0.75rem 1.5rem;background:#0ea5e9;border:none;border-radius:0.5rem;color:#fff;font-weight:bold;cursor:pointer;">Tekrar Dene</button></body></html>`,
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
