const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const sendEmail = require("./utils/sendEmail");

if (admin.apps.length === 0) {
  admin.initializeApp();
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/", async (req, res) => {
  const webhook = req.body;

  // Add webhook to webhooks collection
  await admin.firestore().collection("webhooks").add(webhook);

  if (Object.keys(webhook).length === 0) {
    return res.status(400).send("O objeto de webhook não deve estar vazio.");
  }

  const email = webhook.data.buyer.email;
  const name = webhook.data.buyer.name;
  const phone_number = webhook.data.buyer.checkout_phone;

  try {
    const db = admin.firestore();
    const auth = admin.auth();
    let isReferral =
      webhook.data.purchase?.origin?.xcod?.includes("ref-vid-") ||
      webhook.data.purchase?.origin?.xcod?.includes("ref-pay-");

    let referrer;
    if (isReferral) {
      referrer = webhook.data.purchase.origin.xcod;
    } else {
      referrer = false;
      isReferral = false;
    }

    if (webhook.event === "PURCHASE_APPROVED") {
      let userId;
      let userExistsOnAuth;
      try {
        const usersRef = db.collection("users");
        const query = usersRef.where("email", "==", email);
        const querySnapshot = await query.get();

        if (querySnapshot.empty) {
          try {
            userExistsOnAuth = await auth.getUserByEmail(email);
            console.log("userExistsOnAuth", "==", userExistsOnAuth);
          } catch (err) {
            console.log("Usuário ainda não existe, será criado: ", email);
          }
          if (userExistsOnAuth) {
            userId = userExistsOnAuth.uid;
            await db
              .collection("users")
              .doc(userId)
              .set(
                {
                  email: email,
                  name: name,
                  phone: phone_number,
                  id: userId,
                  plan: {
                    status: "active",
                    name: "premium",
                    status_date: new Date(),
                    platform: "hotmart",
                  },
                  risk: "medium",
                  new: true,
                  isReferral,
                  referrer,
                },
                { merge: true }
              );
          }
        } else {
          // Assumindo que só há um documento com esse email
          const userDoc = querySnapshot.docs[0];
          userId = userDoc.id;
        }
      } catch (error) {
        console.error("Error retrieving user ID by email:", error);
        throw error;
      }

      // // Verificar se encontrou o usuário
      if (!userExistsOnAuth) {
        // Calculando a data de renovação do plano

        let userRecord;
        try {
          userRecord = await auth.createUser({
            email,
            password: "fmk123sep",
            displayName: name,
            emailVerified: true,
            disabled: false,
          });

          await db
            .collection("users")
            .doc(userRecord.uid)
            .set({
              email: email,
              name: name,
              phone: phone_number,
              id: userRecord.uid,
              plan: {
                status: "active",
                name: "premium",
                status_date: new Date(),
                platform: "hotmart",
              },
              risk: "medium",
              new: true,
              isReferral,
              referrer,
            });
          userId = userRecord.uid;
          await sendEmail(email, name, "fmk123sep");
        } catch (error) {
          console.log(error);
        }

        return res.status(201).send("Usuário criado com sucesso!");
      }

      // Pegando o ID do usuário
      // const userId = userRec.uid;

      await db
        .collection("users")
        .doc(userId)
        .set(
          {
            email: email,
            name: name,
            phone: phone_number,
            id: userId,
            plan: {
              status: "active",
              name: "premium",
              status_date: new Date(),
              platform: "hotmart",
            },
            risk: "medium",
            new: true,
            isReferral,
            referrer,
          },
          { merge: true }
        );
    } else if (webhook.event === "PURCHASE_CHARGEBACK") {
      let userRec;
      try {
        userRec = await auth.getUserByEmail(email);
      } catch (error) {
        console.log(error);
      }

      // Verificar se encontrou o usuário
      if (!userRec) {
        return res.status(404).send("Usuário não encontrado.");
      }

      // Pegando o ID do usuário
      const userId = userRec.uid;

      await db
        .collection("users")
        .doc(userId)
        .set(
          {
            email: email,
            name: name,
            phone: phone_number,
            id: userId,
            plan: {
              status: "chargedback",
              status_date: new Date(),
            },
            risk: "medium",
          },
          { merge: true }
        );

      const rewardPurchase = await db
        .collection("rewardPurchases")
        .doc(userId)
        .get();

      if (rewardPurchase.exists) {
        await rewardPurchase.ref.set(
          { refundOrChargeback: true },
          { merge: true }
        );
      }
    } else if (webhook.event === "PURCHASE_REFUNDED") {
      let userRec;
      try {
        userRec = await auth.getUserByEmail(email);
      } catch (error) {
        console.log(error);
      }

      // Verificar se encontrou o usuário
      if (!userRec) {
        return res.status(404).send("Usuário não encontrado.");
      }

      // Pegando o ID do usuário
      const userId = userRec.uid;

      await db
        .collection("users")
        .doc(userId)
        .set(
          {
            email: email,
            name: name,
            phone: phone_number,
            id: userId,
            plan: {
              status: "refunded",
              status_date: new Date(),
            },
            risk: "medium",
          },
          { merge: true }
        );

      const rewardPurchase = await db
        .collection("rewardPurchases")
        .doc(userId)
        .get();

      if (rewardPurchase.exists) {
        await rewardPurchase.ref.set(
          { refundOrChargeback: true },
          { merge: true }
        );
      }
    }

    return res.status(201).send("Webhook processado com sucesso!");
  } catch (error) {
    console.log(`Erro ao processar o webhook com o ID: ${webhook.id} `, error);
    return res.status(500).send("Erro interno ao processar o webhook.");
  }
});

exports.onHotmartWebhook = functions.https.onRequest(app);
