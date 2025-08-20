// Cache ultraligero para funcionar offline con la “carcasa” de la app
const CACHE = "malintzi-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./css/styles.css",
  "./js/app.js",
  "./manifest.webmanifest",
  "./img/icon-192.png",
  "./img/icon-512.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k!==CACHE).map(k => caches.delete(k))))
  );
});

self.addEventListener("fetch", (e) => {
  const { request } = e;
  // Estrategia: cache-first para shell; network-first para todo lo demás.
  e.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(res => {
        // No cacheamos mapas externos (CORS) para evitar problemas.
        return res;
      }).catch(() => caches.match("./index.html"));
    })
  );
});
