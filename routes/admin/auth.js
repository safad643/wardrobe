const express = require("express");
const router = express.Router();
const admincontroller = require("../../controllers/admin");
const midddlewares = require("../../midddlewares/session");

router.get("/", admincontroller.loadlogin);
router.get("/login", admincontroller.loadlogin);
router.post("/login", admincontroller.loginverify);
router.get("/logout", midddlewares.adminsession, admincontroller.logout);

module.exports = router;
