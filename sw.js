// Limpia el antiguo service worker de la BlogFort App que vivía en la raíz (ahora está en /app/).
self.addEventListener('install', function(){ self.skipWaiting(); });
self.addEventListener('activate', function(event){
  event.waitUntil(
    caches.keys()
      .then(function(keys){ return Promise.all(keys.map(function(k){ return caches.delete(k); })); })
      .then(function(){ return self.registration.unregister(); })
      .then(function(){ return self.clients.matchAll(); })
      .then(function(clients){ clients.forEach(function(c){ c.navigate(c.url); }); })
  );
});
