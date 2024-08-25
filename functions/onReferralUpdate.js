const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");
const querystring = require("querystring");
const generateReferrerId = require("./utils/generateReferrerId");

if (admin.apps.length === 0) {
  admin.initializeApp();
}

exports.onReferralUpdate = functions.firestore
  .document("referrals/{referrerId}")
  .onUpdate(async (change, context) => {
    const oldValue = change.before.data();
    const newValue = change.after.data();

    if (
      (oldValue.acceptedTerms === false && newValue.acceptedTerms === true) ||
      (oldValue.acceptedTerms === true && newValue.regenerateLink === true)
    ) {
      if (newValue.checkoutLink && newValue.videoLink) {
        return null;
      }

      const referrerId = newValue.referrerId;

      const key = functions.config().cuttly.api_key;
      const urlToShorten =
        "https://www.solydapp.com/rwd?xcod=ref-vid-" + referrerId;
      const userDomain = "1";

      // Construindo a URL de requisição com os parâmetros
      const queryParams = querystring.stringify({
        key: key,
        short: urlToShorten,
        userDomain: userDomain,
      });

      const requestUrl = `https://cutt.ly/api/api.php?${queryParams}`;

      // Create video referral link
      let videoLink;
      try {
        const response = await axios.get(requestUrl);
        const status = response?.data?.url?.status;
        if (status === 7) {
          videoLink = response?.data?.url?.shortLink;
        } else {
          await snap.ref.delete();
        }
        console.log(response);
      } catch (error) {
        console.error("Erro ao encurtar a URL:", error);
        await snap.ref.delete();
      }

      // Create checkout referral link
      const urlToShorten2 =
        "https://pay.hotmart.com/L94668060H?off=37rwg9yc&checkoutMode=10&xcod=ref-pay-" +
        referrerId;
      const queryParams2 = querystring.stringify({
        key: key,
        short: urlToShorten2,
        userDomain: userDomain,
      });

      const requestUrl2 = `https://cutt.ly/api/api.php?${queryParams2}`;
      let checkoutLink;

      try {
        const response = await axios.get(requestUrl2);
        const status = response?.data?.url?.status;
        if (status === 7) {
          checkoutLink = response?.data?.url?.shortLink;
        } else {
          await snap.ref.delete();
        }
        console.log(response);
      } catch (error) {
        console.error("Erro ao encurtar a URL:", error);
        await snap.ref.delete();
      }

      return await change.after.ref.set(
        { videoLink, checkoutLink },
        { merge: true }
      );
    }

    return null;
  });
