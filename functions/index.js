// const { onUserCreate } = require("./onUserCreate");
const { onHotmartWebhook } = require("./onHotmartWebhook");
const { onBeforeCreate } = require("./onBeforeCreate");
const { changePassword } = require("./changePassword");

module.exports = {
  changePassword,
  // onUserCreate,
  onHotmartWebhook,
  onBeforeCreate,
};
