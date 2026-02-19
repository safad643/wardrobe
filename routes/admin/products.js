const express = require("express");
const router = express.Router();
const admincontroller = require("../../controllers/admin");
const midddlewares = require("../../midddlewares/session");

router.get(
  "/products",
  midddlewares.adminsession,
  admincontroller.loadproducts
);
router.get(
  "/products/new",
  midddlewares.adminsession,
  admincontroller.productaddload
);
router.post(
  "/products",
  midddlewares.adminsession,
  admincontroller.productadd
);
router.get(
  "/products/:id/edit",
  midddlewares.adminsession,
  admincontroller.productupdateload
);
router.patch(
  "/products/:id",
  midddlewares.adminsession,
  admincontroller.productupdate
);
router.post("/delete", midddlewares.adminsession, admincontroller.Delete);

module.exports = router;
