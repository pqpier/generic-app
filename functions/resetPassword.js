const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");

const app = express();

// Inicializa o Firebase Admin
if (admin.apps.length === 0) {
  admin.initializeApp();
}

const auth = admin.auth();

// Configurações do CORS
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
  const { email } = req.body;

  if (!email) {
    return res
      .status(400)
      .json({ success: false, message: "Por favor, informe o e-mail" });
  }

  try {
    const userRecord = await auth.getUserByEmail(email);
    const uid = userRecord.uid;

    await auth.updateUser(uid, { password: "reset123" });

    res
      .status(200)
      .json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

exports.resetPassword = functions.https.onRequest(app);
