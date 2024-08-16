const functions = require("firebase-functions");
const admin = require("firebase-admin");
const sendEmail = require("./utils/sendEmail");

if (admin.apps.length === 0) {
  admin.initializeApp();
}

exports.onKiwifyWebhook = functions.https.onRequest(async (req, res) => {
  const blacklist = ["dermaecare@gmail.com"];
  const eventData = req.body;

  const db = admin.firestore();
  const auth = admin.auth();

  console.log(eventData);

  if (blacklist.includes(eventData.Customer.email)) {
    return res.status(200).send("Email na lista negra.");
  }

  // Verificar se o evento é uma Compra Aprovada
  if (eventData.order_status === "paid" && !eventData.refunded_at) {
    //Consultando a coleção "users" pelo e-mail para obter o ID
    let userRec;
    try {
      userRec = await auth.getUserByEmail(eventData.Customer.email);
    } catch (error) {
      console.log(error);
    }

    // Verificar se encontrou o usuário
    if (!userRec) {
      // Calculando a data de renovação do plano

      let userRecord;
      try {
        userRecord = await auth.createUser({
          email: eventData.Customer.email,
          password: "fmk123sep",
          displayName: eventData.Customer.full_name,
          emailVerified: true,
          disabled: false,
        });

        await db
          .collection("users")
          .doc(userRecord.uid)
          .set({
            email: userRecord.email,
            name: userRecord.displayName,
            phone: eventData.Customer.mobile,
            id: userRecord.uid,
            plan: {
              status: "active",
              name: "premium",
              status_date: new Date(),
            },
            risk: "low",
          });

        await sendEmail(
          eventData.Customer.email,
          userRecord.displayName,
          "fmk123sep"
        );
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
          email: eventData.Customer.email,
          name: eventData.Customer.full_name,
          phone: eventData.Customer.mobile,
          id: userId,
          plan: {
            status: "active",
            name: "premium",
            status_date: new Date(),
          },
          risk: "low",
        },
        { merge: true }
      );
  }
  // Verificar se o evento é uma Compra Reembolsada
  else if (eventData.order_status === "refunded") {
    // Lógica para tratar compra reembolsada
    //Consultando a coleção "users" pelo e-mail para obter o ID
    const userSnapshot = await db
      .collection("users")
      .where("email", "==", eventData.Customer.email)
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
  else if (eventData.order_status === "chargedback") {
    // Lógica para tratar chargeback
    //Consultando a coleção "users" pelo e-mail para obter o ID
    const userSnapshot = await db
      .collection("users")
      .where("email", "==", eventData.Customer.email)
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
  }
  // Verificar se o evento é uma Assinatura Atrasada
  else if (eventData.order_status === "paid") {
    //Consultando a coleção "users" pelo e-mail para obter o ID
    const userSnapshot = await db
      .collection("users")
      .where("email", "==", eventData.Customer.email)
      .limit(1)
      .get();

    // Verificar se encontrou o usuário
    if (userSnapshot.empty) {
      return res.status(404).send("Usuário não encontrado.");
    }

    // Pegando o ID do usuário
    const userId = userSnapshot.docs[0].id;

    await db
      .collection("subscriptions")
      .doc(userId)
      .set(
        {
          plan: {
            status: "delayed",
            status_date: new Date(),
          },
        },
        { merge: true }
      );
  }
  // Verificar se o evento é uma Assinatura Renovada
  else if (eventData.order_status === "paid" && eventData.approved_date) {
    //Consultando a coleção "users" pelo e-mail para obter o ID
    let userRec;
    try {
      userRec = await auth.getUserByEmail(eventData.Customer.email);
    } catch (error) {
      console.log(error);
    }

    // Verificar se encontrou o usuário
    if (!userRec) {
      let userRecord;
      try {
        userRecord = await auth.createUser({
          email: eventData.Customer.email,
          password: "fmk123sep",
          displayName: eventData.full_name,
          emailVerified: true,
          disabled: false,
        });

        await db
          .collection("users")
          .doc(userRecord.uid)
          .set({
            email: userRecord.email,
            name: userRecord.displayName,
            phone: eventData.Customer.mobile,
            id: userRecord.uid,
            plan: {
              status: "active",
              name: "premium",
              status_date: new Date(),
            },
            risk: "low",
          });

        await sendEmail(
          eventData.Customer.email,
          userRecord.displayName,
          "fmk123sep"
        );
      } catch (error) {
        console.log(error);
      }

      await db
        .collection("users")
        .doc(userRecord.uid)
        .set(
          {
            email: eventData.Customer.email,
            name: eventData.Customer.full_name,
            phone: eventData.Customer.mobile,
            id: userRecord.uid,
            plan: {
              status: "active",
              name: "premium",
              status_date: new Date(),
            },
            risk: "low",
          },
          { merge: true }
        );

      return res.status(201).send("Usuário criado com sucesso!");
    }

    // Pegando o ID do usuário
    const userId = userRec.uid;

    await db
      .collection("users")
      .doc(userId)
      .set(
        {
          email: eventData.Customer.email,
          name: eventData.Customer.full_name,
          phone: eventData.Customer.mobile,
          id: userId,
          plan: {
            status: "active",
            name: "premium",
            status_date: new Date(),
          },
          risk: "low",
        },
        { merge: true }
      );
  } else {
    // Se nenhum dos casos acima, logar o evento desconhecido
    console.log("Tipo de evento de webhook não reconhecido:", eventData);
    return res.status(400).send("Tipo de evento de webhook não reconhecido.");
  }

  // TODO: Implementar a lógica específica para cada tipo de evento

  return res.status(200).send("Webhook processado com sucesso.");
});
