const functions = require("firebase-functions");
const admin = require("firebase-admin");
const generateReferrerId = require("./utils/generateReferrerId");

if (admin.apps.length === 0) {
  admin.initializeApp();
}

const db = admin.firestore();

exports.addMissingReferrerIds = functions.https.onRequest(async (req, res) => {
  try {
    const referralsSnapshot = await db.collection("referrals").get();

    if (referralsSnapshot.empty) {
      return res
        .status(200)
        .send("Nenhum documento encontrado na coleção referrals.");
    }

    let updatedCount = 0;
    const batch = db.batch();

    // Percorra cada documento na coleção referrals
    referralsSnapshot.forEach((referralDoc) => {
      const referralData = referralDoc.data();

      // Verifique se o campo referrerId está ausente
      if (!referralData.referrerId) {
        const refId = generateReferrerId();
        // Atualize o documento no batch para incluir referrerId com o valor 123
        const referralRef = db.collection("referrals").doc(referralDoc.id);
        batch.update(referralRef, { referrerId: refId });
        updatedCount++;
      }
    });

    // Execute o batch
    await batch.commit();

    return res
      .status(200)
      .send(`${updatedCount} documentos atualizados com referrerId.`);
  } catch (error) {
    console.error("Erro ao atualizar documentos:", error);
    return res.status(500).send("Erro ao processar a solicitação.");
  }
});
