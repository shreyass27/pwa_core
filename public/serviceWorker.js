const logger = function (...details) {
    console.log('[Service Worker] ', ...details);
};

const CACHE_STATIC_NAME = 'static_v2';
const CACHE_DYNAMIC_NAME = 'dynamic_v2';

function isCacheableRequest(url) {
    url = url ? url.toLowerCase() : '';
    return (url.includes('https') || url.includes('http'));
}

self.addEventListener("install", function (event) {
    logger('Installing Service Worker...', event);

    event.waitUntil(
        caches.open(CACHE_STATIC_NAME)
            .then(function (cache) {
                logger('Precaching App shell', cache);
                cache.addAll([
                    "/",
                    "/index.html",
                    "/offline.html",
                    "/src/js/app.js",
                    "/src/js/feed.js",
                    "/src/js/promise.js",
                    "/src/js/fetch.js",
                    "/src/js/material.min.js",
                    "/src/css/app.css",
                    "/src/css/feed.css",
                    "/src/images/main-image.jpg",
                    "https://fonts.googleapis.com/css?family=Roboto:400,700",
                    "https://fonts.googleapis.com/icon?family=Material+Icons",
                    "https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css"
                ]);
            })
    )
});

// Runs online when no tabs or already running tab is close
// Good place for clean up as it will only run once currently running app is closed
self.addEventListener("activate", function (event) {
    logger('Activating Service Worker...', event);

    event.waitUntil(
        caches.keys()
            .then(function (keyList) {
                return Promise.all(
                    keyList.map(function (key) {
                        if (key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) {
                            logger('Removing Old Cache, key Name', key);
                            return caches.delete(key);
                        }
                    })
                )
            })
    )
    return self.clients.claim();
});


/*
// Cache with Network fallback strategy 
self.addEventListener("fetch", function (event) {
    event.respondWith(
        // Check if request with response already cached
        caches.match(event.request)
            .then(function (response) {
                if (response) {
                    // return response from cache if present
                    return response;
                } else {
                    // API call for request using fetch
                    return fetch(event.request)
                        // Reponse from API call for request using fetch
                        .then(function (resp) {
                            // Open Caches Storage for storing reponse from API call
                            return caches.open(CACHE_DYNAMIC_NAME)
                                .then(function (cache) {

                                    if (isCacheableRequest(event.request.url)) {
                                        cache.put(event.request.url, resp.clone());
                                    }
                                    return resp;
                                    // Store reponse from API call into Opened Caches Storage 
                                    // Return response 
                                })
                                .catch(function (error) {
                                    logger('Error while Dynamic Caching', error);
                                })
                        })
                        .catch(function (error) {
                            logger('Error while Dynamic Caching', error);
                            return caches.match('/offline.html');
                        })
                }
            })
            .catch(function (error) {
                logger('Error while caching resource', error);
            })
    )
});
*/

/*
// Cache only Strategy  
self.addEventListener("fetch", function (event) {
    event.respondWith(
        // Check if request with response already cached
        caches.match(event.request)
            .catch(function (error) {
                logger('Error while getting cached resource', error);
            })
    )
});
*/

/*
// Network only Strategy  
self.addEventListener("fetch", function (event) {
    event.respondWith(
        // Check if request with response already cached
        fetch(event.request)
            .catch(function (error) {
                logger('Error while getting resource', error);
            })
    )
});
*/


// Network with Cache fallback strategy 
self.addEventListener("fetch", function (event) {
    event.respondWith(
        // Check if request can be fetched
        fetch(event.request)
            .then(function (response) {
                if (response) {
                    // return response from after caching latest response
                    return caches.open(CACHE_DYNAMIC_NAME)
                        .then(function (cache) {
                            if (isCacheableRequest(event.request.url)) {
                                cache.put(event.request.url, response.clone());
                            }
                            // Store reponse from API call into Opened Caches Storage 
                            // Return response 
                            return response;
                        })
                        .catch(function (error) {
                            logger('Error while Dynamic Caching', error);
                        });
                } else {
                    logger('Error while fetching resource', error);
                    return caches.match(event.request);
                }
            })
            .catch(function (error) {
                logger('Error while fetching resource', error);
                return caches.match(event.request);
            })
    )
});
