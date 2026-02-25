const loadlogin = (req, res) => {
  res.render("admin/login.ejs", { msg: "" });
};

const loginverify = async (req, res) => {
  const { email, password } = req.body;
  const db = req.db;

  const adminData = await db.collection("admin").find({ email }).toArray();
  if (adminData[0]?.password === password) {
    req.session.admin = true;
    req.session.name = adminData[0].name;
    res.redirect("/admin/dashboard");
  } else {
    res.render("admin/login.ejs", { msg: "invalid credentials" });
  }
};

const logout = async (req, res) => {
  req.session.destroy();
  res.redirect("/admin");
};

module.exports = { loadlogin, loginverify, logout };

