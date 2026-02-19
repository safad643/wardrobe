const express = require("express");
const router = express.Router();
const usercontroller = require("../../controllers/user");
const midddlewares = require("../../midddlewares/session");

router.get(
  "/cart",
  midddlewares.checkBan,
  midddlewares.usersession,
  usercontroller.laodcart
);
router.delete(
  "/cart/items/:productId",
  midddlewares.usersession,
  usercontroller.removeFromCart
);
router.post(
  "/cart/items",
  midddlewares.checkBan,
  midddlewares.usersession,
  usercontroller.addtocart
);
router.patch("/cart", midddlewares.usersession, usercontroller.updatecart);

module.exports = router;
