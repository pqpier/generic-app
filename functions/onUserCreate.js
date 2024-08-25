const functions = require("firebase-functions");
const admin = require("firebase-admin");
const generateReferrerId = require("./utils/generateReferrerId");

if (admin.apps.length === 0) {
  admin.initializeApp();
}

exports.onUserCreate = functions.firestore
  .document("users/{userId}")
  .onCreate(async (snap, context) => {
    const userData = snap.data();
    const userRef = snap.ref;
    const userId = context.params.userId;
    const refId = generateReferrerId();

    // Create a document on referrals collection with the same userId
    try {
      await admin.firestore().collection("referrals").doc(userId).set({
        id: userId,
        createdAt: new Date(),
        acceptedTerms: false,
        referrerId: refId,
      });
    } catch (error) {
      console.error("Error creating referral:", error);
      return {
        success: false,
        message: "Error creating referral " + userData.email,
      };
    }

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

    // Find document on referrals collection where field referrerId is equal to referrerId, then get the document ID and update the totalPurchases field incrementing 1
    try {
      const querySnapshot = await admin
        .firestore()
        .collection("referrals")
        .where("referrerId", "==", referrerId)
        .get();

      if (!querySnapshot.empty) {
        const referralDoc = querySnapshot.docs[0];
        const referralId = referralDoc.id;

        await admin
          .firestore()
          .collection("referrals")
          .doc(referralId)
          .update({
            totalPurchases: admin.firestore.FieldValue.increment(1),
          });
      }
    } catch (
      error // Error updating totalPurchases field on referral document
    ) {
      console.error("Error updating totalPurchases field:", error);
      return {
        success: false,
        message: "Error updating totalPurchases field " + userData.email,
      };
    }

    let currentVersion;
    try {
      const appVersionDoc = await admin
        .firestore()
        .collection("appVersion")
        .doc("current")
        .get();
      if (appVersionDoc.exists) {
        currentVersion = appVersionDoc.data().version; // Supondo que o campo se chame "version"
      } else {
        currentVersion = "unknown"; // Valor padrão caso o documento não exista
      }
    } catch (error) {
      console.error("Error retrieving app version:", error);
      currentVersion = "unknown"; // Valor padrão em caso de erro
    }

    // Atualiza o documento do usuário com a versão obtida
    try {
      await userRef.update({
        appVersion: currentVersion,
      });
    } catch (error) {
      console.error("Error updating user with app version:", error);
      return {
        success: false,
        message: "Error updating user with app version " + userData.email,
      };
    }

    return {
      success: true,
      message: "Successfully created reward purchase " + userData.email,
    };
  });
