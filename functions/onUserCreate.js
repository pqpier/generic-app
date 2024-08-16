const functions = require("firebase-functions");
const admin = require("firebase-admin");

if (admin.apps.length === 0) {
  admin.initializeApp();
}

exports.onUserCreate = functions.firestore
  .document("users/{userId}")
  .onCreate(async (snap, context) => {
    const userData = snap.data();
    const userId = context.params.userId;
    if (userData.isReferral !== true) {
      return {
        success: true,
        message: "Successfully created user " + userData.email,
      };
    }

    const referrer = userData.referrer;
    const referrerId = referrer.split("-")[2] + "-" + referrer.split("-")[3];

    try {
      await admin.firestore().collection("rewardPurchases").doc(userId).set({
        buyer_email: userData.email,
        buyer_id: userId,
        referrer: referrer,
        referrerId: referrerId,
        purchase_date: new Date(),
      });
    } catch (error) {
      console.error("Error creating reward purchase:", error);
      return {
        success: false,
        message: "Error creating reward purchase " + userData.email,
      };
    }

    return {
      success: true,
      message: "Successfully created reward purchase " + userData.email,
    };
  });
