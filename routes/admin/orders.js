const express = require("express");
const router = express.Router();
const admincontroller = require("../../controllers/admin");
const midddlewares = require("../../midddlewares/session");

router.get(
  "/orders",
  midddlewares.adminsession,
  admincontroller.loadordermanagment
);
router.patch(
  "/orders/:orderId/status",
  midddlewares.adminsession,
  admincontroller.updateProductStatus
);
router.get(
  "/orders/:orderId/items/:productId",
  midddlewares.adminsession,
  admincontroller.loadorderdetails
);

module.exports = router;
