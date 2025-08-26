// Cache con timestamp (cambia solo cada build/push)
const BUILD_TIME = new Date().toISOString().slice(0,19).replace(/[:T\-]/g,""); // ej: 20250826_153045
const CACHE = "malintzi-" + BUILD_TIME;

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
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
});

self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    await clients.claim();
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
  })());
});

// Permite que la página pida activar de inmediato el SW nuevo
self.addEventListener("message", (e) => {
  if (e.data && e.data.action === "skipWaiting") self.skipWaiting();
});

// Estrategia: cache-first para el “shell”; red para lo demás
self.addEventListener("fetch", (e) => {
  const { request } = e;
  e.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).catch(() => caches.match("./index.html"));
    })
  );
});