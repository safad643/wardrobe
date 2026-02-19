const STATUS_CODES = require("../../constants/statusCodes");

const loaddashboard = async (req, res) => {
  try {
    const db = req.db;
    const notifications = await db.collection("notifications").find({}).toArray();
    res.render("admin/dashboard", { adminName: req.session.name, notifications });
  } catch (err) {
    console.error(err);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).send("Internal Server Error");
  }
};

module.exports = { loaddashboard };

