const express = require("express");
const { messaging } = require("../firebaseinit");

const router = express.Router();

router.post("/", verifyToken, async (req, res) => {
  const ticker = req.body.ticker;

  const message = {
    notification: {
      title: "Nova oportunidade de negociação",
      body: `${ticker} - Clique para ver`,
    },
    topic: "all",
  };

  try {
    const response = await messaging.send(message);
    console.log("Mensagem enviada com sucesso:", response);
    res.sendStatus(200);
  } catch (error) {
    console.error("Erro ao enviar mensagem:", error);
    res.status(500).send("Erro ao enviar mensagem");
  }
});

module.exports = router;
