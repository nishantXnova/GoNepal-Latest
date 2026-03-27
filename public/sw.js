/**
 * GonePal Nepal - PWA Service Worker
 * Provides offline functionality for high-altitude trekkers in Nepal
 * Compatible with PWABuilder requirements
 * 
 * Cache-First Strategy: Checks local cache before network
 * Runtime Caching: For dynamic content and map tiles
 */

// ============================================================================
// PRECACHE MANIFEST - Assets to cache at install time
// ============================================================================

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
  // Airline logos
  '/logos/buddha-air.svg',
  '/logos/tara-air.png',
  '/logos/yeti-airlines.svg',
];

// ============================================================================
// INSTALL EVENT - Cache precache assets
// ============================================================================

self.addEventListener('install', (event) => {
  console.log('[Gonepal SW] Installing service worker...');
  event.waitUntil(
    caches.open(PRECACHE_NAME).then((cache) => {
      console.log('[Gonepal SW] Precaching app shell');
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => {
      // Skip waiting to activate immediately
      return self.skipWaiting();
    })
  );
});

// ============================================================================
// ACTIVATE EVENT - Cleanup old caches
// ============================================================================

self.addEventListener('activate', (event) => {
  console.log('[Gonepal SW] Activating service worker...');
  
  // Clean up old caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== PRECACHE_NAME && name.startsWith('gonepal-'))
          .map((name) => {
            console.log('[Gonepal SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => {
      // Take control immediately
      return self.clients.claim();
    })
  );
  
  console.log('[Gonepal SW] Service worker activated');
});

// ============================================================================
// FETCH EVENT - Handle all requests
// ============================================================================

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-http(s) requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Handle navigation requests specially
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Handle different resource types
  if (request.destination === 'image') {
    // Images - CacheFirst
    event.respondWith(cacheFirst(request));
    return;
  }

  if (request.destination === 'font') {
    // Fonts - CacheFirst
    event.respondWith(cacheFirst(request));
    return;
  }

  if (request.destination === 'script' || request.destination === 'style') {
    // Static assets - StaleWhileRevalidate
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // API requests - NetworkFirst
  if (url.hostname.includes('supabase.co') || url.hostname.includes('api.')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Map tiles - CacheFirst with long cache
  if (url.hostname.includes('tile.openstreetmap.org') || 
      url.hostname.includes('tile.thunderforest.com')) {
    event.respondWith(cacheFirst(request, 'gonepal-map-tiles'));
    return;
  }

  // Default - NetworkFirst for API-like requests
  event.respondWith(networkFirst(request));
});

// ============================================================================
// CACHE STRATEGIES
// ============================================================================

/**
 * CacheFirst - Serve from cache, fallback to network
 */
async function cacheFirst(request, cacheName = 'gonepal-cache-v1') {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('[Gonepal SW] CacheFirst failed:', error);
    return new Response('Offline', { status: 503 });
  }
}

/**
 * StaleWhileRevalidate - Serve from cache, update cache in background
 */
async function staleWhileRevalidate(request) {
  const cachedResponse = await caches.match(request);

  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        const cache = caches.open('gonepal-static-v1');
        cache.then((c) => c.put(request, networkResponse.clone()));
      }
      return networkResponse;
    })
    .catch((error) => {
      console.log('[Gonepal SW] StaleWhileRevalidate failed:', error);
      return cachedResponse || new Response('Offline', { status: 503 });
    });

  return cachedResponse || fetchPromise;
}

/**
 * NetworkFirst - Try network, fallback to cache
 */
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open('gonepal-network-v1');
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('[Gonepal SW] NetworkFirst falling back to cache');
    const cachedResponse = await caches.match(request);
    return cachedResponse || new Response('Offline', { status: 503 });
  }
}

// ============================================================================
// BACKGROUND SYNC
// ============================================================================

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-news') {
    event.waitUntil(syncNews());
  }
  if (event.tag === 'sync-phrases') {
    event.waitUntil(syncPhrases());
  }
});

async function syncNews() {
  console.log('[Gonepal SW] Syncing news in background...');
}

async function syncPhrases() {
  console.log('[Gonepal SW] Syncing phrases in background...');
}

// ============================================================================
// PUSH NOTIFICATIONS (SOS Alerts)
// ============================================================================

self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/gonepallogo.png',
      badge: '/gonepallogo.png',
      vibrate: [200, 100, 200],
      tag: data.tag || 'gonepal-alert',
      data: data.data || {},
      actions: [
        { action: 'view', title: 'View' },
        { action: 'dismiss', title: 'Dismiss' }
      ],
      requireInteraction: data.requireInteraction || false,
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'GoNepal Alert', options)
    );
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'view' || !event.action) {
    event.waitUntil(
      self.clients.openWindow('/')
    );
  }
});

// ============================================================================
// MESSAGE HANDLERS
// ============================================================================

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    const urls = event.data.urls || [];
    event.waitUntil(
      caches.open('gonepal-precache').then(cache => cache.addAll(urls))
    );
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.waitUntil(
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'VERSION',
            version: '1.0.0'
          });
        });
      })
    );
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then(names => Promise.all(names.map(name => caches.delete(name))))
    );
  }
});

// ============================================================================
// GEOFENCING - Trekking Location Alerts
// ============================================================================

const TREKKING_GEOFENCES = [
  { id: 'everest-base-camp', name: 'Everest Base Camp', lat: 28.0045, lng: 86.8556, radiusMeters: 2000, message: '🏔️ You are approaching Everest Base Camp!' },
  { id: 'annapurna-base-camp', name: 'Annapurna Base Camp', lat: 28.1652, lng: 84.0822, radiusMeters: 2000, message: '🏔️ Welcome to Annapurna Base Camp!' },
  { id: 'namche-bazaar', name: 'Namche Bazaar', lat: 27.8068, lng: 86.7139, radiusMeters: 1500, message: '🏔️ Welcome to Namche Bazaar - Sherpa Capital!' },
  { id: 'tilicho-lake', name: 'Tilicho Lake', lat: 28.5081, lng: 84.1319, radiusMeters: 1000, message: '💧 You are approaching the breathtaking Tilicho Lake!' },
  { id: 'pokhara', name: 'Pokhara', lat: 28.2096, lng: 83.9856, radiusMeters: 5000, message: '🏙️ Welcome to Pokhara - the Lake City!' },
  { id: 'lukla-airport', name: 'Lukla Airport', lat: 27.6878, lng: 86.7314, radiusMeters: 2000, message: '✈️ Lukla Airport - Gateway to Everest!' },
];

/**
 * Calculate distance using Haversine formula
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
}

/**
 * Check if user is within any geofence
 */
function checkProximityAlerts(currentLat, currentLon) {
  const triggered = [];
  
  for (const fence of TREKKING_GEOFENCES) {
    const distance = calculateDistance(currentLat, currentLon, fence.lat, fence.lng);
    if (distance <= fence.radiusMeters) {
      triggered.push(fence);
    }
  }
  
  return triggered;
}

// Export for use in main app
export { TREKKING_GEOFENCES, checkProximityAlerts, calculateDistance };
