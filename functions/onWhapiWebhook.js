const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");

if (admin.apps.length === 0) {
  admin.initializeApp();
}

exports.onWhapiWebhook = functions.https.onRequest(async (req, res) => {
  console.log(req.body);

  const messages = req.body.messages;

  const message = messages.find((message) => message.from === "5516981110461");

  if (!message) {
    return res.status(200).send("Webhook processado com sucesso.");
  }

  if (message.type === "text") {
    const messageBody = message.text.body;

    if (messageBody.includes("$$$")) {
      const url = "https://gate.whapi.cloud/messages/text";

      const data = {
        to: "120363315861559683@g.us",
        body: messageBody.replace("$$$", ""),
      };

      try {
        const response = await axios.post(url, data, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${functions.config().whapi.token}`,
          },
        });
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  } else if (message.type === "image") {
    const imageUrl = message.image.link;
    const caption = message.image.caption;

    if (caption && !caption.includes("$$$")) {
      return res.status(200).send("Webhook processado com sucesso.");
    }

    const url = "https://gate.whapi.cloud/messages/image";

    const data = {
      to: "120363315861559683@g.us",
      caption: caption ? caption.replace("$$$", "") : undefined,
      media: imageUrl,
    };

    try {
      const response = await axios.post(url, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${functions.config().whapi.token}`,
        },
      });
    } catch (error) {
      console.error("Error sending image:", error);
    }
  } else if (message.type === "video") {
    const videoUrl = message.video.link;
    const caption = message.video.caption;

    if (caption && !caption.includes("$$$")) {
      return res.status(200).send("Webhook processado com sucesso.");
    }

    const url = "https://gate.whapi.cloud/messages/video";

    const data = {
      to: "120363315861559683@g.us",
      caption: caption ? caption.replace("$$$", "") : undefined,
      media: videoUrl,
    };

    try {
      const response = await axios.post(url, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${functions.config().whapi.token}`,
        },
      });
    } catch (error) {
      console.error("Error sending video:", error);
    }
  }

  return res.status(200).send("Webhook processado com sucesso.");
});
