const functions = require("firebase-functions");
const admin = require("firebase-admin");

if (admin.apps.length === 0) {
  admin.initializeApp();
}

const db = admin.firestore();

exports.checkUsersAndReferrals = functions.https.onRequest(async (req, res) => {
  try {
    // Contar o número de usuários com plan.status igual a "active"
    const activeUsersSnapshot = await db
      .collection("users")
      .where("plan.status", "==", "active")
      .get();
    const activeUsersCount = activeUsersSnapshot.size;

    // Contar o número de documentos na coleção referrals
    const referralsSnapshot = await db.collection("referrals").get();
    const referralsCount = referralsSnapshot.size;

    // Retornar as contagens na resposta
    return res.status(200).json({
      activeUsers: activeUsersCount,
      referrals: referralsCount,
    });
  } catch (error) {
    console.error("Erro ao contar documentos:", error);
    return res.status(500).send("Erro ao processar a solicitação.");
  }
});
