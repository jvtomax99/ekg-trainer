/* Offline support: serve from cache, refresh the cache in the background.
   Bump VERSION whenever app files change so phones pick up the update. */
const VERSION = "ekg-v9";
const MEDIA = "ekg-media-v1"; // the hallway clips (js/unit.js) and the opening film (js/start.js); kept across updates
const FILES = [
  "./", "index.html", "styles.css", "manifest.webmanifest",
  "js/rhythms.js", "js/ecg.js", "js/quiz.js", "js/strip.js", "js/fsrs.js", "js/progress.js", "js/theme.js", "js/tour.js", "js/unit.js", "js/start.js", "js/app.js",
  "icons/icon.svg", "icons/favicon.svg", "icons/favicon-32.png", "icons/apple-touch-icon.png",
  "icons/icon-192.png", "icons/icon-512.png", "icons/icon-maskable-512.png",
  "img/tour/home.webp", "img/tour/learn.webp", "img/tour/practice.webp", "img/tour/exam.webp", "img/tour/progress.webp",
  "img/unit/unit.webp", "img/unit/unit-lit.webp", "img/film/open.webp"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION && k !== MEDIA).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;
  if (/\/img\/(unit\/walk[\w-]*|film\/open)\.mp4$/.test(url.pathname)) return; // js/unit.js and js/start.js store these themselves
  e.respondWith(
    caches.open(VERSION).then((cache) =>
      cache.match(e.request, { ignoreSearch: true }).then((hit) => {
        const net = fetch(e.request).then((res) => {
          if (res.ok) cache.put(e.request, res.clone());
          return res;
        }).catch(() => hit);
        return hit || net;
      })
    )
  );
});
