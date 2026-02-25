const express = require("express");
const router = express.Router();
const passport = require("passport");
const usercontroller = require("../../controllers/user");
const midddlewares = require("../../midddlewares/session");

router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get("/auth/google/redirect", passport.authenticate("google"), (req, res) => {
  if (req.user) {
    req.session.uid = req.user._id;
    req.session.user = true;
    req.session.data = { email: req.user.email };
  }
  res.redirect("/user");
});

router.get("/login", midddlewares.islogin, usercontroller.loadlogin);
router.post("/login", usercontroller.login);
router.get("/forgot/:email", usercontroller.forgot);
router.post("/verifyotpforg", usercontroller.otpverify);
router.post("/resetpassword", usercontroller.resetpassword);
router.post("/register", midddlewares.checkBan, usercontroller.register);
router.get("/otp", usercontroller.loadotp);
router.post("/otp", usercontroller.otpverify);
router.post("/resendotp", usercontroller.reotp);
router.get("/google/auth", usercontroller.googleauth);
router.get(
  "/logout",
  midddlewares.checkBan,
  midddlewares.usersession,
  usercontroller.logout
);

module.exports = router;
