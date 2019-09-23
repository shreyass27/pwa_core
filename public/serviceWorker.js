const logger = function(...details) {
    console.log('[Service Worker]', ...details);
};


self.addEventListener("install", function(event){
    logger('Installing Service Worker...', event);
});

self.addEventListener("activate", function(event){
    logger('Activating Service Worker...', event);
    return self.clients.claim();
});

self.addEventListener("fetch", function(event){
    event.respondWith(fetch(event.request))
});
