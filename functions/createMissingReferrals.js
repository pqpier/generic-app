const functions = require("firebase-functions");
const admin = require("firebase-admin");
const generateReferrerId = require("./utils/generateReferrerId");

if (admin.apps.length === 0) {
  admin.initializeApp();
}

const db = admin.firestore();

exports.createMissingReferrals = functions.https.onRequest(async (req, res) => {
  try {
    // Carrega todos os IDs de referrals existentes em memória
    const referralsSnapshot = await db.collection("referrals").get();
    const existingReferralIds = new Set(
      referralsSnapshot.docs.map((doc) => doc.id)
    );

    // Obtenha todos os usuários com plan.status igual a "active"
    const usersSnapshot = await db
      .collection("users")
      .where("plan.status", "==", "active")
      .get();

    if (usersSnapshot.empty) {
      return res.status(200).send("Nenhum usuário com plano ativo encontrado.");
    }

    let createdCount = 0;
    const batch = db.batch();

    // Verifique cada usuário e adicione novos referrals se necessário
    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;

      // Verifique se o ID do usuário já existe na coleção referrals
      if (!existingReferralIds.has(userId)) {
        // Crie o documento na coleção referrals no batch
        const referrerId = generateReferrerId();
        const referralRef = db.collection("referrals").doc(userId);
        batch.set(referralRef, {
          id: userId,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          acceptedTerms: false,
          referrerId,
        });
        createdCount++;
      }
    }

    // Execute o batch
    await batch.commit();

    return res
      .status(200)
      .send(`${createdCount} documentos de referência criados com sucesso.`);
  } catch (error) {
    console.error("Erro ao criar referências:", error);
    return res.status(500).send("Erro ao processar a solicitação.");
  }
});
