const CACHE_NAME = 'blogfort-app-v14';
const urlsToCache = [
  './',
  './index.html',
  './blogfort-logo-transparente-1.png',
  './icon-192-2.png',
  './icon-512-2.png',
  './manifest.json'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k.indexOf('blogfort-app-') === 0 && k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Red primero; si hay conexión se guarda copia en caché; sin conexión se sirve la copia.
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET' || !req.url.startsWith('http')) return;
  const isApi = req.url.includes('api.anthropic.com') || req.url.includes('stripe.com');
  if (isApi) return;
  event.respondWith(
    fetch(req).then(res => {
      if (res && res.status === 200 && (res.type === 'basic' || res.type === 'cors')) {
        const copy = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(req, copy));
      }
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: true }))
  );
});
