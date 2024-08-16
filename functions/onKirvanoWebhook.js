const functions = require("firebase-functions");
const admin = require("firebase-admin");
const sendEmail = require("./utils/sendEmail");

if (admin.apps.length === 0) {
  admin.initializeApp();
}

exports.onKirvanoWebhook = functions.https.onRequest(async (req, res) => {
  const blacklist = ["dermaecare@gmail.com"];
  const eventData = req.body;
  const event = eventData.event;

  const email = eventData.customer.email;
  const name = eventData.customer.name;
  // const product = eventData.products[0].name;
  // const full_price = eventData.total_price;
  // const paymentMethod = eventData.payment_method;
  // const plan = eventData.products[0].offer_name;
  const phone_number = eventData.customer.phone_number;

  const db = admin.firestore();
  const auth = admin.auth();

  if (blacklist.includes(eventData.customer.email)) {
    return res.status(200).send("Email na lista negra.");
  }

  // Verificar se o evento é uma Compra Aprovada
  if (event === "SALE_APPROVED") {
    //Consultando a coleção "users" pelo e-mail para obter o ID
    let userRec;
    try {
      userRec = await auth.getUserByEmail(email);
    } catch (error) {
      console.log(error);
    }

    // Verificar se encontrou o usuário
    if (!userRec) {
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
              platform: "kirvano",
            },
            turma: 4,
            risk: "medium",
          });

        await sendEmail(email, name, "fmk123sep");
      } catch (error) {
        console.log(error);
      }

      return res.status(201).send("Usuário criado com sucesso!");
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
            status: "active",
            name: "premium",
            status_date: new Date(),
            platform: "kirvano",
          },
          turma: 4,
          risk: "medium",
        },
        { merge: true }
      );
  } else if (event === "SALE_REFUNDED") {
    // Lógica para tratar compra reembolsada
    //Consultando a coleção "users" pelo e-mail para obter o ID
    const userSnapshot = await db
      .collection("users")
      .where("email", "==", email)
      .limit(1)
      .get();

    // Verificar se encontrou o usuário
    if (userSnapshot.empty) {
      return res.status(404).send("Usuário não encontrado.");
    }

    // Pegando o ID do usuário
    const userId = userSnapshot.docs[0].id;

    await db
      .collection("users")
      .doc(userId)
      .set(
        {
          plan: {
            status: "refunded",
            status_date: new Date(),
          },
        },
        { merge: true }
      );
  }
  // Verificar se o evento é um Chargeback
  else if (event === "SALE_CHARGEBACK") {
    // Lógica para tratar chargeback
    //Consultando a coleção "users" pelo e-mail para obter o ID
    const userSnapshot = await db
      .collection("users")
      .where("email", "==", email)
      .limit(1)
      .get();

    // Verificar se encontrou o usuário
    if (userSnapshot.empty) {
      return res.status(404).send("Usuário não encontrado.");
    }

    // Pegando o ID do usuário
    const userId = userSnapshot.docs[0].id;

    await db
      .collection("users")
      .doc(userId)
      .set(
        {
          plan: {
            status: "chargedback",
            status_date: new Date(),
          },
        },
        { merge: true }
      );

    return res.status(200).send("Webhook de chargeback processado com sucesso");
  } else {
    // Se nenhum dos casos acima, logar o evento desconhecido
    console.log("Tipo de evento de webhook não reconhecido:", eventData);
    return res.status(400).send("Tipo de evento de webhook não reconhecido.");
  }

  // TODO: Implementar a lógica específica para cada tipo de evento

  return res.status(200).send("Webhook processado com sucesso (última linha).");
});
