// sw.js
let pendingTimers = {};

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('message', (event) => {
  if (!event.data) return;

  if (event.data.type === 'SCHEDULE_NOTIFICATION') {
    const { delayMs, title, body, icon, tag } = event.data.payload;

    if (pendingTimers[tag]) {
      clearTimeout(pendingTimers[tag]);
    }

    const promise = new Promise((resolve) => {
      const timerId = setTimeout(() => {
        self.registration.showNotification(title, {
          body: body,
          icon: icon || 'https://cdn-icons-png.flaticon.com/512/3652/3652191.png',
          tag: tag || 'timer-alert',
          renotify: true,
          vibrate: [200, 100, 200, 100, 200],
          requireInteraction: true
        });
        delete pendingTimers[tag];
        resolve();
      }, delayMs);

      pendingTimers[tag] = timerId;
    });

    event.waitUntil(promise);
  }

  if (event.data.type === 'CANCEL_SCHEDULE') {
    const { tag } = event.data.payload;
    if (pendingTimers[tag]) {
      clearTimeout(pendingTimers[tag]);
      delete pendingTimers[tag];
    }
  }
});
