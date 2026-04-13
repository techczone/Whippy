const CACHE_NAME = 'whippy-v2';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/habits',
  '/goals',
  '/health',
  '/coach',
  '/offline',
  '/logo.png',
  '/favicon.ico',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip API requests
  if (event.request.url.includes('/api/')) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone the response before caching
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // If network fails, try cache
        return caches.match(event.request).then((response) => {
          if (response) {
            return response;
          }
          // If not in cache either, return offline page for navigation
          if (event.request.mode === 'navigate') {
            return caches.match('/offline');
          }
          return new Response('Offline', { status: 503 });
        });
      })
  );
});

// Push notification event
self.addEventListener('push', (event) => {
  let data = {
    title: 'Whippy 🔥',
    body: 'Yeni bir bildirim var!',
    icon: '/logo.png',
    badge: '/favicon-48.png',
    url: '/dashboard',
  };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/logo.png',
    badge: data.badge || '/favicon-48.png',
    vibrate: [200, 100, 200],
    tag: data.tag || 'whippy-push',
    renotify: true,
    requireInteraction: false,
    data: {
      url: data.url || '/dashboard',
      timestamp: Date.now(),
    },
    actions: [
      {
        action: 'open',
        title: 'Aç',
      },
      {
        action: 'dismiss',
        title: 'Kapat',
      },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/dashboard';

  if (event.action === 'dismiss') {
    return;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // If there's already a window open, focus it
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(urlToOpen);
            return client.focus();
          }
        }
        // Otherwise, open a new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-habits') {
    event.waitUntil(syncHabits());
  }
});

async function syncHabits() {
  // Get queued habit completions from IndexedDB
  // This would sync any offline habit completions when back online
  console.log('Syncing habits...');
}

// Periodic background sync for reminders (if supported)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'daily-reminder') {
    event.waitUntil(checkAndSendReminder());
  }
});

async function checkAndSendReminder() {
  // Check localStorage for reminder time
  // Note: This won't work directly in SW, would need IndexedDB
  const now = new Date();
  const hour = now.getHours();
  
  // Default reminder at 9 AM if not set
  if (hour === 9) {
    await self.registration.showNotification('Günaydın! ☀️', {
      body: 'Bugünkü alışkanlıklarını tamamlamayı unutma!',
      icon: '/logo.png',
      badge: '/favicon-48.png',
      tag: 'daily-reminder',
      data: { url: '/habits' },
    });
  }
}

// Message handler for communication with main app
self.addEventListener('message', (event) => {
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data.type === 'SEND_NOTIFICATION') {
    const { title, body, url, tag } = event.data.payload;
    self.registration.showNotification(title, {
      body,
      icon: '/logo.png',
      badge: '/favicon-48.png',
      tag: tag || 'app-notification',
      data: { url: url || '/dashboard' },
    });
  }

  if (event.data.type === 'SCHEDULE_REMINDER') {
    // Store reminder time in IndexedDB for persistence
    const { hour, minute } = event.data.payload;
    // This would need IndexedDB implementation for true persistence
    console.log(`Reminder scheduled for ${hour}:${minute}`);
  }
});
