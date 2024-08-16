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
const { onReferralCreate } = require("./onReferralCreate");
const { getLinkAnalytics } = require("./getLinkAnalytics");
const { onUserCreate } = require("./onUserCreate");
const { createInDatabase } = require("./createInDatabase");
const { findHighestBalances } = require("./findHighestBalances");

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
  onReferralCreate,
  getLinkAnalytics,
  onUserCreate,
  createInDatabase,
  findHighestBalances,
};
