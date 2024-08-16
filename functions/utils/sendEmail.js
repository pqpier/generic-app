const nodemailer = require("nodemailer");

async function sendEmail(email, name, password) {
  const transporter = nodemailer.createTransport({
    host: "smtp.hostinger.com",
    port: 465,
    secure: true,
    auth: {
      user: "noreply@solydapp.pro",
      pass: "zvh7vpd!put.mpu7CDG",
    },
  });

  const mailOptions = {
    from: "Rafael | Solyd <noreply@solydapp.pro>",
    to: email.includes("example.com") ? "rrrpieroni@gmail.com" : email,
    subject: "Acesse agora o Solyd App!",
    html: `
          <style>
            @media (min-width: 640px) {
              .solyd-box {
                width: 35%;
              }
            }
          </style>
          <div class="solyd-box">
            <div style="text-align: center;">
              <h2>Olá, ${name}, seja bem-vindo ao Solyd App!</h2>
            </div>
            <div style="text-align: left;">
              <p>
                Para acessar o mini-treinamento onde terá o passo-a-passo para acessar e baixar o Solyd App, clique no botão abaixo e faça o login com a seguintes credenciais:
              </p>
              <p>E-mail: <b>${email}</b></p>
              <p>Senha: <b>${password}</b></p>
              <a
                href="https://trading.solydapp.com/"
                style="font-weight:bold;border-radius:6px;width:100%;text-align:center;display: inline-block; padding: 16px 0; color: white; background-color: #007bff; text-decoration: none;"
                >Quero Acessar Agora</a
              >
            </div>
          </div>`,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = sendEmail;
