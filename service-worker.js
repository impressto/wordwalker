// Service Worker for WordWalker PWA
const CACHE_NAME = 'wordwalker-v1.3.17';
const ASSETS_CACHE = 'wordwalker-assets-v1';
const AUDIO_CACHE = 'wordwalker-audio-v1';
const IMAGE_CACHE = 'wordwalker-images-v1';

// Core app files - must be cached for offline functionality
const CORE_ASSETS = [
  '/wordwalker/',
  '/wordwalker/index.php',
  '/wordwalker/dist/index.html',
  '/wordwalker/dist/manifest.json',
  '/wordwalker/dist/assets/index.js',
  '/wordwalker/dist/assets/vendor.js',
  '/wordwalker/dist/assets/index.css',
  // Essential icons
  '/wordwalker/dist/images/icon-192x192.png',
  '/wordwalker/dist/images/icon-512x512.png',
  '/wordwalker/dist/images/logoscreen.png',
  '/wordwalker/dist/images/top-logo.png',
  // Walker avatars and sprites
  '/wordwalker/dist/images/walkers/walker-default.png',
  '/wordwalker/dist/images/walkers/walker-default-avatar.png',
  '/wordwalker/dist/images/walkers/walker-asuka.png',
  '/wordwalker/dist/images/walkers/walker-asuka-avatar.png',
  '/wordwalker/dist/images/walkers/walker-blue.png',
  '/wordwalker/dist/images/walkers/walker-blue-avatar.png',
  '/wordwalker/dist/images/walkers/walker-cat.png',
  '/wordwalker/dist/images/walkers/walker-cat-avatar.png',
  '/wordwalker/dist/images/walkers/walker-dog.png',
  '/wordwalker/dist/images/walkers/walker-dog-avatar.png',
  '/wordwalker/dist/images/walkers/walker-emma.png',
  '/wordwalker/dist/images/walkers/walker-emma-avatar.png',
  // Default theme - parallax layers
  '/wordwalker/dist/images/themes/default/parallax-layer1.png',
  '/wordwalker/dist/images/themes/default/parallax-layer2.png',
  '/wordwalker/dist/images/themes/default/parallax-layer3.png',
  '/wordwalker/dist/images/themes/default/parallax-layer4.png',
  '/wordwalker/dist/images/themes/default/parallax-layer5.png',
  '/wordwalker/dist/images/themes/default/parallax-layer6.png',
  '/wordwalker/dist/images/themes/default/parallax-layer7.png',
  '/wordwalker/dist/images/themes/default/path.png',
  '/wordwalker/dist/images/themes/default/path-fork.png',
  '/wordwalker/dist/images/themes/default/scene.jpg',
  // Hong Kong theme - parallax layers
  '/wordwalker/dist/images/themes/hong-kong/parallax-layer1.png',
  '/wordwalker/dist/images/themes/hong-kong/parallax-layer2.png',
  '/wordwalker/dist/images/themes/hong-kong/parallax-layer3.png',
  '/wordwalker/dist/images/themes/hong-kong/parallax-layer4.png',
  '/wordwalker/dist/images/themes/hong-kong/parallax-layer5.png',
  '/wordwalker/dist/images/themes/hong-kong/parallax-layer6.png',
  '/wordwalker/dist/images/themes/hong-kong/parallax-layer7.png',
  '/wordwalker/dist/images/themes/hong-kong/path.png',
  '/wordwalker/dist/images/themes/hong-kong/path-fork.png',
  '/wordwalker/dist/images/themes/hong-kong/scene.jpg',
  // Jamaica theme - parallax layers
  '/wordwalker/dist/images/themes/jamaica/parallax-layer1.png',
  '/wordwalker/dist/images/themes/jamaica/parallax-layer2.png',
  '/wordwalker/dist/images/themes/jamaica/parallax-layer3.png',
  '/wordwalker/dist/images/themes/jamaica/parallax-layer4.png',
  '/wordwalker/dist/images/themes/jamaica/parallax-layer5.png',
  '/wordwalker/dist/images/themes/jamaica/parallax-layer6.png',
  '/wordwalker/dist/images/themes/jamaica/parallax-layer7.png',
  '/wordwalker/dist/images/themes/jamaica/path.png',
  '/wordwalker/dist/images/themes/jamaica/path-fork.png',
  '/wordwalker/dist/images/themes/jamaica/path-fork2.png',
  '/wordwalker/dist/images/themes/jamaica/scene.jpg',
  // Dia-de-los-muertos theme - parallax layers
  '/wordwalker/dist/images/themes/dia-de-los-muertos/parallax-layer1.png',
  '/wordwalker/dist/images/themes/dia-de-los-muertos/parallax-layer2.png',
  '/wordwalker/dist/images/themes/dia-de-los-muertos/parallax-layer3.png',
  '/wordwalker/dist/images/themes/dia-de-los-muertos/parallax-layer4.png',
  '/wordwalker/dist/images/themes/dia-de-los-muertos/parallax-layer5.png',
  '/wordwalker/dist/images/themes/dia-de-los-muertos/parallax-layer6.png',
  '/wordwalker/dist/images/themes/dia-de-los-muertos/parallax-layer7.png',
  '/wordwalker/dist/images/themes/dia-de-los-muertos/path.png',
  '/wordwalker/dist/images/themes/dia-de-los-muertos/path-fork.png',
  '/wordwalker/dist/images/themes/dia-de-los-muertos/scene.jpg',
  '/wordwalker/dist/images/themes/dia-de-los-muertos/day-of-the-dead.png',
  '/wordwalker/dist/images/themes/dia-de-los-muertos/day-of-dead-parallax.png',
  // Theme background audio files
  '/wordwalker/dist/audio/themes/default/background.mp3',
  '/wordwalker/dist/audio/themes/hong-kong/background.mp3',
  '/wordwalker/dist/audio/themes/jamaica/background.mp3',
  '/wordwalker/dist/audio/themes/dia-de-los-muertos/background.mp3',
];

