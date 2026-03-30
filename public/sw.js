/**
 * GonePal Nepal - PWA Service Worker
 * Provides offline functionality for high-altitude trekkers in Nepal
 * Supports: Offline caching, Background Sync, Push Notifications, Periodic Sync
 */

const PRECACHE_NAME = 'gonepal-precache-v1';
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/gonepallogo.png',
  '/apple-touch-icon.png',
  '/favicon.ico',
  '/favicon-32x32.png',
  '/favicon-16x16.png',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png',
  '/placeholder.svg',
  '/robots.txt',
  '/site.webmanifest',
  '/logos/buddha-air.svg',
  '/logos/tara-air.png',
  '/logos/yeti-airlines.svg',
];

// Install - cache precache assets
self.addEventListener('install', (event) => {
  console.log('[Gonepal SW] Installing service worker...');
  event.waitUntil(
    caches.open(PRECACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS))
  );
  self.skipWaiting();
});

// Activate - cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) => Promise.all(
      names.filter((n) => n !== PRECACHE_NAME && n.startsWith('gonepal-')).map(caches.delete)
    ))
  );
  self.clients.claim();
  
  // Register for periodic sync if supported
  if (registration.periodicSync) {
    registration.periodicSync.register('sync-weather', {
      minInterval: 60 * 60 * 1000, // 1 hour minimum
      minPeriod: 60 * 60 * 1000,
    }).catch((err) => console.log('[Gonepal SW] Periodic sync registration failed:', err));
  }
});

// Fetch - handle requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-http(s) requests
  if (!url.protocol.startsWith('http')) return;

  // Always let Supabase requests go directly to network - NO caching
  if (url.hostname.includes('supabase.co')) {
    return;
  }

  // For navigation requests (HTML pages) - Network First
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Images - CacheFirst
  if (request.destination === 'image') {
    event.respondWith(cacheFirst(request, 'gonepal-images'));
    return;
  }

  // Fonts - CacheFirst
  if (request.destination === 'font') {
    event.respondWith(cacheFirst(request, 'gonepal-fonts'));
    return;
  }

  // Static assets (JS, CSS) - StaleWhileRevalidate
  if (request.destination === 'script' || request.destination === 'style') {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // Map tiles - CacheFirst
  if (url.hostname.includes('tile.openstreetmap.org') || url.hostname.includes('tile.thunderforest.com')) {
    event.respondWith(cacheFirst(request, 'gonepal-map-tiles'));
    return;
  }

  // Default - NetworkFirst
  event.respondWith(networkFirst(request));
});

// CacheFirst strategy
async function cacheFirst(request, cacheName = 'gonepal-cache') {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Offline', { status: 503 });
  }
}

// StaleWhileRevalidate strategy
async function staleWhileRevalidate(request) {
  const cached = await caches.match(request);
  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      caches.open('gonepal-static').then((c) => c.put(request, response.clone()));
    }
    return response;
  }).catch(() => cached || new Response('Offline', { status: 503 }));
  return cached || fetchPromise;
}

// NetworkFirst strategy
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open('gonepal-network');
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return caches.match(request) || new Response('Offline', { status: 503 });
  }
}

// Background Sync - handle sync events for offline data
self.addEventListener('sync', (event) => {
  console.log('[Gonepal SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'sync-news') {
    event.waitUntil(
      // In a real app, this would fetch and cache news data
      fetch('/api/news').then(res => res.json()).then(data => {
        console.log('[Gonepal SW] News synced:', data);
        return caches.open('gonepal-network').then(cache => {
          cache.put(new Request('/api/news'), new Response(JSON.stringify(data)));
        });
      }).catch(err => console.log('[Gonepal SW] News sync failed:', err))
    );
  }
  
  if (event.tag === 'sync-phrases') {
    event.waitUntil(
      fetch('/api/phrases').then(res => res.json()).then(data => {
        console.log('[Gonepal SW] Phrases synced:', data);
        return caches.open('gonepal-network').then(cache => {
          cache.put(new Request('/api/phrases'), new Response(JSON.stringify(data)));
        });
      }).catch(err => console.log('[Gonepal SW] Phrases sync failed:', err))
    );
  }
  
  if (event.tag === 'sync-bookings') {
    event.waitUntil(
      // Sync any pending booking data
      console.log('[Gonepal SW] Syncing bookings...')
    );
  }
});

// Push Notifications
self.addEventListener('push', (event) => {
  let options = {
    body: 'You have a new notification from GoNepal',
    icon: '/android-chrome-192x192.png',
    badge: '/android-chrome-192x192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      { action: 'view', title: 'View' },
      { action: 'close', title: 'Close' },
    ],
  };

  if (event.data) {
    try {
      const data = event.data.json();
      options = {
        ...options,
        body: data.body || options.body,
        icon: data.icon || options.icon,
        tag: data.tag || 'gonepal-alert',
        data: { ...options.data, ...data },
      };
    } catch (e) {
      options.body = event.data.text() || options.body;
    }
  }

  event.waitUntil(
    self.registration.showNotification('GoNepal - Trekking Companion', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'view' || !event.action) {
    event.waitUntil(
      self.clients.matchAll({ type: 'window' }).then((clientList) => {
        // If a window is already open, focus it
        for (const client of clientList) {
          if (client.url.includes('go-nepal.vercel.app') && 'focus' in client) {
            return client.focus();
          }
        }
        // Otherwise open a new window
        return self.clients.openWindow('/');
      })
    );
  }
});

// Periodic Background Sync - fetch updated data at regular intervals
self.addEventListener('periodicsync', (event) => {
  console.log('[Gonepal SW] Periodic sync triggered:', event.tag);
  
  if (event.tag === 'sync-weather') {
    event.waitUntil(
      fetch('/api/weather').then(res => res.json()).then(data => {
        console.log('[Gonepal SW] Weather updated:', data);
        return caches.open('gonepal-network').then(cache => {
          cache.put(new Request('/api/weather'), new Response(JSON.stringify({
            data,
            timestamp: Date.now(),
          })));
        });
      }).catch(err => console.log('[Gonepal SW] Weather sync failed:', err))
    );
  }
});

// Messages from main app
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data?.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: '1.0.0' });
  }
  
  // Request background sync from the app
  if (event.data?.type === 'REQUEST_SYNC') {
    const tag = event.data.tag;
    if (tag && 'sync' in registration) {
      registration.sync.register(tag).then(() => {
        console.log('[Gonepal SW] Sync registered:', tag);
      }).catch(err => {
        console.log('[Gonepal SW] Sync registration failed:', err);
      });
    }
  }
});
