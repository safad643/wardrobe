const express = require("express");
const router = express.Router();
const usercontroller = require("../../controllers/user");
const midddlewares = require("../../midddlewares/session");

router.get("/", midddlewares.checkBan, usercontroller.loadhome);
router.get("/shop", midddlewares.checkBan, usercontroller.loadshop);
router.get(
  "/categories/:slug",
  midddlewares.checkBan,
  usercontroller.loadcategory
);
router.get(
  "/products/:slug",
  midddlewares.checkBan,
  usercontroller.loadproductview
);
router.get("/search", midddlewares.checkBan, usercontroller.search);
router.get("/categories", usercontroller.getCategories);
router.get(
  "/me/counts",
  midddlewares.checkBan,
  midddlewares.usersession,
  usercontroller.getwishlist_cartcount
);

module.exports = router;
