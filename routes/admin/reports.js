const express = require("express");
const router = express.Router();
const admincontroller = require("../../controllers/admin");
const midddlewares = require("../../midddlewares/session");

router.get(
  "/reports/sales",
  midddlewares.adminsession,
  admincontroller.generatesalesdata
);
router.get(
  "/reports/best-sellers",
  midddlewares.adminsession,
  admincontroller.switchBestSeller
);

module.exports = router;
