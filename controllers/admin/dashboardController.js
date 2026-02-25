const loaddashboard = async (req, res) => {
  const db = req.db;
  const notifications = await db.collection("notifications").find({}).toArray();
  res.render("admin/dashboard", { adminName: req.session.name, notifications });
};

module.exports = { loaddashboard };

