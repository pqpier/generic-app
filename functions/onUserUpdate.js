const functions = require("firebase-functions");
const admin = require("firebase-admin");

if (admin.apps.length === 0) {
  admin.initializeApp();
}

exports.onReferralUpdate = functions.firestore
  .document("users/{userId}")
  .onUpdate(async (change, context) => {
    const oldValue = change.before.data();
    const newValue = change.after.data();

    if (!oldValue.isReferral) {
      return null;
    }

    if (oldValue.plan.status === newValue.plan.status) {
      return null;
    }

    if (
      oldValue.plan.status === "active" &&
      (newValue.plan.status === "refunded" ||
        newValue.plan.status === "chargedback")
    ) {
      const referrerId =
        oldValue.referrer.split("-")[2] + "-" + oldValue.referrer.split("-")[3];

      try {
        const referralDoc = await admin
          .firestore()
          .collection("referrals")
          .where("referrerId", "==", referrerId)
          .get();

        if (referralDoc.empty) {
          return {
            success: false,
            message: "No referral found for referrerId " + referrerId,
          };
        }

        const referralId = referralDoc.docs[0].id;

        if (newValue.plan.status === "refunded") {
          await admin
            .firestore()
            .collection("referrals")
            .doc(referralId)
            .update({
              totalRefunds: admin.firestore.FieldValue.increment(1),
            });
        } else {
          await admin
            .firestore()
            .collection("referrals")
            .doc(referralId)
            .update({
              totalChargebacks: admin.firestore.FieldValue.increment(1),
            });
        }

        return {
          success: true,
          message:
            "Successfully updated totalRefunds for referral " + referralId,
        };
      } catch (error) {
        console.error("Error updating totalRefunds:", error);
        return {
          success: false,
          message: "Error updating totalRefunds for referrerId " + referrerId,
        };
      }
    }

    return null;
  });
