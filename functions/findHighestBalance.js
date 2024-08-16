const functions = require("firebase-functions");
const admin = require("firebase-admin");

if (admin.apps.length === 0) {
  admin.initializeApp();
}

const db = admin.firestore();

exports.findHighestBalances = functions.https.onRequest(async (req, res) => {
  try {
    const usersSnapshot = await db.collection("users").get();

    if (usersSnapshot.empty) {
      return res.status(404).json({ message: "No users found." });
    }

    const threshold = 2500;
    const balances = [];

    usersSnapshot.forEach((userDoc) => {
      const userData = userDoc.data();
      const balance = parseFloat(userData.balance) || 0; // Converter o saldo para número

      if (balance > threshold) {
        balances.push({
          balance,
          name: userData.name,
          email: userData.email,
          planStatus: userData.plan?.status || "N/A",
        });
      }
    });

    // Ordenar o array pelo saldo em ordem decrescente
    balances.sort((a, b) => b.balance - a.balance);

    if (balances.length === 0) {
      return res
        .status(404)
        .json({ message: "No balances above the threshold found." });
    }

    return res.status(200).json(balances);
  } catch (error) {
    console.error("Error finding balances:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});
