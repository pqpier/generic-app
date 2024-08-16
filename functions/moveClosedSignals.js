const functions = require("firebase-functions");
const admin = require("firebase-admin");

if (admin.apps.length === 0) {
  admin.initializeApp();
}

exports.moveClosedSignals = functions.https.onRequest(async (req, res) => {
  try {
    const db = admin.firestore();
    const signalsRef = db.collection("signals");
    const closedSignalsRef = db.collection("closedSignals");
    const snapshot = await signalsRef.where("closedAt", "!=", null).get();

    if (snapshot.empty) {
      console.log("No matching documents.");
      return res.status(200).send("No matching documents.");
    }

    const batch = db.batch();
    snapshot.forEach((doc) => {
      const data = doc.data();
      batch.set(closedSignalsRef.doc(doc.id), data);
      batch.delete(doc.ref);
    });

    await batch.commit();
    console.log("Successfully moved closed signals.");
    return res.status(200).send("Successfully moved closed signals.");
  } catch (error) {
    console.error("Error moving closed signals:", error);
    return res.status(500).send("Error moving closed signals.");
  }
});
