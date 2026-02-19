const express = require("express");
const router = express.Router();
const usercontroller = require("../../controllers/user");
const midddlewares = require("../../midddlewares/session");

router.post(
  "/wallet/transactions",
  midddlewares.usersession,
  usercontroller.updatewallet
);

module.exports = router;
