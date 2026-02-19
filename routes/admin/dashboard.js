const express = require("express");
const router = express.Router();
const admincontroller = require("../../controllers/admin");
const midddlewares = require("../../midddlewares/session");

router.get(
  "/dashboard",
  midddlewares.adminsession,
  admincontroller.loaddashboard
);

module.exports = router;
