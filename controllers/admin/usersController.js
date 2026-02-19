const { getPagination } = require("../../helpers/pagination");
const STATUS_CODES = require("../../constants/statusCodes");

const loadusermanagment = async (req, res) => {
  try {
    const db = req.db;

    const total = await db.collection("users").countDocuments({});
    const { currentPage, totalPages, skip, limit } = getPagination(
      req.query.page,
      total
    );

    const user = await db
      .collection("users")
      .find({})
      .sort({ createdAt: -1, _id: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    res.render("admin/nav/usermanagment", {
      user,
      pagination: {
        currentPage,
        totalPages,
        total,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).send("Internal Server Error");
  }
};

const userupdateLoad = async (req, res) => {
  try {
    res.render("admin/forms/userupdate", { error: "", ogmail: "" });
  } catch (err) {
    console.error(err);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).send("Internal Server Error");
  }
};

const loadAdduser = (req, res) => {
  try {
    res.render("admin/forms/addform.ejs");
  } catch (err) {
    console.error(err);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).send("Internal Server Error");
  }
};

module.exports = { loadusermanagment, userupdateLoad, loadAdduser };

