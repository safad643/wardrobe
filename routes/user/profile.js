const express = require("express");
const router = express.Router();
const usercontroller = require("../../controllers/user");
const midddlewares = require("../../midddlewares/session");

router.get(
  "/profile",
  midddlewares.checkBan,
  midddlewares.usersession,
  usercontroller.profileload
);
router.patch(
  "/profile/name",
  midddlewares.checkBan,
  midddlewares.usersession,
  usercontroller.changename
);
router.post("/addresses", midddlewares.usersession, usercontroller.addadress);
router.delete(
  "/delete-address/:id",
  midddlewares.usersession,
  usercontroller.deleteAddress
);
router.patch(
  "/addresses/:id",
  midddlewares.usersession,
  usercontroller.updateAddress
);
router.patch(
  "/password",
  midddlewares.usersession,
  usercontroller.changepassword
);

module.exports = router;
