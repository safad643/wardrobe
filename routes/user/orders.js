const express = require("express");
const router = express.Router();
const usercontroller = require("../../controllers/user");
const midddlewares = require("../../midddlewares/session");

router.get("/checkout", midddlewares.usersession, usercontroller.loadcheckout);
router.get(
  "/orders/:orderId/items/:productId",
  midddlewares.usersession,
  usercontroller.loadorderview
);
router.post("/orders", midddlewares.usersession, usercontroller.placeOrder);
router.patch(
  "/orders/:orderId/cancel",
  midddlewares.usersession,
  usercontroller.cancelOrder
);
router.post(
  "/orders/:orderId/return",
  midddlewares.usersession,
  usercontroller.returnOrder
);

module.exports = router;
