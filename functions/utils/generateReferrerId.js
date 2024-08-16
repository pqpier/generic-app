function generateReferrerId() {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let id = "";

  for (let i = 0; i < 9; i++) {
    if (i === 4) {
      id += "-"; // Adiciona o hífen no meio do ID
    } else {
      const randomIndex = Math.floor(Math.random() * characters.length);
      id += characters[randomIndex];
    }
  }

  return id;
}

module.exports = generateReferrerId;
