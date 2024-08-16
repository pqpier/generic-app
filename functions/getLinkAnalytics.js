const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const querystring = require("querystring");

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
      "https://trading.solydapp.com",
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
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  }

  if (!req.body.checkoutUrl || !req.body.videoUrl) {
    return res.status(400).json({ success: false, message: "Missing fields" });
  }

  const token = req.headers.authorization.split(" ")[1];
  if (!token) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;
    const user = await admin.auth().getUser(uid);
    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
  } catch (error) {
    console.error("Error verifying token:", error);
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const key = functions.config().cuttly.api_key;
  const checkoutUrl = req.body.checkoutUrl;
  const videoUrl = req.body.videoUrl;

  const queryParams = querystring.stringify({
    key: key,
    stats: checkoutUrl,
  });

  const requestUrl = `https://cutt.ly/api/api.php?${queryParams}`;

  let checkoutUrlTotalClicks;
  try {
    const response = await axios.get(requestUrl);

    console.log(response);
    const status = response?.data?.stats?.status;
    if (status === 1) {
      checkoutUrlTotalClicks = response?.data?.stats?.clicks;
    } else {
      return res.status(500).json({
        success: false,
        message:
          "Erro ao obter o total de cliques do link da página de pagamento.",
      });
    }
  } catch (error) {
    console.error("Erro ao encurtar a URL:", error);
    return res.status(500).json({
      success: false,
      message:
        "Erro ao obter o total de cliques do link da página de pagamento.",
    });
  }

  const queryParams2 = querystring.stringify({
    key: key,
    stats: videoUrl,
  });
  const requestUrl2 = `https://cutt.ly/api/api.php?${queryParams2}`;

  let videoUrlTotalClicks;
  try {
    const response = await axios.get(requestUrl2);
    const status = response?.data?.stats?.status;
    if (status === 1) {
      videoUrlTotalClicks = response?.data?.stats?.clicks;
    } else {
      return res.status(500).json({
        success: false,
        message: "Erro ao obter o total de cliques do link do vídeo.",
      });
    }
  } catch (error) {
    console.error("Erro ao encurtar a URL:", error);
    return res.status(500).json({
      success: false,
      message: "Erro ao obter o total de cliques do link do vídeo.",
    });
  }

  return res.status(200).json({ checkoutUrlTotalClicks, videoUrlTotalClicks });
});

exports.getLinkAnalytics = functions.https.onRequest(app);
