const nodemailer = require("nodemailer");

async function sendEmail(email, name, password) {
  const transporter = nodemailer.createTransport({
    host: "mail.privateemail.com",
    port: 465,
    secure: true,
    auth: {
      user: "naoresponda@seudominio.com",
      pass: "senhadoemail",
    },
  });

  const mailOptions = {
    from: "Generic App <naoresponda@seudominio.com>",
    to: email.includes("example.com") ? "rrrpieroni@gmail.com" : email,
    subject: "Acesse agora a Generic App!",
    html: `
          <style>
            @media (min-width: 640px) {
              .ma-box {
                width: 35%;
              }
            }
          </style>
          <div class="ma-box">
            <div style="text-align: center;">
              <h2>Olá, ${name}, seja bem-vindo à Generic App!</h2>
            </div>
            <div style="text-align: left;">
              <p>
                Para acessar a plataforma, clique no botão abaixo e faça o login com a seguintes credenciais:
              </p>
              <p>E-mail: <b>${email}</b></p>
              <p>Senha: <b>${password}</b></p>
              <a
                href="https://APP.seudominio.com/?email=${encodeURIComponent(
                  email
                )}&pwd=${encodeURIComponent(password)}"
                style="font-weight:bold;border-radius:6px;width:100%;text-align:center;display: inline-block; padding: 16px 0; color: white; background-color: #007bff; text-decoration: none;"
                >Quero Acessar Agora</a
              >
            </div>
          </div>`,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = sendEmail;
