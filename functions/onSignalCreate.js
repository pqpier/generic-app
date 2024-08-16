const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");

if (admin.apps.length === 0) {
  admin.initializeApp();
}

exports.onSignalCreate = functions.firestore
  .document("signals/{signalId}")
  .onCreate(async (snap, context) => {
    const signalData = snap.data();

    if (signalData.ticker === "TESTE") {
      return null;
    }

    const url = "https://api.solydapp.com/v1/broadcast";
    const url2 = "https://gate.whapi.cloud/messages/text";

    const data = {
      ticker: signalData.ticker,
    };

    try {
      const response = await axios.post(url, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${functions.config().private.key}`,
        },
      });

      console.log(response);
    } catch (error) {
      console.error("Error broadcasting signal:", error);
    }

    const data2 = {
      to: "120363315861559683@g.us",
      body: `Nova oportunidade de negociação disponível no app: *${signalData.ticker}* 🤑`,
    };

    try {
      const response2 = await axios.post(url2, data2, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${functions.config().whapi.token}`,
        },
      });

      console.log(response2);
    } catch (error) {
      console.error("Error broadcasting signal:", error);
    }

    return null;
  });
