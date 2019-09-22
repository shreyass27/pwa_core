var defferedPrompt = null;
if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('/serviceWorker.js')
        .then(function () {
            console.log('_________Service Worker Registered__________');
        });

    window.addEventListener("beforeinstallprompt", function (event) {
        console.log('addEventListener("beforeinstallprompt" event', event);
        event.preventDefault();
        defferedPrompt = event;
    });


    // To unregister service workers if required
    // navigator.serviceWorker.getRegistrations().then(function (registrations) {
    //     for (let registration of registrations) {
    //         registration.unregister()
    //     }
    // })
}