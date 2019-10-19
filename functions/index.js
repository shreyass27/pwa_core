var functions = require('firebase-functions');
var admin = require('firebase-admin');

var cors = require('cors')({ origin: true });
var webPush = require('web-push');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//

var serviceAccount = require("./adminsdk.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://pwa-gram-project-id.firebaseio.com"
});

exports.storePostData = functions.https.onRequest((req, res) => {
    cors(req, res, function () {
        admin.database().ref('posts').push({
            id: req.body.id,
            title: req.body.title,
            location: req.body.location,
            image: req.body.image
        })
            .then(function () {
                webPush.setVapidDetails('mailto:shreyastroy369@outlook.com',
                    'BG9r2fuBnFikE62zEDd4ru72jF3LZlOcnz1RIOUa9mZOGXBPCeDse9b3U3Lhw4OM8U4Sqkz8HpTUAkVI9E9dTsY',
                    'vgBZIIgiPZSoEciE8eFVY4tPEHE81wpyG66PRYHS7tI');
                return admin.database().ref('subscriptions').once('value');
            })
            .then(function (subscriptions) {
                subscriptions.forEach(function (sub) {
                    var pushConfig = {
                        endpoint: sub.val().endpoint,
                        keys: {
                            auth: sub.val().keys.auth,
                            p256dh: sub.val().keys.p256dh
                        }
                    };
                    webPush.sendNotification(pushConfig, JSON.stringify({
                        title: 'New Post',
                        content: 'New Post Added',
                        openUrl: '/help'
                    }))
                        .catch(function (error) {
                            console.log('webPush.sendNotification', error)
                        })
                })
                res.status(201).json({
                    message: 'Data Stored',
                    id: req.body.id
                })
            })
            .catch(function (err) {
                res.status(500).json({ error: err })
            })
    })
});
