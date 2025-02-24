const router = require("express").Router();
const passport = require("passport");
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile"],
  })
);

router.get("/google/redirect", passport.authenticate("google"), (req, res) => {
  if (req.user) {
    req.session.uid = req.user._id;
    req.session.user = true;
    req.session.data = { email: req.user.email };
  }
  res.redirect("/user/home");
});

module.exports = router;
