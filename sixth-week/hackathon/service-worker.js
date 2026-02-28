const CACHE_NAME = "afet-destek-v1";
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/style.css",
  "/script.js",
  "/manifest.json",
  "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // We use addAll but wrap in try/catch for external resources that might fail CORS
      return cache
        .addAll(ASSETS_TO_CACHE)
        .catch((err) =>
          console.log("Cache addAll failed for some static assets:", err),
        );
    }),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name)),
      );
    }),
  );
  self.clients.claim();
});

// Stale-while-revalidate strategy for the API, Network-first for everything else
self.addEventListener("fetch", (event) => {
  const requestUrl = new URL(event.request.url);

  if (requestUrl.hostname === "api.npoint.io") {
    // API requests: Try network first, then cache
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clonedResp = response.clone();
          caches
            .open(CACHE_NAME)
            .then((cache) => cache.put(event.request, clonedResp));
          return response;
        })
        .catch(() => caches.match(event.request)),
    );
    return;
  }

  // Static assets: Cache first, then network
  event.respondWith(
    caches
      .match(event.request)
      .then((response) => {
        if (response) return response;
        return fetch(event.request).then((fetchRes) => {
          return caches.open(CACHE_NAME).then((cache) => {
            // Only cache GET requests
            if (
              event.request.method === "GET" &&
              !event.request.url.startsWith("chrome-extension")
            ) {
              cache.put(event.request, fetchRes.clone());
            }
            return fetchRes;
          });
        });
      })
      .catch(() => {
        // Fallback if everything fails
      }),
  );
});
