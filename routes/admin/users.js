const express = require("express");
const router = express.Router();
const admincontroller = require("../../controllers/admin");
const midddlewares = require("../../midddlewares/session");

router.get(
  "/users",
  midddlewares.adminsession,
  admincontroller.loadusermanagment
);

module.exports = router;
