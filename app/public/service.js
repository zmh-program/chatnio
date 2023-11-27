
const SERVICE_NAME = "chatnio";

self.addEventListener('activate', function (event) {
  console.debug("[service] service worker activated");
});

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(SERVICE_NAME)
      .then(function (cache) {
        return cache.addAll([]);
      })
  );
});

self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.match(event.request)
      .then(function (response) {
        return response || fetch(event.request);
      })
  );
});
