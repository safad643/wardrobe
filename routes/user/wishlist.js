const express = require("express");
const router = express.Router();
const usercontroller = require("../../controllers/user");
const midddlewares = require("../../midddlewares/session");

router.get(
  "/wishlist",
  midddlewares.checkBan,
  midddlewares.usersession,
  usercontroller.loadWishlist
);
router.post(
  "/wishlist/add/:productId",
  midddlewares.checkBan,
  midddlewares.usersession,
  usercontroller.addToWishlist
);
router.delete(
  "/wishlist/remove/:productId",
  midddlewares.checkBan,
  midddlewares.usersession,
  usercontroller.removeFromWishlist
);
router.get(
  "/wishlist/check",
  midddlewares.checkBan,
  midddlewares.usersession,
  usercontroller.checkWishlist
);

module.exports = router;
