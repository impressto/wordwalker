// Service Worker for WordWalker PWA
const CACHE_NAME = 'wordwalker-v1.6.1';
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
  // Paris theme - parallax layers
  '/wordwalker/dist/images/themes/paris/parallax-layer1.png',
  '/wordwalker/dist/images/themes/paris/parallax-layer2.png',
  '/wordwalker/dist/images/themes/paris/parallax-layer3.png',
  '/wordwalker/dist/images/themes/paris/parallax-layer4.png',
  '/wordwalker/dist/images/themes/paris/parallax-layer5.png',
  '/wordwalker/dist/images/themes/paris/parallax-layer6.png',
  '/wordwalker/dist/images/themes/paris/parallax-layer7.png',
  '/wordwalker/dist/images/themes/paris/path.png',
  '/wordwalker/dist/images/themes/paris/path-fork.png',
  '/wordwalker/dist/images/themes/paris/scene.jpg',
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
  // Theme background audio files
  '/wordwalker/dist/audio/themes/default/background.mp3',
  '/wordwalker/dist/audio/themes/hong-kong/background.mp3',
  '/wordwalker/dist/audio/themes/jamaica/background.mp3',
  '/wordwalker/dist/audio/themes/paris/background.mp3',
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
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        // Cache files individually to handle failures gracefully
        const cachePromises = CORE_ASSETS.map(url => {
          return cache.add(url).catch(() => {
            // Failed to cache this asset
          });
        });
        return Promise.all(cachePromises);
      })
      .then(() => {
        return self.skipWaiting(); // Activate immediately
      })
      .catch(() => {
        // Install failed
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
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
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
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
                cache.put(request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // Return offline page or fallback for navigation requests
            if (request.destination === 'document' || request.mode === 'navigate') {
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
                    return cached;
                  }
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
