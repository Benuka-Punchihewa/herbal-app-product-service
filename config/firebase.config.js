const FirebaseAdmin = require("firebase-admin");
const gCloudServiceAccountCredentials = require("./gcloud-service-account.json");

// init firebase admin
FirebaseAdmin.initializeApp({
  credential: FirebaseAdmin.credential.cert(gCloudServiceAccountCredentials),
});

module.exports = {
  FirebaseAdmin,
};
