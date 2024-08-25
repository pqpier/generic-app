const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");

if (admin.apps.length === 0) {
  admin.initializeApp();
}

exports.onSignalUpdate = functions.firestore
  .document("signals/{signalId}")
  .onUpdate(async (change, context) => {
    const newValue = change.after.data();
    const previousValue = change.before.data();
    const signalId = context.params.signalId;

    if (newValue.processed) {
      return null;
    }

    if (newValue.status === "closed on profit") {
      // Atualizar trades que correspondem ao signalId
      const tradesSnapshot = await admin
        .firestore()
        .collection("trades")
        .where("signalId", "==", signalId)
        .get();

      const batch = admin.firestore().batch();

      tradesSnapshot.forEach((doc) => {
        const tradeRef = doc.ref;
        batch.update(tradeRef, {
          hitTp: new Date(),
          closedAt: new Date(),
          status: "closed on profit",
        });
      });

      // Procura outros signals com o mesmo ticker e TP
      const signalsSnapshot = await admin
        .firestore()
        .collection("signals")
        .where("ticker", "==", previousValue.ticker)
        .where("takeProfit", "==", previousValue.takeProfit)
        .where("status", "!=", "closed on profit")
        .get();

      signalsSnapshot.forEach((doc) => {
        const signalRef = doc.ref;
        batch.update(signalRef, {
          hitTp: new Date(),
          closedAt: new Date(),
          status: "closed on profit",
          processed: true,
        });
      });

      try {
        await batch.commit();
        console.log("Trades updated successfully.");
      } catch (error) {
        console.error("Error updating trades:", error);
      }

      if (previousValue.ticker === "TESTE") {
        return null;
      }

      if (newValue.silenced) {
        return null;
      }

      const url = "https://gate.whapi.cloud/messages/text";
      const data = {
        to: "120363315861559683@g.us",
        body: `Operação fechada no lucro: *${previousValue.ticker}* com TP em ${previousValue.takeProfit} ✅ 💚 `,
      };

      try {
        const response = await axios.post(url, data, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${functions.config().whapi.token}`,
          },
        });

        console.log(response);
      } catch (error) {
        console.error("Error broadcasting signal:", error);
      }
    }

    return null;
  });
