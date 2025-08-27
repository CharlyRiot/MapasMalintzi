// v6 — Shell offline + actualización automática de app.js / CSS / HTML

const CACHE = "malintzi-v6";
const ASSETS = [
  "./",
  "./index.html",
  "./css/styles.css",
  "./js/app.js",
  "./manifest.webmanifest",
  "./img/icon-192.png",
  "./img/icon-512.png"
];

// Instala y precachea el shell
self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
});

// Activa y limpia caches viejos
self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    await clients.claim();
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
  })());
});

// Estrategia:
// - Para HTML/JS/CSS: network-first (así tomas cambios sin tocar el SW)
// - Para íconos y otros: cache-first con fallback
self.addEventListener("fetch", (e) => {
  const req = e.request;
  const url = new URL(req.url);

  const isHTML = req.destination === "document" || req.headers.get("accept")?.includes("text/html");
  const isJS   = req.destination === "script"   || url.pathname.endsWith(".js");
  const isCSS  = req.destination === "style"    || url.pathname.endsWith(".css");

  if (isHTML || isJS || isCSS) {
    // network-first
    e.respondWith((async () => {
      try {
        const netRes = await fetch(req, { cache: "no-store" });
        const cache = await caches.open(CACHE);
        cache.put(req, netRes.clone());
        return netRes;
      } catch {
        const cached = await caches.match(req);
        return cached || caches.match("./index.html");
      }
    })());
    return;
  }

  // demás: cache-first
  e.respondWith((async () => {
    const cached = await caches.match(req);
    if (cached) return cached;
    try {
      const netRes = await fetch(req);
      return netRes;
    } catch {
      return caches.match("./index.html");
    }
  })());
});
