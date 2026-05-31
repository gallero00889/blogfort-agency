const CACHE_NAME = 'blogfort-v6';
const urlsToCache = [
  '/',
  '/index.html',
  '/blogfort-logo-transparente-1.png',
  '/icon-192-1-1.png',
  '/icon-512-1-1.png',
  '/manifest.json'
];

// Instalar — guardar en caché
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// Activar — eliminar cachés antiguas
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k =>
        caches.delete(k)
      ))
    ).then(() => self.clients.claim())
  );
});

// Fetch — red primero, caché como respaldo
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
