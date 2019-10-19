
var deferredPrompt;
var enableNotificationButton = document.getElementsByClassName('enable-notifications');

if (!window.Promise) {
  window.Promise = Promise;
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/sw.js')
    .then(function () {
      console.log('Service worker registered!');
    })
    .catch(function (err) {
      console.log(err);
    });
}

window.addEventListener('beforeinstallprompt', function (event) {
  console.log('beforeinstallprompt fired');
  event.preventDefault();
  deferredPrompt = event;
  return false;
});

function displayNotification() {
  if ('serviceWorker' in navigator) {
    // Notification options 
    var options = {
      body: `You have successfully subcribed to ${window.origin} notification service.`,
      icon: '/src/images/icons/app-icon-96x96.png',
      image: '/src/images/sf-boat.jpg',
      dir: 'ltr',
      lang: 'en-US',
      vibrate: [100, 500, 200],
      badge: '/src/images/icons/app-icon-96x96.png',
      // Set different tags for different types of nitfications.
      tag: 'confirm-notification',
      // To renotify in Notification with same tag is stacked again.
      renotify: true,
      actions: [
        { action: 'confirm', title: 'Okay', icon: '/src/images/icons/app-icon-96x96.png' },
        { action: 'cancel', title: 'Cancel', icon: '/src/images/icons/app-icon-96x96.png' }
      ]
    };
    navigator.serviceWorker.ready
      .then(function (swReg) {
        swReg.showNotification('Successfully Subscribed (SW)', options)
      })
    // new Notification('Successfully Subscribed', options);
  }
}

function configPushSub() {
  if (!('serviceWorker' in navigator)) {
    return
  }
  var serviceWorkerReg;
  navigator.serviceWorker.ready
    .then(function (swReg) {
      serviceWorkerReg = swReg;
      return swReg.pushManager.getSubscription();
    })
    .then(function (sub) {
      if (!sub) {
        // Create new Sub
        var vapidPubKey = 'BG9r2fuBnFikE62zEDd4ru72jF3LZlOcnz1RIOUa9mZOGXBPCeDse9b3U3Lhw4OM8U4Sqkz8HpTUAkVI9E9dTsY';

        var convertVpidPubKey = urlBase64ToUint8Array(vapidPubKey);
        return serviceWorkerReg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertVpidPubKey
        });
      } else {
        // We have sub
      }
    })
    .then(function (newSub) {
      return fetch('https://pwa-gram-project-id.firebaseio.com/subscriptions.json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(newSub)
      })
    })
    .then(function (res) {
      if (res.ok) {
        displayNotification();
      }
    })
    .catch(function (error) {
      console.log('Error in configPushSub promise chain', error);
    })

}

function askForNofiPerm() {
  Notification.requestPermission(function (result) {
    console.log('User Choice', result);

    if (result !== 'granted') {
      console.log('User Permission denied', result);
    } else {
      configPushSub();
      // displayNotification();
      for (var i = 0; i < enableNotificationButton.length; i++) {
        enableNotificationButton[i].style.display = 'none';
      }
    }
  })
}

if ('Notification' in window) {
  for (var i = 0; i < enableNotificationButton.length; i++) {
    enableNotificationButton[i].style.display = 'inline';
    enableNotificationButton[i].addEventListener('click', askForNofiPerm)
  }
}

