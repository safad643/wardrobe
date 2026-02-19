const mongo = require("../../mongodb/mongo");

const loaddashboard = async (req, res) => {
  try {
    const db = await mongo();
    const notifications = await db.collection("notifications").find({}).toArray();
    res.render("admin/dashboard", { adminName: req.session.name, notifications });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = { loaddashboard };

