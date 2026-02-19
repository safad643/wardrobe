const { ObjectId } = require("mongodb");
const STATUS_CODES = require("../../constants/statusCodes");

const profileload = async (req, res) => {
  try {
    const db = req.db;
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(req.session.uid) });

    const addresses = await db
      .collection("adress")
      .find({ userId: req.session.uid })
      .toArray();

    const orders = await db
      .collection("orders")
      .find({ userId: req.session.uid })
      .sort({ createdAt: -1 })
      .toArray();

    for (const order of orders) {
      const approvedReturns = await db
        .collection("returns")
        .find({ orderid: order._id.toString(), status: "approved" })
        .toArray();

      for (const item of order.items) {
        const product = await db.collection("products").findOne(
          { _id: new ObjectId(item.productId) },
          { projection: { images: 1 } }
        );

        if (product && product.images && product.images.length > 0) {
          item.image = product.images[0];
        }

        const matchingReturn = approvedReturns.find(
          (ret) =>
            ret.productid === item.productId &&
            ret.varient?.size === item.varient?.size &&
            ret.varient?.color === item.varient?.color
        );

        item.displayStatus = matchingReturn ? "returned" : item.status;
      }
    }

    const walletUserId =
      typeof req.session.uid === "string"
        ? new ObjectId(req.session.uid)
        : req.session.uid;
    const wallet = await db
      .collection("wallet")
      .findOne({ userId: walletUserId });
    if (wallet?.transactions) {
      wallet.transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    res.render("user/profile", {
      wallet,
      user,
      addresses,
      orders,
      razorpayKey: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error(error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).send("Server Error");
  }
};

const changename = async (req, res) => {
  try {
    const { name, email } = req.body;
    const db = req.db;
    await db.collection("users").updateOne({ email }, { $set: { name } });
    res.redirect("/user/profile");
  } catch (err) {
    console.log(err);
  }
};

const addadress = async (req, res) => {
  try {
    const db = req.db;
    const { street, city, state, country, postalCode, phone } = req.body;

    const newAddress = {
      userId: req.session.uid,
      street,
      city,
      state,
      country,
      postalCode,
      phone: parseInt(phone, 10),
    };

    await db.collection("adress").insertOne(newAddress);

    res.json({
      status: "success",
      address: newAddress,
    });
  } catch (error) {
    console.error(error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: "Internal Server Error",
    });
  }
};

const deleteAddress = async (req, res) => {
  try {
    const db = req.db;
    const addressId = req.params.id;

    const result = await db
      .collection("adress")
      .deleteOne({ _id: new ObjectId(addressId) });

    if (result.deletedCount === 1) {
      res.json({ status: "success", message: "Address deleted successfully" });
    } else {
      res.status(STATUS_CODES.NOT_FOUND).json({ success: false, error: "Address not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ success: false, error: "Internal Server Error" });
  }
};

const updateAddress = async (req, res) => {
  try {
    const db = req.db;
    const { street, city, state, country, postalCode, phone } =
      req.body;
    const addressId = req.params.id;

    const result = await db.collection("adress").updateOne(
      { _id: new ObjectId(addressId) },
      {
        $set: {
          street,
          city,
          state,
          country,
          postalCode,
          phone: parseInt(phone, 10),
        },
      }
    );

    if (result.modifiedCount === 0) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        error: "Address not found or no changes made.",
      });
    }

    res.json({ success: true, message: "Address updated successfully." });
  } catch (error) {
    console.error(error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ success: false, error: "Internal Server Error" });
  }
};

module.exports = {
  profileload,
  changename,
  addadress,
  deleteAddress,
  updateAddress,
};

