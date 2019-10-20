
/*
var functions = require('firebase-functions');
var admin = require('firebase-admin');

var cors = require('cors')({ origin: true });
var webPush = require('web-push');
var formidable = require('formidable');
var fs = require('fs');
var UUID = require('uuid-v4')
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//

var gcConfig = {
    projectId: 'pwa-gram-project-id',
    keyFilename: 'adminsdk.json'
};

var gcs = require('@google-cloud/storage')(gcConfig);

var serviceAccount = require("./adminsdk.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://pwa-gram-project-id.firebaseio.com"
});

exports.storePostData = functions.https.onRequest((req, res) => {
    cors(req, res, function () {
        var uuid = UUID();
        var formData = new formidable.IncomingForm();
        formData.parse(req, function (err, fields, files) {     
            fs.rename(files.file.path, '/tmp/' + files.file.name);
            var bucket = gcs.bucket('pwa-gram-project-id.appspot.com');

            bucket.upload('/tmp/' + files.file.name, {
                uploadType: 'media',
                metadata: {
                    metadata: {
                        contentType: files.file.type,
                        firebaseStorageDownloadTokens: uuid
                    }
                }
            }, function (err, title) {
                if (!err) {
                    admin.database().ref('posts').push({
                        id: fields.id,
                        title: fields.title,
                        location: fields.location,
                        image: 'https://firebasestorage.googleapis.com/v0/b/' + bucket.name + '/o/' + encodeURIComponent(files.file.name)
                            + '?alt=media&token=' + uuid
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
                                id: fields.id
                            })
                        })
                        .catch(function (err) {
                            res.status(500).json({ error: err })
                        })
                } else {
                    console.log('error uploading file to gcs', err);
                }
            })
        });
    })
});

*/

var functions = require("firebase-functions");
var admin = require("firebase-admin");
var cors = require("cors")({ origin: true });
var webPush = require('web-push');
// var formidable = require("formidable");
var fs = require("fs");
var UUID = require("uuid-v4");
var os = require("os");
var Busboy = require("busboy");
var path = require('path');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//


var gcConfig = {
    projectId: 'pwa-gram-project-id',
    keyFilename: 'adminsdk.json'
};

var gcs = require('@google-cloud/storage')(gcConfig);

var serviceAccount = require("./adminsdk.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://pwa-gram-project-id.firebaseio.com"
});

exports.storePostData = functions.https.onRequest(function (request, response) {
    cors(request, response, function () {
        var uuid = UUID();

        const busboy = new Busboy({ headers: request.headers });
        // These objects will store the values (file + fields) extracted from busboy
        let upload;
        const fields = {};

        // This callback will be invoked for each file uploaded
        busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
            console.log(
                `File [${fieldname}] filename: ${filename}, encoding: ${encoding}, mimetype: ${mimetype}`
            );
            const filepath = path.join(os.tmpdir(), filename);
            upload = { file: filepath, type: mimetype };
            file.pipe(fs.createWriteStream(filepath));
        });

        // This will invoked on every field detected
        busboy.on('field', function (fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
            fields[fieldname] = val;
        });

        // This callback will be invoked after all uploaded files are saved.
        busboy.on("finish", () => {
            var bucket = gcs.bucket("pwa-gram-project-id.appspot.com");
            bucket.upload(
                upload.file,
                {
                    uploadType: "media",
                    metadata: {
                        metadata: {
                            contentType: upload.type,
                            firebaseStorageDownloadTokens: uuid
                        }
                    }
                },
                function (err, uploadedFile) {
                    if (!err) {
                        const objectPush = {
                            id: fields.id,
                            title: fields.title,
                            location: fields.location,
                            rawLocationLat: fields.rawLocationLat,
                            rawLocationLong: fields.rawLocationLong,
                            image:
                                "https://firebasestorage.googleapis.com/v0/b/" +
                                bucket.name +
                                "/o/" +
                                encodeURIComponent(uploadedFile.name) +
                                "?alt=media&token=" +
                                uuid
                        };
                        admin
                            .database()
                            .ref("posts")
                            .push(objectPush)
                            .then(function () {
                                console.log('Post posted to DB');
                                webPush.setVapidDetails('mailto:shreyastroy369@outlook.com',
                                    'BG9r2fuBnFikE62zEDd4ru72jF3LZlOcnz1RIOUa9mZOGXBPCeDse9b3U3Lhw4OM8U4Sqkz8HpTUAkVI9E9dTsY',
                                    'vgBZIIgiPZSoEciE8eFVY4tPEHE81wpyG66PRYHS7tI');

                                console.log('webPush Id Set');
                                return admin
                                    .database()
                                    .ref("subscriptions")
                                    .once("value");
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

                                    webPush
                                        .sendNotification(
                                            pushConfig,
                                            JSON.stringify({
                                                title: "New Post",
                                                content: "New Post added!",
                                                openUrl: "/help"
                                            })
                                        )
                                        .catch(function (err) {
                                            console.log(err);
                                        });
                                });
                                console.log('Notification Sent');
                                response
                                    .status(201)
                                    .json({ message: "Data stored", ...objectPush });
                                console.log('Response Sent');
                            })
                            .catch(function (err) {
                                console.log('Error in API, err', err);
                                response.status(500).json({ error: err });
                            });
                    } else {
                        console.log(err);
                    }
                }
            );
        });

        // The raw bytes of the upload will be in request.rawBody.  Send it to busboy, and get
        // a callback when it's finished.
        busboy.end(request.rawBody);
        // formData.parse(request, function(err, fields, files) {
        //   fs.rename(files.file.path, "/tmp/" + files.file.name);
        //   var bucket = gcs.bucket("pwa-gram-project-id.appspot.com");
        // });
    });
});
