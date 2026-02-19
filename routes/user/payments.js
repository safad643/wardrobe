const express = require("express");
const router = express.Router();
const usercontroller = require("../../controllers/user");
const midddlewares = require("../../midddlewares/session");

router.post("/payments", midddlewares.usersession, usercontroller.payment);
router.post(
  "/payments/verify",
  midddlewares.usersession,
  usercontroller.paymentcheck
);
router.post(
  "/payments/:paymentId/retry",
  midddlewares.usersession,
  usercontroller.retryPayment
);

module.exports = router;
