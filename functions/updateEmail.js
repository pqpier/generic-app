const functions = require("firebase-functions");
const admin = require("firebase-admin");
const sendEmail = require("./utils/sendEmail");

if (admin.apps.length === 0) {
  admin.initializeApp();
}

exports.updateEmail = functions.https.onRequest(async (req, res) => {
  const auth = admin.auth();
  const currentEmail = req.body.currentEmail;
  const newEmail = req.body.newEmail;
  let userRecord;

  try {
    userRecord = await auth.getUserByEmail(currentEmail);
  } catch (err) {
    console.log(err);
    return res.status(200).send("Erro ao obter userId");
  }

  console.log(userRecord);

  const userId = userRecord.uid;

  auth.updateUser(userId, {
    email: newEmail,
  });

  return res.status(200).send("E-mail alterado com sucesso.");
});
