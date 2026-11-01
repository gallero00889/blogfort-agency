/* MATRIX · service worker v7 (MATRIX v3.3)
   Red primero; con conexión se guarda copia; sin conexión se sirve la copia.
   Cambio respecto a v6: al activarse borra SOLO las cachés antiguas de MATRIX (prefijo «matrix-»); antes borraba todas las demás,
   también las de BlogFort App y MWBFA, que comparten el mismo dominio. */
const CACHE_PREFIX = 'matrix-';
const CACHE_NAME = CACHE_PREFIX + 'v7';
const urlsToCache = ['./', './index.html', './manifest.json'];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)).catch(() => {})
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k.indexOf(CACHE_PREFIX) === 0 && k !== CACHE_NAME).map(k => caches.delete(k)))
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
    }).catch(() => caches.match(req))
  );
});
