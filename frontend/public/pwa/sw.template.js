/*
 * Kun Khmer fan site service worker (built into dist/sw.js by vite.config.ts, which fills in VERSION and SHELL).
 * claude/updates/public-site-pwa.md
 *
 *  - Pages always come from the network first, so fans get the newest version at once after a deploy; the stored
 *    copy of the page is only used when there is no internet (the screens then show their own "couldn't load").
 *  - Built files (hashed names, never change) and icons are kept on the phone when first used, so repeat visits
 *    open fast. Only the page and its main files are fetched at install — nothing big on a fan's mobile data.
 *  - NEVER stores data: anything under /api/ (results, fighters, news, pictures, fan sign-in) always goes to the network.
 */
const VERSION = "__VERSION__";
const CACHE = "kk-site-" + VERSION;
const SHELL = __SHELL__; // paths relative to the site's address (scope)
const SCOPE = self.registration.scope;
const url = (path) => new URL(path, SCOPE).href;

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL.map(url))).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      for (const key of await caches.keys()) if (key.startsWith("kk-site-") && key !== CACHE) await caches.delete(key);
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const target = new URL(request.url);
  if (target.origin !== self.location.origin) return;
  if (target.pathname.includes("/api/")) return; // data: always the network

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match(url("index.html")).then((hit) => hit || Response.error())),
    );
    return;
  }

  if (!target.pathname.includes("/assets/") && !target.pathname.includes("/icons/")) return;
  event.respondWith(
    caches.match(request).then(
      (hit) =>
        hit ||
        fetch(request).then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        }),
    ),
  );
});
