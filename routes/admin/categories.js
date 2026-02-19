const express = require("express");
const router = express.Router();
const admincontroller = require("../../controllers/admin");
const midddlewares = require("../../midddlewares/session");

router.get(
  "/categories",
  midddlewares.adminsession,
  admincontroller.loadcatogory
);
router.get(
  "/categories/new",
  midddlewares.adminsession,
  admincontroller.catogoryaddload
);
router.post(
  "/categories",
  midddlewares.adminsession,
  admincontroller.catogoryadd
);
router.get(
  "/categories/:id/edit",
  midddlewares.adminsession,
  admincontroller.loadcatogupdate
);
router.patch(
  "/categories/:id",
  midddlewares.adminsession,
  admincontroller.catogoryupdate
);
router.delete(
  "/categories/:id",
  midddlewares.adminsession,
  admincontroller.deletecatogory
);

module.exports = router;
