const express = require("express");
const router = express.Router();
const admincontroller = require("../../controllers/admin");
const midddlewares = require("../../midddlewares/session");

router.get(
  "/coupons",
  midddlewares.adminsession,
  admincontroller.loadcoupons
);
router.get(
  "/coupons/new",
  midddlewares.adminsession,
  admincontroller.loadaddcoupon
);
router.post(
  "/coupons",
  midddlewares.adminsession,
  admincontroller.addCoupon
);
router.delete(
  "/coupons/:id",
  midddlewares.adminsession,
  admincontroller.deleteCoupon
);
router.get(
  "/coupons/:id/edit",
  midddlewares.adminsession,
  admincontroller.loadupdatecoupon
);
router.patch(
  "/coupons/:id",
  midddlewares.adminsession,
  admincontroller.updatecoupon
);

module.exports = router;
