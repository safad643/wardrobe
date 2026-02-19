const express = require("express");
const router = express.Router();

const authRoutes = require("./auth");
const dashboardRoutes = require("./dashboard");
const usersRoutes = require("./users");
const categoriesRoutes = require("./categories");
const productsRoutes = require("./products");
const ordersRoutes = require("./orders");
const couponsRoutes = require("./coupons");
const returnsRoutes = require("./returns");
const reportsRoutes = require("./reports");

router.use("/", authRoutes);
router.use("/", dashboardRoutes);
router.use("/", usersRoutes);
router.use("/", categoriesRoutes);
router.use("/", productsRoutes);
router.use("/", ordersRoutes);
router.use("/", couponsRoutes);
router.use("/", returnsRoutes);
router.use("/", reportsRoutes);

module.exports = router;
