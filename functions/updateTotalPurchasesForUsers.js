const functions = require("firebase-functions");
const admin = require("firebase-admin");

if (admin.apps.length === 0) {
  admin.initializeApp();
}

const db = admin.firestore();

exports.updateTotalPurchasesForReferrals = functions.https.onRequest(
  async (req, res) => {
    try {
      const referralsSnapshot = await db.collection("referrals").get();

      if (referralsSnapshot.empty) {
        return res
          .status(200)
          .send("Nenhum documento encontrado na coleção referrals.");
      }

      let updatedCount = 0;

      // Filtrar documentos que não têm o campo 'processed' ou onde 'processed' é null
      const unprocessedDocs = referralsSnapshot.docs.filter(
        (doc) =>
          (doc.data().processed === undefined ||
            doc.data().processed === null) &&
          doc.data().checkoutLink
      );

      // Percorra cada documento que ainda não foi processado
      for (const referralDoc of unprocessedDocs) {
        const referralData = referralDoc.data();
        const referrerId = referralData.referrerId;

        if (referrerId) {
          const rewardPurchasesSnapshot = await db
            .collection("rewardPurchases")
            .where("referrerId", "==", referrerId)
            .get();

          const referralRef = db.collection("referrals").doc(referralDoc.id);

          if (!rewardPurchasesSnapshot.empty) {
            const totalPurchases = rewardPurchasesSnapshot.size;

            // Atualizar o totalPurchases e marcar como processado
            await referralRef.update({
              totalPurchases:
                admin.firestore.FieldValue.increment(totalPurchases),
              processed: true,
            });

            updatedCount++;
          } else {
            await referralRef.update({
              processed: true,
            });
          }
        }
      }

      return res
        .status(200)
        .send(
          `${updatedCount} documentos de referrals atualizados com totalPurchases.`
        );
    } catch (error) {
      console.error("Erro ao atualizar totalPurchases:", error);
      return res.status(500).send("Erro ao processar a solicitação.");
    }
  }
);
