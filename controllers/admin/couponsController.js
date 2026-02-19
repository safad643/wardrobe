const { ObjectId } = require("mongodb");
const { getPagination } = require("../../helpers/pagination");

const loadcoupons = async (req, res) => {
  try {
    const db = req.db;

    const total = await db.collection("coupons").countDocuments({});
    const { currentPage, totalPages, skip, limit } = getPagination(
      req.query.page,
      total
    );

    const coupons = await db
      .collection("coupons")
      .find({})
      .sort({ startDate: -1, _id: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const categories = await db.collection("catogories").find({}).toArray();
    const categoryMap = {};
    categories.forEach((cat) => {
      categoryMap[cat._id.toString()] = cat.name;
    });

    const couponsWithCategories = coupons.map((coupon) => ({
      ...coupon,
      catogory: categoryMap[coupon.applicableCategories] || "Unknown Category",
    }));

    res.render("admin/nav/coupons", {
      coupons: couponsWithCategories,
      pagination: {
        currentPage,
        totalPages,
        total,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

const loadaddcoupon = async (req, res) => {
  try {
    const db = req.db;
    const categories = await db.collection("catogories").find({}).toArray();
    res.render("admin/forms/couponadd", { categories });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

const addCoupon = async (req, res) => {
  try {
    const db = req.db;

    const existingCoupon = await db.collection("coupons").findOne({
      code: req.body.code,
    });

    if (existingCoupon) {
      return res.json({
        success: false,
        message: "Coupon code already exists",
      });
    }

    const couponDoc = {
      code: req.body.code,
      discountValue: req.body.discountValue,
      minPurchase: parseInt(req.body.minPurchase),
      startDate: new Date(req.body.startDate),
      endDate: new Date(req.body.endDate),
      usageLimit: parseInt(req.body.usageLimit),
      usedCount: 0,
      applicableCategories: req.body.applicableCategories,
      list: true,
    };

    await db.collection("coupons").insertOne(couponDoc);

    res.json({
      success: true,
      message: "Coupon added successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error adding coupon",
    });
  }
};

const deleteCoupon = async (req, res) => {
  try {
    const db = req.db;

    const result = await db.collection("coupons").deleteOne({
      _id: new ObjectId(req.params.id),
    });

    if (result) {
      res.json({
        success: true,
        message: "Coupon deleted successfully",
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error deleting coupon",
    });
  }
};

const loadupdatecoupon = async (req, res) => {
  try {
    const id = req.params.id;
    const db = req.db;
    const categories = await db.collection("catogories").find({}).toArray();
    const coupon = await db
      .collection("coupons")
      .findOne({ _id: new ObjectId(id) });
    res.render("admin/forms/updatecoupon", { categories, coupon });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

const updatecoupon = async (req, res) => {
  console.log(req.body);
  try {
    const db = req.db;
    const data = { ...req.body.data };
    data.startDate = new Date(data.startDate);
    data.endDate = new Date(data.endDate);
    await db
      .collection("coupons")
      .updateOne({ _id: new ObjectId(req.params.id) }, { $set: data });
    const coupons = await db.collection("coupons").find({}).toArray();
    for (const coupon of coupons) {
      const category = await db.collection("catogories").findOne({
        _id: new ObjectId(coupon.applicableCategories),
      });
      coupon.catogory = category ? category.name : "N/A";
    }
    res.render("admin/nav/coupons", { coupons });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = {
  loadcoupons,
  loadaddcoupon,
  addCoupon,
  deleteCoupon,
  loadupdatecoupon,
  updatecoupon,
};

