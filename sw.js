/**
 * Redes Carreras SL - Service Worker
 * PWA para Control de Materiales y Documentos
 * 
 * Este Service Worker proporciona funcionalidad offline
 * y mejora el rendimiento de la aplicación.
 * 
 * @author MiniMax Agent
 * @version 1.0.0
 */

const CACHE_NAME = 'redes-carreras-v1';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';

// Archivos que se cachearán inmediatamente
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/styles.css',
    '/app.js',
    '/sw.js',
    '/manifest.json',
    '/assets/icon.svg',
    '/assets/icon-192.png',
    '/assets/icon-512.png',
    '/libs/jspdf.umd.min.js',
    'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap'
];

// Install Event - Cachea los archivos estáticos
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Instalando...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('[Service Worker] Cacheando archivos estáticos');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('[Service Worker] Archivos estáticos cacheados');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('[Service Worker] Error al cachear estáticos:', error);
            })
    );
});

// Activate Event - Limpia caches antiguos
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activando...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((cacheName) => {
                            // Eliminar caches antiguos
                            return cacheName !== STATIC_CACHE && 
                                   cacheName !== DYNAMIC_CACHE;
                        })
                        .map((cacheName) => {
                            console.log('[Service Worker] Eliminando cache antiguo:', cacheName);
                            return caches.delete(cacheName);
                        })
                );
            })
            .then(() => {
                console.log('[Service Worker] Activado');
                return self.clients.claim();
            })
    );
});

// Fetch Event - Estrategia de cache: Network First, fallback a Cache
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Ignorar solicitudes de Chrome extension y otros protocolos
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        return;
    }

    // Para solicitudes de API o datos externos, usar Network First
    if (url.origin !== location.origin) {
        event.respondWith(networkFirst(request));
        return;
    }

    // Para solicitudes locales, usar Stale While Revalidate
    event.respondWith(staleWhileRevalidate(request));
});

/**
 * Estrategia: Network First
 * Intenta obtener de la red, si falla usa el cache
 */
async function networkFirst(request) {
    try {
        const response = await fetch(request);
        
        // Clonar la respuesta para cachearla
        const responseClone = response.clone();
        
        // Cachear la respuesta exitosa
        const cache = await caches.open(DYNAMIC_CACHE);
        cache.put(request, responseClone);
        
        return response;
    } catch (error) {
        console.log('[Service Worker] Error de red, buscando en cache:', request.url);
        
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Si no hay cache, devolver respuesta de error
        return new Response('Error de conexión', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
                'Content-Type': 'text/plain'
            })
        });
    }
}

/**
 * Estrategia: Stale While Revalidate
 * Devuelve inmediatamente el cache mientras actualiza en background
 */
async function staleWhileRevalidate(request) {
    const cachedResponse = await caches.match(request);
    
    const fetchPromise = fetch(request)
        .then((response) => {
            // Solo cachear respuestas exitosas
            if (response && response.status === 200 && response.type === 'basic') {
                const responseClone = response.clone();
                caches.open(DYNAMIC_CACHE)
                    .then((cache) => {
                        cache.put(request, responseClone);
                    });
            }
            return response;
        })
        .catch((error) => {
            console.log('[Service Worker] Error al actualizar:', error);
            return cachedResponse;
        });
    
    return cachedResponse || fetchPromise;
}

// Message Event - Comunicación con la página
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_CACHE_SIZE') {
        getCacheSize().then((size) => {
            event.ports[0].postMessage({ type: 'CACHE_SIZE', size });
        });
    }
    
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        clearAllCaches().then(() => {
            event.ports[0].postMessage({ type: 'CACHE_CLEARED' });
        });
    }
});

/**
 * Obtiene el tamaño total del cache
 */
async function getCacheSize() {
    const cachesList = await caches.keys();
    let totalSize = 0;
    
    for (const cacheName of cachesList) {
        const cache = await caches.open(cacheName);
        const requests = await cache.keys();
        
        for (const request of requests) {
            const response = await cache.match(request);
            if (response) {
                const blob = await response.clone().blob();
                totalSize += blob.size;
            }
        }
    }
    
    return totalSize;
}

/**
 * Limpia todos los caches
 */
async function clearAllCaches() {
    const cacheNames = await caches.keys();
    await Promise.all(
        cacheNames.map((cacheName) => caches.delete(cacheName))
    );
}

// Push Event - Manejo de notificaciones push
self.addEventListener('push', (event) => {
    console.log('[Service Worker] Push recibido');
    
    let data = {
        title: 'Redes Carreras SL',
        body: 'Recordatorio de caducidad',
        icon: '/assets/icon-192.png',
        badge: '/assets/icon-192.png'
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
            icon: data.icon,
            badge: data.badge,
            tag: data.tag || 'default',
            data: data.data || {},
            requireInteraction: data.requireInteraction || false,
            actions: data.actions || []
        })
    );
});

// Notification Click Event - Manejo de clicks en notificaciones
self.addEventListener('notificationclick', (event) => {
    console.log('[Service Worker] Notificación clickeada');
    
    event.notification.close();
    
    const action = event.action;
    const data = event.notification.data;
    
    // Abrir la aplicación
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // Si ya hay una ventana abierta, enfocarla
                for (const client of clientList) {
                    if (client.url.includes(self.location.origin) && 'focus' in client) {
                        return client.focus();
                    }
                }
                
                // Si no hay ventana abierta, abrir una nueva
                if (clients.openWindow) {
                    return clients.openWindow('/');
                }
            })
    );
});

// Sync Event - Sincronización en background
self.addEventListener('sync', (event) => {
    console.log('[Service Worker] Sync event:', event.tag);
    
    if (event.tag === 'sync-materials') {
        event.waitUntil(syncMaterials());
    }
});

/**
 * Sincroniza materiales (placeholder para futuras extensiones)
 */
async function syncMaterials() {
    // Esta función está preparada para sincronización con servidor
    // cuando se implemente backend
    console.log('[Service Worker] Sincronizando materiales...');
}

// Periodic Sync - Sincronización periódica
self.addEventListener('periodicsync', (event) => {
    console.log('[Service Worker] Periodic Sync:', event.tag);
    
    if (event.tag === 'check-expiry') {
        event.waitUntil(checkExpiryAndNotify());
    }
});

/**
 * Verifica caducidades y envía notificaciones
 */
async function checkExpiryAndNotify() {
    // Esta función se ejecutará periódicamente
    // para verificar materiales que van a caducar
    console.log('[Service Worker] Verificando caducidades...');
    
    // Aquí se implementaría la lógica para verificar
    // materiales y enviar notificaciones del sistema
}

// Error Handler
self.addEventListener('error', (event) => {
    console.error('[Service Worker] Error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
    console.error('[Service Worker] Promise rejection:', event.reason);
});

console.log('[Service Worker] Cargado correctamente');
