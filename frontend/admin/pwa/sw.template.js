/*
 * KKF Admin service worker (built into dist/sw.js by vite.config.ts, which fills in VERSION and PRECACHE).
 *
 * What it does — and deliberately doesn't:
 *  - Keeps the APP (screens, styles, fonts, icons) on the device, so the admin opens at once and still opens
 *    without internet. Pages show their own "couldn't load — Try again" message when the data can't be fetched.
 *  - NEVER stores data: anything under /api/ (fighters, results, pictures of private records, login) always goes
 *    to the network. Nothing is saved offline.
 *  - A new version waits until the officer taps "Update" (no screen changes underneath someone who is typing).
 * See claude/features/admin-pwa.md and claude/updates/admin-pwa-performance.md.
 */
const VERSION = "__VERSION__";
const CACHE = "kkf-admin-" + VERSION;
const PRECACHE = __PRECACHE__; // paths relative to the app's address (scope)
const SCOPE = self.registration.scope;
const url = (path) => new URL(path, SCOPE).href;

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      // Built files have hashed names: one the previous version already holds is copied, not downloaded again.
      // The rest is fetched; if one file fails the install fails as a whole and the browser retries on the next visit.
      await Promise.all(
        PRECACHE.map(async (path) => {
          const address = url(path);
          const same = address.includes("/assets/") ? await caches.match(address) : undefined;
          return same ? cache.put(address, same) : cache.add(address);
        }),
      );
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      for (const key of await caches.keys()) if (key.startsWith("kkf-admin-") && key !== CACHE) await caches.delete(key);
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const target = new URL(request.url);
  if (target.origin !== self.location.origin) return;
  if (target.pathname.includes("/api/")) return; // data: always the network

  // Opening or reloading a screen: the app shell from the device (instant), the network only as a fallback.
  if (request.mode === "navigate") {
    event.respondWith(
      caches.match(url("index.html")).then((hit) => hit || fetch(request)).catch(() => fetch(request)),
    );
    return;
  }

  // Built files (hashed names, never change) and icons: device first; fetched once and kept when first used.
  event.respondWith(
    caches.match(request).then(
      (hit) =>
        hit ||
        fetch(request).then((response) => {
          if (response.ok && (target.pathname.includes("/assets/") || target.pathname.includes("/icons/"))) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        }),
    ),
  );
});
