const functions = require('firebase-functions');
const admin = require('firebase-admin');

const cors = require('cors')({origin: true});

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//

const serviceAccount = require("./adminsdk.json");

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
