const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

const serviceAccount = JSON.parse(
  fs.readFileSync(path.join(__dirname, "./fbServiceAccountKey.json"), "utf-8")
);

const app = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const auth = admin.auth(app);
const firestore = admin.firestore(app);
firestore.settings({ ignoreUndefinedProperties: true });

module.exports = {
  auth,
  firestore,
  Timestamp: admin.firestore.Timestamp,
  messaging: admin.messaging(app),
};
