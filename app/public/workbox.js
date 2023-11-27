
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/service.js').then(function (registration) {
      console.debug(`[service] service worker registered with scope: ${registration.scope}`);
    }, function (err) {
      console.debug(`[service] service worker registration failed: ${err}`);
    });
  });
}