// Assets that will be cached as they're requested
const ASSET_PATTERNS = [
  /\/wordwalker\/dist\/assets\/.*\.js$/,
  /\/wordwalker\/dist\/assets\/.*\.css$/,
];

// Image patterns
const IMAGE_PATTERNS = [
  /\/wordwalker\/dist\/images\/.*\.(png|jpg|jpeg|svg|webp)$/,
  /\/wordwalker\/dist\/icon.*\.png$/,
];

// Audio patterns
const AUDIO_PATTERNS = [
  /\/wordwalker\/dist\/audio\/.*\.mp3$/,
];

// Install event - cache core assets
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching core assets');
        // Cache files individually to see which ones fail
        const cachePromises = CORE_ASSETS.map(url => {
          return cache.add(url)
            .then(() => {
              console.log(`[Service Worker] ✅ Cached: ${url}`);
            })
            .catch(err => {
              console.error(`[Service Worker] ❌ Failed to cache: ${url}`, err);
            });
        });
        return Promise.all(cachePromises);
      })
      .then(() => {
        console.log('[Service Worker] Core assets cached');
        return self.skipWaiting(); // Activate immediately
      })
      .catch(err => {
        console.error('[Service Worker] Install failed:', err);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            // Delete old caches that don't match current version
            if (cacheName !== CACHE_NAME && 
                cacheName !== ASSETS_CACHE && 
                cacheName !== AUDIO_CACHE && 
                cacheName !== IMAGE_CACHE) {
              console.log('[Service Worker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[Service Worker] Activated');
        return self.clients.claim(); // Take control immediately
      })
  );
});

// Helper function to determine cache name based on request
function getCacheName(url) {
  if (IMAGE_PATTERNS.some(pattern => pattern.test(url))) {
    return IMAGE_CACHE;
  }
  if (AUDIO_PATTERNS.some(pattern => pattern.test(url))) {
    return AUDIO_CACHE;
  }
  if (ASSET_PATTERNS.some(pattern => pattern.test(url))) {
    return ASSETS_CACHE;
  }
  return CACHE_NAME;
}

// Fetch event - offline-first strategy with network fallback
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = request.url;

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome extensions and other protocols
  if (!url.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.match(request)
      .then(cachedResponse => {
        // Return cached response if found
        if (cachedResponse) {
          console.log('[Service Worker] Serving from cache:', url);
          return cachedResponse;
        }

        // Not in cache, fetch from network
        return fetch(request)
          .then(response => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type === 'error') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();
            const cacheName = getCacheName(url);

            // Cache the fetched response
            caches.open(cacheName)
              .then(cache => {
                console.log('[Service Worker] Caching new resource:', url);
                cache.put(request, responseToCache);
              });

            return response;
          })
          .catch(error => {
            console.error('[Service Worker] Fetch failed for:', url, error);
            
            // Return offline page or fallback for navigation requests
            if (request.destination === 'document' || request.mode === 'navigate') {
              console.log('[Service Worker] Returning cached app for navigation request');
              // Try multiple cache keys in order of preference
              return caches.match('/wordwalker/index.php')
                .then(cached => {
                  if (cached) return cached;
                  return caches.match('/wordwalker/');
                })
                .then(cached => {
                  if (cached) return cached;
                  return caches.match('/wordwalker/dist/index.html');
                })
                .then(cached => {
                  if (cached) {
                    console.log('[Service Worker] Returning cached HTML');
                    return cached;
                  }
                  console.log('[Service Worker] No cached HTML found, returning offline page');
                  return caches.match('/wordwalker/dist/offline.html');
                });
            }
            
            // For other requests, just fail gracefully
            return new Response('Offline - resource not available', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
          });
      })
  );
});

// Listen for messages from the main thread
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      })
    );
  }
});
