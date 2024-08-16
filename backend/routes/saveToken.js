const express = require("express");
const { messaging, firestore } = require("../firebaseinit");
const { getMessaging } = require("firebase/messaging");

const router = express.Router();

const verifyToken = async (req, res, next) => {
  const token = req.headers.authentication.split(" ")[1];

  let claims;
  try {
    claims = await auth.verifyIdToken(token, true);
    req.body.claims = claims;
  } catch (error) {
    console.log(error);
  }

  req.body.userId = claims.uid;

  next();
};

router.post("/", verifyToken, async (req, res) => {
  const userId = req.body.userId;
  const token = req.body.token;

  try {
    await firestore.collection("tokens").doc(userId).set({ token });
    try {
      const response = await getMessaging().subscribeToTopic(token, "all");
      console.log("Inscrição no tópico:", response);
    } catch (error) {
      console.error("Erro ao inscrever no tópico:", error);
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("Erro ao salvar token:", error);
    res.status(500).send("Erro ao salvar token");
  }
});

module.exports = router;
