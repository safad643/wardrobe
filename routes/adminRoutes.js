const express = require("express");
const router = express.Router();
const admincontroller = require("../controllers/adminController");
const midddlewares = require("../midddlewares/session");
//login routes
router.get("/", admincontroller.loadlogin);
router.post("/", admincontroller.loginverify);

//dashboard route
router.get(
  "/dashboard",
  midddlewares.adminsession,
  admincontroller.loaddashboard
);
//user-managment routes
router.get(
  "/user-managment",
  midddlewares.adminsession,
  admincontroller.loadusermanagment
);

// catogory-managment routes
router.get(
  "/catogory",
  midddlewares.adminsession,
  admincontroller.loadcatogory
);
router.get(
  "/catogoryadd",
  midddlewares.adminsession,
  admincontroller.catogoryaddload
);
router.post(
  "/catogoryadd",
  midddlewares.adminsession,
  admincontroller.catogoryadd
);
router.get(
  "/catogoryUpdate",
  midddlewares.adminsession,
  admincontroller.loadcatogupdate
);
router.post(
  "/catogoryupdate",
  midddlewares.adminsession,
  admincontroller.catogoryupdate
);

// product managment routes
router.get(
  "/product-managment",
  midddlewares.adminsession,
  admincontroller.loadproducts
);
router.get(
  "/productUpdate",
  midddlewares.adminsession,
  admincontroller.productupdateload
);
router.post(
  "/productUpdate",
  midddlewares.adminsession,
  admincontroller.productupdate
);

router.get(
  "/productadd",
  midddlewares.adminsession,
  admincontroller.productaddload
);
router.post(
  "/productadd",
  midddlewares.adminsession,
  admincontroller.productadd
);

//general for deleting
router.post("/delete", midddlewares.adminsession, admincontroller.Delete);

router.get(
  "/ordermanagment",
  midddlewares.adminsession,
  admincontroller.loadordermanagment
);
router.put(
  "/orders/:orderId",
  midddlewares.adminsession,
  admincontroller.updateProductStatus
);
router.put(
  "/orders/update-status",
  midddlewares.adminsession,
  admincontroller.updateProductStatus
);

router.get(
  "/coupon-managment",
  midddlewares.adminsession,
  admincontroller.loadcoupons
);
router.get(
  "/addcoupon",
  midddlewares.adminsession,
  admincontroller.loadaddcoupon
);
router.post(
  "/add-coupon",
  midddlewares.adminsession,
  admincontroller.addCoupon
);
router.post(
  "/delete-coupon",
  midddlewares.adminsession,
  admincontroller.deleteCoupon
);
router.post(
  "/updatecouponloader",
  midddlewares.adminsession,
  admincontroller.loadupdatecoupon
);
router.post(
  "/updatecoupon",
  midddlewares.adminsession,
  admincontroller.updatecoupon
);

router.get(
  "/returns/:returnId",
  midddlewares.adminsession,
  admincontroller.getReturnData
);
router.post(
  "/removereturnnotification",
  midddlewares.adminsession,
  admincontroller.removeReturnNotification
);
router.post(
  "/updatereturnstatus",
  midddlewares.adminsession,
  admincontroller.updateReturnStatus
);
router.get(
  "/returnmanagment",
  midddlewares.adminsession,
  admincontroller.loadreturnmanagment
);
router.post(
  "/generatesalesdata",
  midddlewares.adminsession,
  admincontroller.generatesalesdata
);
router.get(
  "/orderdetails/:orderId/:productid/:varient",
  midddlewares.adminsession,
  admincontroller.loadorderdetails
);

router.get(
  "/switchbestSeller",
  midddlewares.adminsession,
  admincontroller.switchBestSeller
);
router.get("/logout", midddlewares.adminsession, admincontroller.logout);
module.exports = router;
