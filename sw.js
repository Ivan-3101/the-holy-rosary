/* The Holy Rosary — service worker.
   Keeps a copy of the site so the Rosary can be prayed offline after the first visit.
   Strategy: network first (always fresh when online), cache as the fallback. */
const CACHE = 'holy-rosary-v1';
const ASSETS = [
  './',
  'index.html',
  'pray.html',
  'prayers.html',
  'mysteries.html',
  'how-to-pray.html',
  'css/style.css',
  'js/data.js',
  'js/app.js',
  'js/pray.js',
  'fonts/eb-garamond-latin-wght-normal.woff2',
  'fonts/eb-garamond-latin-wght-italic.woff2',
  'fonts/cormorant-garamond-latin-wght-normal.woff2',
  'fonts/cormorant-garamond-latin-wght-italic.woff2',
  'favicon.svg',
  'manifest.webmanifest',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/apple-touch-icon.png',
  'icons/favicon-32.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res && res.ok && res.type === 'basic' && !res.redirected) {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, copy)).catch(() => {});
        }
        return res;
      })
      .catch(() =>
        caches.match(req, { ignoreSearch: true }).then((hit) => {
          if (hit) return hit;
          if (req.mode === 'navigate') return caches.match('index.html');
          return Response.error();
        })
      )
  );
});
