const Razorpay = require("razorpay");
const crypto = require("crypto");
const STATUS_CODES = require("../../constants/statusCodes");

const payment = async (req, res) => {
  try {
    const total = Number(req.body.total);

    if (!Number.isInteger(total) || total <= 0) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        error: "Invalid amount",
        message: "Amount must be a positive integer",
      });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: total,
      currency: "INR",
      receipt: `order_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    res.json({
      orderid: order.id,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Razorpay order creation failed:", error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      error: "Payment initialization failed",
      message: error.message || "Unable to create payment order",
    });
  }
};

const paymentcheck = async (req, res) => {
  const { response } = req.body;

  const secret = process.env.RAZORPAY_KEY_SECRET;
  const generatedSignature = crypto
    .createHmac("sha256", secret)
    .update(`${response.razorpay_order_id}|${response.razorpay_payment_id}`)
    .digest("hex");

  if (generatedSignature !== response.razorpay_signature) {
    req.flash("paymentverification", response);
  } else {
    req.flash("paymentverification", "true");
  }

  req.session.save((err) => {
    if (err) console.error("Session save error:", err);
    res.send("success");
  });
};

const retryPayment = async (req, res) => {
  const verification = req.flash("paymentverification");
  if (verification[0] === "true") {
    const db = req.db;
    const paymentId = req.params.paymentId;
    await db
      .collection("orders")
      .updateOne(
        { paymentorderid: paymentId },
        { $set: { paymentStatus: "paid" } }
      );

    res.json({ status: "success" });
  } else {
    res.json({ status: "error" });
  }
};

module.exports = {
  payment,
  paymentcheck,
  retryPayment,
};

