const express = require("express");
const usercontroller = require("../controllers/userController");
const midddlewares = require("../midddlewares/session");
const router = express.Router();

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
router.get("/", midddlewares.checkBan, usercontroller.loadhome);
router.get("/shop", midddlewares.checkBan, usercontroller.loadshop);
router.get("/shop/:name", midddlewares.checkBan, usercontroller.loadcategory);
router.get(
  "/product/:name",
  midddlewares.checkBan,
  usercontroller.loadproductview
);
router.get(
  "/profile",
  midddlewares.checkBan,
  midddlewares.usersession,
  usercontroller.profileload
);
router.get(
  "/cart",
  midddlewares.checkBan,
  midddlewares.usersession,
  usercontroller.laodcart
);
router.delete(
  "/cartremove/:productid",
  midddlewares.usersession,
  usercontroller.removeFromCart
);
router.post(
  "/editname",
  midddlewares.checkBan,
  midddlewares.usersession,
  usercontroller.changename
);
router.post(
  "/addtocart",
  midddlewares.checkBan,
  midddlewares.usersession,
  usercontroller.addtocart
);
router.get(
  "/logout",
  midddlewares.checkBan,
  midddlewares.usersession,
  usercontroller.logout
);
router.put("/updatecart", midddlewares.usersession, usercontroller.updatecart);
router.post("/adresss", midddlewares.usersession, usercontroller.addadress);
router.post("/checkout", midddlewares.usersession, usercontroller.loadcheckout);
router.get(
  "/orderdetails/:orderid/:productid",
  midddlewares.usersession,
  usercontroller.loadorderview
);
router.post("/placeOrder", midddlewares.usersession, usercontroller.placeOrder);
router.delete(
  "/delete-address/:id",
  midddlewares.usersession,
  usercontroller.deleteAddress
);
router.put(
  "/update-address",
  midddlewares.usersession,
  usercontroller.updateAddress
);
router.post(
  "/change-password",
  midddlewares.usersession,
  usercontroller.changepassword
);
router.post(
  "/orders/:orderId/cancel",
  midddlewares.usersession,
  usercontroller.cancelOrder
);
router.post(
  "/orders/:orderId/return",
  midddlewares.usersession,
  usercontroller.returnOrder
);
router.get(
  "/wishlist",
  midddlewares.checkBan,
  midddlewares.usersession,
  usercontroller.loadWishlist
);
router.post(
  "/wishlist/add/:productId",
  midddlewares.checkBan,
  midddlewares.usersession,
  usercontroller.addToWishlist
);
router.delete(
  "/wishlist/remove/:productId",
  midddlewares.checkBan,
  midddlewares.usersession,
  usercontroller.removeFromWishlist
);
router.get(
  "/wishlist/check",
  midddlewares.checkBan,
  midddlewares.usersession,
  usercontroller.checkWishlist
);
router.post(
  "/updatewallet",
  midddlewares.usersession,
  usercontroller.updatewallet
);
router.get(
  "/getwishlist&cartcount",
  midddlewares.checkBan,
  midddlewares.usersession,
  usercontroller.getwishlist_cartcount
);


router.post('/payment',midddlewares.usersession,usercontroller.payment)
router.post('/paymentcheck',midddlewares.usersession,usercontroller.paymentcheck)
router.get('/retry-payment',midddlewares.usersession,usercontroller.retryPayment)
router.get("/search", midddlewares.checkBan, usercontroller.search);
router.get('/categories', usercontroller.getCategories);
module.exports = router;
