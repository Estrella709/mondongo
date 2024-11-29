// Segundo Bloque
importScripts('js/sw-utils.js'); // Asegúrate de que este archivo exista

// Primer bloque
const STATIC_CACHE = 'static-v2';
const DYNAMIC_CACHE = 'dynamic-v1';
const INMUTABLE_CACHE = 'inmutable-v1';

const APP_SHELL = [
    'index.html',
    'css/style.css',
    'img/favicon.ico',
    'img/avatars/Ariana.jpg',
    'img/avatars/Bruno.jpg',
    'img/avatars/lana.jpg',
    'img/avatars/Olivia.jpg',
    'img/avatars/Taylor.jpg',
    'js/app.js',
    'js/sw-utils.js'
];

const APP_SHELL_INMUTABLE = [
    'https://fonts.googleapis.com/css?family=Quicksand:300,400',
    'https://fonts.googleapis.com/css?family=Lato:400,300',
    'https://use.fontawesome.com/releases/v5.3.1/css/all.css',
    'css/animate.css',
    'js/libs/jquery.js'
];

// Instalación del Service Worker
self.addEventListener('install', e => {
    const cacheStatic = caches.open(STATIC_CACHE).then(cache =>
        cache.addAll(APP_SHELL).catch(err => {
            console.error('Error al agregar al cache estático:', err);
        })
    );

    const cacheInmutable = caches.open(INMUTABLE_CACHE).then(cache =>
        cache.addAll(APP_SHELL_INMUTABLE).catch(err => {
            console.error('Error al agregar al cache inmutable:', err);
        })
    );

    e.waitUntil(Promise.all([cacheStatic, cacheInmutable]));
});

// Activación del Service Worker
self.addEventListener('activate', e => {
    const respuesta = caches.keys().then(keys => {
        return Promise.all(
            keys.map(key => {
                if (key !== STATIC_CACHE && key.includes('static')) {
                    return caches.delete(key); // Elimina cachés antiguos estáticos
                }
                if (key !== DYNAMIC_CACHE && key.includes('dynamic')) {
                    return caches.delete(key); // Elimina cachés antiguos dinámicos
                }
            })
        );
    });

    e.waitUntil(respuesta);
});

// Manejo del fetch
self.addEventListener('fetch', e => {
    const respuesta = caches.match(e.request).then(res => {
        if (res) {
            return res; // Si existe en caché, devuelve la respuesta
        } else {
            // Si no existe, intenta obtenerlo de la red y actualizar el caché dinámico
            return fetch(e.request)
                .then(newRes => actualizarCacheDinamico(DYNAMIC_CACHE, e.request, newRes))
                .catch(err => {
                    console.error('Error al recuperar de la red:', err);
                });
        }
    });

    e.respondWith(respuesta);
});
