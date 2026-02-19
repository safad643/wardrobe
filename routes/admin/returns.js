const express = require("express");
const router = express.Router();
const admincontroller = require("../../controllers/admin");
const midddlewares = require("../../midddlewares/session");

router.get(
  "/returns",
  midddlewares.adminsession,
  admincontroller.loadreturnmanagment
);
router.get(
  "/returns/:returnId",
  midddlewares.adminsession,
  admincontroller.getReturnData
);
router.delete(
  "/returns/:returnId/notification",
  midddlewares.adminsession,
  admincontroller.removeReturnNotification
);
router.patch(
  "/returns/:returnId/status",
  midddlewares.adminsession,
  admincontroller.updateReturnStatus
);

module.exports = router;
