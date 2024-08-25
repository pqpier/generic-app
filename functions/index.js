// const { onHotmartWebhook } = require("./onHotmartWebhook");
const { onBeforeCreate } = require("./onBeforeCreate");
const { changePassword } = require("./changePassword");
const { onKiwifyWebhook } = require("./onKiwifyWebhook");
const { onKirvanoWebhook } = require("./onKirvanoWebhook");
const { onSignalCreate } = require("./onSignalCreate");
const { onWhapiWebhook } = require("./onWhapiWebhook");
const { onHotmartWebhook } = require("./onHotmartWebhook");
const { onSignalUpdate } = require("./onSignalUpdate");
const { moveClosedSignals } = require("./moveClosedSignals");
const { resetPassword } = require("./resetPassword");
const { onReferralUpdate } = require("./onReferralUpdate");
const { getLinkAnalytics } = require("./getLinkAnalytics");
const { onUserCreate } = require("./onUserCreate");
const { createInDatabase } = require("./createInDatabase");
const { findHighestBalances } = require("./findHighestBalances");
const { createMissingReferrals } = require("./createMissingReferrals");
const { checkUsersAndReferrals } = require("./checkUsersAndReferrals");
const { addMissingReferrerIds } = require("./addMissingReferrerIds");
const {
  updateTotalPurchasesForReferrals,
} = require("./updateTotalPurchasesForUsers");
const { createUsername } = require("./createUsername");

module.exports = {
  onKiwifyWebhook,
  onBeforeCreate,
  changePassword,
  onKirvanoWebhook,
  onSignalCreate,
  onWhapiWebhook,
  onHotmartWebhook,
  onSignalUpdate,
  moveClosedSignals,
  resetPassword,
  onReferralUpdate,
  getLinkAnalytics,
  onUserCreate,
  createInDatabase,
  findHighestBalances,
  createMissingReferrals,
  checkUsersAndReferrals,
  addMissingReferrerIds,
  updateTotalPurchasesForReferrals,
  createUsername,
};
