// Push notification handler for CampusConnect PWA
// This is injected into the service worker

self.addEventListener('push', (event) => {
  if (!event.data) return;

  let data;
  try {
    data = event.data.json();
  } catch {
    data = { title: 'CampusConnect', body: event.data.text(), url: '/dashboard' };
  }

  const options = {
    body: data.body || '',
    icon: data.icon || '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    vibrate: [200, 100, 200],
    data: { url: data.url || '/dashboard' },
    actions: [
      { action: 'open', title: 'View' },
      { action: 'close', title: 'Dismiss' },
    ],
    requireInteraction: data.priority === 'important',
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'CampusConnect', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') return;

  const url = event.notification.data?.url || '/dashboard';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Focus existing window if open
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      // Open new window
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
