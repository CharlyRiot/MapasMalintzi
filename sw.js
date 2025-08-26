// Cache ultraligero para funcionar offline con la “carcasa” de la app
const CACHE = "malintzi-v5";
const ASSETS = [
  "./",
  "./index.html",
  "./css/styles.css",
  "./js/app.js",
  "./manifest.webmanifest",
  "./img/icon-192.png",
  "./img/icon-512.png"
];

// Instala y guarda en caché
self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});

// Activa y limpia versiones viejas
self.addEventListener("activate", (e) => {
  e.waitUntil(
    (async () => {
      await clients.claim();
      const keys = await caches.keys();
      await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    })()
  );
});

// Intercepta requests
self.addEventListener("fetch", (e) => {
  const { request } = e;
  e.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(res => {
        // No cacheamos mapas externos (CORS) para evitar problemas
        return res;
      }).catch(() => caches.match("./index.html"));
    })
  );
});
