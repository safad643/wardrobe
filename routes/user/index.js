const express = require("express");
const router = express.Router();

const authRoutes = require("./auth");
const homeRoutes = require("./home");
const profileRoutes = require("./profile");
const cartRoutes = require("./cart");
const ordersRoutes = require("./orders");
const wishlistRoutes = require("./wishlist");
const paymentsRoutes = require("./payments");
const walletRoutes = require("./wallet");

router.use("/", authRoutes);
router.use("/", homeRoutes);
router.use("/", profileRoutes);
router.use("/", cartRoutes);
router.use("/", ordersRoutes);
router.use("/", wishlistRoutes);
router.use("/", paymentsRoutes);
router.use("/", walletRoutes);

module.exports = router;
