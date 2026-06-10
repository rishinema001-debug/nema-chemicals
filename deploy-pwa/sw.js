// ===== NEMA Chemicals — Service Worker =====
// PWA offline support, smart caching, and auto-update system.
// Version-based cache busting ensures retailers always get latest data.

const CACHE_VERSION = 'nema-v1.0.0';
const DATA_CACHE = 'nema-data-v1';
const IMG_CACHE = 'nema-images-v1';

// Static assets — cached on install (cache-first strategy)
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/i18n.js',
  '/image-index.js',
  '/manifest.json',
  '/build/icon.png',
  '/pwa-icons/icon-192.png',
  '/pwa-icons/icon-512.png',
  '/pwa-icons/icon-144.png'
];

// Data files — always try network first (network-first strategy)
const DATA_FILES = [
  '/products.js'
];

// ===== INSTALL — Pre-cache static assets =====
self.addEventListener('install', (event) => {
  console.log('[SW] Installing version:', CACHE_VERSION);
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => {
        console.log('[SW] Pre-caching static assets');
        return cache.addAll(STATIC_ASSETS).catch(err => {
          console.warn('[SW] Some static assets failed to cache:', err);
          // Don't fail install if some assets are missing
          return Promise.resolve();
        });
      })
      .then(() => self.skipWaiting()) // Activate immediately
  );
});

// ===== ACTIVATE — Clean old caches =====
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating version:', CACHE_VERSION);
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => {
            // Delete old version caches but keep image cache
            return name !== CACHE_VERSION && 
                   name !== IMG_CACHE && 
                   name !== DATA_CACHE;
          })
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => {
      // Notify all clients about the update
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'SW_UPDATED',
            version: CACHE_VERSION
          });
        });
      });
      return self.clients.claim(); // Take control immediately
    })
  );
});

// ===== FETCH — Smart caching strategies =====
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip chrome-extension, etc.
  if (!url.protocol.startsWith('http')) return;

  // Skip cross-origin requests (Google Fonts will be handled separately)
  const isSameOrigin = url.origin === self.location.origin;
  const isFont = url.hostname.includes('fonts.googleapis.com') || 
                 url.hostname.includes('fonts.gstatic.com');
  
  // ── Strategy 1: Network-first for product data ──
  if (isSameOrigin && DATA_FILES.some(f => url.pathname.endsWith(f.replace('/', '')))) {
    event.respondWith(networkFirstStrategy(event.request, DATA_CACHE));
    return;
  }
  
  // ── Strategy 2: Cache-first for images (lazy cache) ──
  if (isSameOrigin && isImageRequest(url.pathname)) {
    event.respondWith(cacheFirstWithLazyCache(event.request, IMG_CACHE));
    return;
  }
  
  // ── Strategy 3: Cache-first for Google Fonts ──
  if (isFont) {
    event.respondWith(cacheFirstWithLazyCache(event.request, CACHE_VERSION));
    return;
  }
  
  // ── Strategy 4: Cache-first for static assets ──
  if (isSameOrigin) {
    event.respondWith(cacheFirstStrategy(event.request, CACHE_VERSION));
    return;
  }
});

// ===== Network-First Strategy =====
// Try network first, fall back to cache. Always update cache on success.
// This ensures retailers always get the latest product data.
async function networkFirstStrategy(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
      
      // Notify clients about data update
      const clients = await self.clients.matchAll();
      clients.forEach((client) => {
        client.postMessage({
          type: 'DATA_UPDATED',
          url: request.url,
          timestamp: Date.now()
        });
      });
    }
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, serving from cache:', request.url);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) return cachedResponse;
    
    // Return offline fallback for HTML pages
    if (request.headers.get('accept')?.includes('text/html')) {
      return caches.match('/index.html');
    }
    
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
  }
}

// ===== Cache-First Strategy =====
// Serve from cache first, fall back to network.
async function cacheFirstStrategy(request, cacheName) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) return cachedResponse;
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // For HTML, return cached index
    if (request.headers.get('accept')?.includes('text/html')) {
      const fallback = await caches.match('/index.html');
      if (fallback) return fallback;
    }
    return new Response('Offline', { status: 503 });
  }
}

// ===== Cache-First with Lazy Cache =====
// For images/fonts — cache on first view, serve from cache after.
async function cacheFirstWithLazyCache(request, cacheName) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) return cachedResponse;
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // Return placeholder for images
    if (isImageRequest(request.url)) {
      return new Response(
        '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect fill="#f0f0f0" width="200" height="200"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" font-size="14" fill="#999">Offline</text></svg>',
        { headers: { 'Content-Type': 'image/svg+xml' } }
      );
    }
    return new Response('', { status: 503 });
  }
}

// ===== Helper: Check if request is for an image =====
function isImageRequest(pathname) {
  return /\.(png|jpe?g|gif|webp|svg|ico)(\?.*)?$/i.test(pathname);
}

// ===== Message handling from main app =====
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CHECK_UPDATE') {
    // Force re-fetch products.js to check for updates
    fetch('/products.js', { cache: 'no-store' })
      .then(response => {
        if (response.ok) {
          caches.open(DATA_CACHE).then(cache => {
            cache.put('/products.js', response);
          });
        }
      })
      .catch(() => {
        // Offline, skip update check
      });
  }
  
  // Clear all caches (for debugging)
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then(names => {
      names.forEach(name => caches.delete(name));
    });
  }
});
