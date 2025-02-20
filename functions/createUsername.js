const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");

if (admin.apps.length === 0) {
  admin.initializeApp();
}

const db = admin.firestore();
const auth = admin.auth();
const app = express();

// Configurações de CORS
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "https://app.seudominio.com", // TODO: Alterar para o seu domínio
    ];
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/", async (req, res) => {
  const { username } = req.body;

  console.log("CHEGOU NO POST");

  const tokenHeader = req.headers.authorization;
  const idToken = tokenHeader.split(" ")[1];

  if (!idToken || !username) {
    return res.status(400).json({ success: false, message: "Missing fields" });
  }

  if (username.length < 5) {
    return res.status(400).json({
      success: false,
      message: "O nome de usuário deve ter no mínimo 5 caracteres.",
    });
  }

  try {
    const decodedToken = await auth.verifyIdToken(idToken);

    const userId = decodedToken.uid;

    try {
      // Verifica se o nome de usuário já existe em qualquer outro documento
      const usernamesSnapshot = await db
        .collection("usernames")
        .where("username", "==", username)
        .get();

      if (!usernamesSnapshot.empty) {
        return res.status(409).json({
          success: false,
          message: "Esse nome de usuário já está em uso.",
        });
      }
      // Transação para garantir a criação atômica do nome de usuário
      await db.runTransaction(async (transaction) => {
        const usernameRef = db.collection("usernames").doc(userId);
        transaction.set(usernameRef, { username });

        // Atualiza o documento do usuário com o nome de usuário e avança no onboarding
        transaction.update(db.collection("users").doc(userId), {
          username: username,
          onboarding: admin.firestore.FieldValue.increment(1),
        });
      });

      return res.status(200).json({
        success: true,
        code: "success",
        message: "Nome de usuário criado com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao criar nome de usuário:", error);
      return res
        .status(500)
        .json({ success: false, message: "Erro ao processar a solicitação." });
    }
  } catch (err) {
    console.error("Erro ao verificar o token de autenticação:", err);
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
});

exports.createUsername = functions.https.onRequest(app);
