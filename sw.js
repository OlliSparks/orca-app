// ORCA 2.0 - Service Worker
// Offline-Unterstützung und Caching

const CACHE_NAME = 'orca-v1';
const CACHE_VERSION = '2.0.1';

// Statische Assets die immer gecacht werden sollen
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/css/styles.css',
    '/js/config/api-config.js',
    '/js/services/auth.js',
    '/js/services/api.js',
    '/js/services/error-service.js',
    '/js/services/loading-service.js',
    '/js/services/keyboard-service.js',
    '/js/services/breadcrumb-service.js',
    '/js/services/search-service.js',
    '/js/services/theme-service.js',
    '/js/services/bulk-actions-service.js',
    '/js/services/message-service.js',
    '/js/services/onboarding.js',
    '/js/router.js',
    '/js/app.js',
    '/js/pages/dashboard.js',
    '/js/pages/inventur.js',
    '/js/pages/verlagerung.js',
    '/js/pages/glossar.js',
    '/assets/orca-logo.svg'
];

// API-Endpunkte die gecacht werden können
const API_CACHE_PATTERNS = [
    /\/api\/orca\/asset/,
    /\/api\/orca\/company/,
    /\/api\/orca\/inventory/
];

// Installation - Cache statische Assets
self.addEventListener('install', (event) => {
    console.log('[SW] Installing Service Worker...');

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Caching static assets');
                return cache.addAll(STATIC_ASSETS.map(url => {
                    // Handle both absolute and relative paths
                    return new Request(url, { cache: 'reload' });
                })).catch(err => {
                    console.warn('[SW] Some assets failed to cache:', err);
                });
            })
            .then(() => {
                console.log('[SW] Installation complete');
                return self.skipWaiting();
            })
    );
});

// Aktivierung - Alte Caches löschen
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating Service Worker...');

    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((name) => name !== CACHE_NAME)
                        .map((name) => {
                            console.log('[SW] Deleting old cache:', name);
                            return caches.delete(name);
                        })
                );
            })
            .then(() => {
                console.log('[SW] Activation complete');
                return self.clients.claim();
            })
    );
});

// Fetch-Strategie
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Skip chrome-extension and other non-http(s) requests
    if (!url.protocol.startsWith('http')) {
        return;
    }

    // Strategie basierend auf Request-Typ
    if (isStaticAsset(url)) {
        // Cache-First für statische Assets
        event.respondWith(cacheFirst(request));
    } else if (isAPIRequest(url)) {
        // Network-First für API-Requests mit Fallback
        event.respondWith(networkFirst(request));
    } else {
        // Stale-While-Revalidate für andere Requests
        event.respondWith(staleWhileRevalidate(request));
    }
});

// Prüfen ob statisches Asset
function isStaticAsset(url) {
    const staticExtensions = ['.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2'];
    return staticExtensions.some(ext => url.pathname.endsWith(ext)) ||
           url.pathname === '/' ||
           url.pathname.endsWith('.html');
}

// Prüfen ob API-Request
function isAPIRequest(url) {
    return url.pathname.includes('/api/') ||
           API_CACHE_PATTERNS.some(pattern => pattern.test(url.href));
}

// Cache-First Strategie
async function cacheFirst(request) {
    const cached = await caches.match(request);
    if (cached) {
        return cached;
    }

    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, response.clone());
        }
        return response;
    } catch (error) {
        console.warn('[SW] Cache-first fetch failed:', request.url);
        return new Response('Offline - Asset nicht verfügbar', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

// Network-First Strategie (für API)
async function networkFirst(request) {
    try {
        const response = await fetch(request);

        // Cache successful API responses
        if (response.ok) {
            const cache = await caches.open(CACHE_NAME + '-api');
            cache.put(request, response.clone());
        }

        return response;
    } catch (error) {
        console.log('[SW] Network failed, trying cache:', request.url);

        // Try cache
        const cached = await caches.match(request);
        if (cached) {
            // Return cached response with offline indicator
            const headers = new Headers(cached.headers);
            headers.set('X-From-Cache', 'true');
            return new Response(cached.body, {
                status: cached.status,
                statusText: cached.statusText,
                headers
            });
        }

        // Return offline response
        return new Response(JSON.stringify({
            error: 'offline',
            message: 'Sie sind offline. Daten werden geladen sobald die Verbindung wiederhergestellt ist.',
            cached: false
        }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// Stale-While-Revalidate Strategie
async function staleWhileRevalidate(request) {
    const cached = await caches.match(request);

    const fetchPromise = fetch(request)
        .then((response) => {
            if (response.ok) {
                const cache = caches.open(CACHE_NAME);
                cache.then(c => c.put(request, response.clone()));
            }
            return response;
        })
        .catch(() => null);

    return cached || fetchPromise || new Response('Offline', { status: 503 });
}

// Background Sync für Offline-Aktionen
self.addEventListener('sync', (event) => {
    console.log('[SW] Background sync:', event.tag);

    if (event.tag === 'sync-inventur') {
        event.waitUntil(syncInventurData());
    } else if (event.tag === 'sync-messages') {
        event.waitUntil(syncMessages());
    }
});

async function syncInventurData() {
    // Get pending inventur actions from IndexedDB
    console.log('[SW] Syncing inventur data...');
    // Implementation would use IndexedDB to store/retrieve pending actions
}

async function syncMessages() {
    console.log('[SW] Syncing messages...');
}

// Push Notifications
self.addEventListener('push', (event) => {
    console.log('[SW] Push received:', event);

    const options = {
        body: event.data ? event.data.text() : 'Neue Benachrichtigung',
        icon: '/assets/orca-logo.svg',
        badge: '/assets/orca-logo.svg',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            { action: 'open', title: 'Öffnen' },
            { action: 'close', title: 'Schließen' }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('ORCA 2.0', options)
    );
});

// Notification Click Handler
self.addEventListener('notificationclick', (event) => {
    console.log('[SW] Notification click:', event.action);

    event.notification.close();

    if (event.action === 'open' || !event.action) {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Message Handler für Kommunikation mit Main Thread
self.addEventListener('message', (event) => {
    console.log('[SW] Message received:', event.data);

    if (event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data.type === 'CACHE_URLS') {
        caches.open(CACHE_NAME).then(cache => {
            cache.addAll(event.data.urls);
        });
    }

    if (event.data.type === 'CLEAR_CACHE') {
        caches.delete(CACHE_NAME).then(() => {
            console.log('[SW] Cache cleared');
        });
    }
});

console.log('[SW] Service Worker loaded');
