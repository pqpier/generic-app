const express = require("express");
const { auth, messaging } = require("../firebaseinit");

const router = express.Router();

const verifyToken = async (req, res, next) => {
  const token = req.headers.authentication.split(" ")[1];

  if (token !== "codigo_secreto") {
    return res.status(403).json({
      success: false,
      message: "Acesso não permitido.",
    });
  }

  next();
};

router.post("/", async (req, res) => {
  const message = {
    data: {
      title: "Título da mensagem",
      body: "Corpo da mensagem",
    },
    topic: "all",
  };

  messaging
    .send(message)
    .then((response) => {
      res.status(200).send("Mensagem enviada com sucesso: " + response);
    })
    .catch((error) => {
      res.status(500).send("Erro ao enviar mensagem: " + error);
    });

  return res.status(200).json({
    success: true,
  });
});

module.exports = router;
