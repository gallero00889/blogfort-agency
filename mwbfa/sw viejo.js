const PREFIX = 'mwbfa-';
const CACHE_NAME = 'mwbfa-v9';
const urlsToCache = ['./', './index.html', './manifest.json', './icon-192-2.png', './icon-512-2.png', './apple-touch-icon.png'];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => Promise.all(urlsToCache.map(u => cache.add(u).catch(() => {}))))
  );
});

self.addEventListener('activate', event => {
  // Solo se borran las cachés antiguas de esta misma herramienta (las demás herramientas comparten dominio)
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k.indexOf(PREFIX) === 0 && k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Red primero; si hay conexión se guarda copia en caché; sin conexión se sirve la copia.
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET' || !req.url.startsWith('http')) return;
  if (req.url.includes('api.anthropic.com') || req.url.includes('stripe.com')) return;
  event.respondWith(
    fetch(req).then(res => {
      if (res && res.status === 200 && (res.type === 'basic' || res.type === 'cors')) {
        const copy = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(req, copy));
      }
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || (req.mode === 'navigate' ? caches.match('./index.html') : undefined)))
  );
});
