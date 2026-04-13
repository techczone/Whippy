const CACHE_NAME = 'whippy-v3';

// Sadece var olan sayfaları cache'le
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/habits',
  '/goals',
  '/health',
  '/coach',
  '/logo.png',
];

// Install event
self.addEventListener('install', (event) => {
  console.log('SW: Installing...');
  // Skip cache for now to avoid errors
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('SW: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('whippy-') && name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - network first
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (event.request.url.includes('/api/')) return;
  
  // Just use network, don't cache for now
  return;
});

// Push notification event
self.addEventListener('push', (event) => {
  console.log('SW: Push received');
  
  let data = {
    title: 'Whippy 🔥',
    body: 'Yeni bir bildirim var!',
  };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/logo.png',
      badge: '/favicon-48.png',
      vibrate: [200, 100, 200],
      tag: 'whippy-push',
      renotify: true,
    })
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('SW: Notification clicked');
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('/dashboard');
        }
      })
  );
});

// Message handler
self.addEventListener('message', (event) => {
  console.log('SW: Message received', event.data);
  
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data.type === 'SEND_NOTIFICATION') {
    const { title, body } = event.data.payload;
    self.registration.showNotification(title, {
      body,
      icon: '/logo.png',
      badge: '/favicon-48.png',
      tag: 'app-notification',
    });
  }
});

console.log('SW: Script loaded');
