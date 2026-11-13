// FR-40 (CR-10) offline app shell. Plain JavaScript because the browser runs this file directly.
// - Pages (navigations): network first, so a visit online is always fresh; the last copy is used when offline.
// - /_next/static/* and /icons/*: file names contain a content hash, so a cached copy never goes stale
//   (cache first).
// - Never touched: /api/* (search results are cached by the app in localStorage, see offline-cache.ts),
//   map tiles and anything cross-origin, non-GET requests.
// No personal data is involved: only public pages and the app's own files are stored.
const CACHE = "happening-shell-v1";

self.addEventListener("install", (event) => {
  // "/" is stored up front so the home page opens offline even before a second visit.
  event.waitUntil(caches.open(CACHE).then((cache) => cache.add("/")).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

function isStatic(url) {
  return url.origin === self.location.origin && (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/"));
}

// Files the page loaded before this worker took control can't be seen by the fetch handler, so the page
// sends their addresses once (see ServiceWorkerRegister.tsx) and they are stored here.
self.addEventListener("message", (event) => {
  if (!event.data || event.data.type !== "cache-urls" || !Array.isArray(event.data.urls)) return;
  const urls = event.data.urls.filter((u) => typeof u === "string" && isStatic(new URL(u, self.location.origin)));
  event.waitUntil(caches.open(CACHE).then((cache) => Promise.all(urls.map((u) => cache.add(u).catch(() => undefined)))));
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith("/api/")) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok && !response.redirected) {
            const copy = response.clone();
            event.waitUntil(caches.open(CACHE).then((cache) => cache.put(request, copy)));
          }
          return response;
        })
        .catch(() =>
          caches.match(request).then(
            (hit) =>
              hit ||
              // A page never opened before can't be shown offline. Sending the visitor to the cached home page
              // is better than putting the home page's HTML under another address.
              (url.pathname === "/" ? Response.error() : Response.redirect(new URL("/", self.location.origin).href, 302)),
          ),
        ),
    );
    return;
  }

  if (isStatic(url)) {
    event.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ||
          fetch(request).then((response) => {
            if (response.ok) {
              const copy = response.clone();
              event.waitUntil(caches.open(CACHE).then((cache) => cache.put(request, copy)));
            }
            return response;
          }),
      ),
    );
  }
});
