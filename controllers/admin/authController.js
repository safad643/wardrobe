const mongo = require("../../mongodb/mongo");

const loadlogin = (req, res) => {
  try {
    res.render("admin/login.ejs", { msg: "" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

const loginverify = async (req, res) => {
  try {
    const { email, password } = req.body;
    const db = await mongo();

    const adminData = await db.collection("admin").find({ email }).toArray();
    if (adminData[0]?.password === password) {
      req.session.admin = true;
      req.session.name = adminData[0].name;
      res.redirect("admin/dashboard");
    } else {
      res.render("admin/login.ejs", { msg: "invalid credentials" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

const logout = async (req, res) => {
  req.session.destroy();
  res.redirect("/admin");
};

module.exports = { loadlogin, loginverify, logout };

