const mongo = require("../mongodb/mongo");
const { ObjectId } = require("mongodb");
const usersession = (req, res, next) => {
  if (req.session.uid) {
    next();
  } else {
    res.status(302).redirect("/user/login");
  }
};

const islogin = (req, res, next) => {
  if (req.session.user) {
    res.redirect("/user");
  } else {
    next();
  }
};

const adminsession = (req, res, next) => {
  if (req.session.admin) {
    next();
  } else {
    res.redirect("/admin");
  }
};

const checkBan = async (req, res, next) => {
  if (req.session.uid) {
    const db = await mongo();
    const id = req.session.uid;
    const ban = await db
      .collection("users")
      .find({ _id: new ObjectId(id) })
      .project({ list: 1 })
      .toArray();
    if (!ban[0]?.list) {
      req.session.destroy();
      res.render("user/ban");
    } else {
      next();
    }
  } else {
    next();
  }
}
module.exports = {
  checkBan,
  adminsession,
  islogin,
  usersession,
};
