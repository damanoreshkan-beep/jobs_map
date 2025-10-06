const CACHE='jobsnatchr-v1';
const ASSETS=[
    './',
    './index.html',
    './manifest.json',
    './logo-48.png',
    './logo-192.png',
    './logo.png',
    './jobs.js'
   ];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const { request } = e;
  // network-first для даних, cache-first для статичних
  if (request.method !== 'GET') return;
  e.respondWith(
    caches.match(request).then(cached => {
      const fetchP = fetch(request).then(r => {
        const copy = r.clone();
        caches.open(CACHE).then(c => c.put(request, copy));
        return r;
      }).catch(() => cached);
      return cached || fetchP;
    })
  );
});