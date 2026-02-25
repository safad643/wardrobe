const { ObjectId } = require("mongodb");
const AppError = require("../../utils/AppError");

const placeOrder = async (req, res) => {
  const db = req.db;
  const { addressId, paymentMethod, products, totals, coupon } = req.body;

  const paymentVerification = req.flash("paymentverification");

  const paymentorderid = paymentVerification[0];

  let paymentStatus = paymentVerification[0] === "true" ? "paid" : "pending";

  let couponData = null;
  if (paymentMethod === "cod") {
    if (totals.total > 1000) {
      throw new AppError("cod is not available for orders above 1000", 400);
    }
  }

  const outOfStockProducts = [];
  for (const product of products) {
    const dbProduct = await db.collection("products").findOne({
      _id: new ObjectId(product.productId),
      variants: {
        $elemMatch: {
          size: product.size,
          color: product.color,
          count: { $gte: product.quantity },
        },
      },
    });

    if (!dbProduct) {
      const productDetails = await db.collection("products").findOne({
        _id: new ObjectId(product.productId),
      });
      outOfStockProducts.push(productDetails.name);
    }
  }

  if (outOfStockProducts.length > 0) {
    throw new AppError("Some products are out of stock", 400, {
      success: false,
      outOfStockProducts,
    });
  }

  if (coupon) {
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(req.session.uid) });

    if (user.couponsUsed && user.couponsUsed.includes(coupon)) {
      throw new AppError("You have already used this coupon", 400);
    }

      await db.collection("users").updateOne(
        { _id: new ObjectId(req.session.uid) },
        {
          $push: {
            couponsUsed: coupon,
          },
        },
        { upsert: true }
      );
      const updatedCoupon = await db
        .collection("coupons")
        .findOneAndUpdate(
          { _id: new ObjectId(coupon) },
          { $inc: { usedCount: 1 } },
          { returnDocument: "after" }
        );
      if (updatedCoupon.usedCount >= updatedCoupon.usageLimit) {
        await db
          .collection("coupons")
          .updateOne(
            { _id: new ObjectId(coupon) },
            { $set: { status: "expired" } }
          );
        await db.collection("notifications").insertOne({
          heading: `Coupon ${updatedCoupon.code} Fully Utilized`,
          message: `Maximum user limit reached for this coupon`,
          icon: "mdi-check-circle",
          createdAt: new Date(),
        });
      }
      couponData = {
        discount: updatedCoupon.discountValue,
        code: updatedCoupon.code,
      };
    }

    products.forEach(async (pair) => {
      await db
        .collection("products")
        .updateOne(
          {
            _id: new ObjectId(pair["productId"]),
            "variants.size": pair.size,
            "variants.color": pair.color,
          },
          { $inc: { "variants.$.count": -pair.quantity } }
        );
    });

    const items = products.map((product) => ({
      status: "pending",
      productId: product.productId,
      quantity: product.quantity,
      price: product.price,
      offer: product.offer,
      varient: {
        size: product.size,
        color: product.color,
      },
      subtotal: product.price * product.quantity,
      total: Math.floor(
        (product.offer
          ? product.price * (1 - product.offer / 100)
          : product.price) * product.quantity
      ),
    }));
    const addressdetials = await db.collection("adress").findOne(
      { _id: new ObjectId(addressId) },
      {
        projection: {
          _id: 0,
        },
      }
    );

    const order = {
      paymentStatus: paymentStatus,
      userId: req.session.uid,
      address: addressdetials,
      paymentMethod: paymentMethod,
      items: items,
      subtotal: totals.subtotal,
      delivery: totals.delivery,
      discount: totals.discount,
      total: totals.total,
      ...(couponData && { coupon: couponData }),
      createdAt: new Date(),
    };
    if (paymentMethod === "razorpay" && paymentStatus === "pending") {
      order.paymentorderid = paymentorderid;
    }

    const result = await db.collection("orders").insertOne(order);

    if (req.body.from === "cart") {
      await db.collection("cart").deleteOne({ userid: req.session.uid });
    }

    if (paymentMethod === "razorpay" && paymentStatus === "pending") {
      res.render("user/checkoutfailed", { id: result.insertedId });
    } else {
      res.render("user/checkoutsuccess", { id: result.insertedId });
    }
};

const loadcheckout = async (req, res) => {
  const db = req.db;
    const productQuantities = req.body.cartItems || {};

    const products = [];
    const productIds = [];
    Object.values(productQuantities).forEach((item) => {
      productIds.push(item.productId);
      products.push(item);
    });

    const [dbProducts, addresses] = await Promise.all([
      db
        .collection("products")
        .find({
          _id: { $in: productIds.map((id) => new ObjectId(id)) },
        })
        .toArray(),
      db.collection("adress").find({ userId: req.session.uid }).toArray(),
    ]);

    let totalWithoutOffers = 0;
    let discount = 0;
    let deliveryCharges = 0;

    dbProducts.forEach((dbProduct) => {
      const matchingProducts = products.filter(
        (p) => p.productId === dbProduct._id.toString()
      );

      matchingProducts.forEach((product) => {
        const price = dbProduct.price;
        const quantity = product.quantity;
        const offer = dbProduct.offer || 0;

        totalWithoutOffers += price * quantity;

        if (offer > 0) {
          discount += price * (offer / 100) * quantity;
        }

        const discountedPricePerItem = price * (1 - offer / 100);
        if (discountedPricePerItem * quantity < 500) {
          deliveryCharges += 40;
        }
      });
    });

    const subtotal = totalWithoutOffers - discount;
    const totalAmount = subtotal + deliveryCharges;
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(req.session.uid) });
    const coupons = await db
      .collection("coupons")
      .find({
        _id: { $nin: (user.couponsUsed || []).map((id) => new ObjectId(id)) },
        startDate: { $lte: new Date() },
      })
      .toArray();
    const walletUserId =
      typeof req.session.uid === "string"
        ? new ObjectId(req.session.uid)
        : req.session.uid;
    const wallet = await db
      .collection("wallet")
      .findOne({ userId: walletUserId });
    res.render("user/checkout", {
      walletbalance: wallet ? wallet.balance : 0,
      coupons,
      addresses,
      products: dbProducts
        .map((dbProduct) => {
          const matchingProducts = products.filter(
            (p) => p.productId === dbProduct._id.toString()
          );
          return matchingProducts.map((product) => ({
            ...dbProduct,
            quantity: product.quantity,
            size: product.size,
            color: product.color,
          }));
        })
        .flat(),
      subtotal: Math.round(subtotal),
      deliveryFee: Math.round(deliveryCharges),
      discount: Math.round(discount),
      total: Math.round(totalAmount),
      from: req.body.from,
    });
};

const loadorderview = async (req, res) => {
  const orderId = req.params.orderId;
    const productId = req.params.productId;
    const { size, color } = req.query;

    const db = req.db;

    const order = await db.collection("orders").findOne({
      _id: new ObjectId(orderId),
    });

    const orderItem = order.items.find(
      (item) =>
        item.productId === productId &&
        item.varient.size === size &&
        item.varient.color === color
    );

    if (!orderItem) {
      throw new AppError("Order item not found", 404);
    }

    const product = await db.collection("products").findOne({
      _id: new ObjectId(productId),
    });

    const orderView = {
      paymentorderid: order.paymentorderid,
      paymentStatus: order.paymentStatus,
      _id: order._id,
      createdAt: order.createdAt,
      paymentMethod: order.paymentMethod,
      item: {
        ...orderItem,
        product,
      },
      address: order.address,
    };

    const returndoc = await db.collection("returns").findOne({
      orderid: orderId,
      productid: productId,
      varient: { size: size, color: color },
    });
    const returnStatus = returndoc?.status || "not-requested";

    res.render("user/orderviewpage", {
      order: orderView,
      returnStatus,
      razorpayKey: process.env.RAZORPAY_KEY_ID,
    });
};

const cancelOrder = async (req, res) => {
  const varient = JSON.parse(decodeURIComponent(req.query.varient));
    const productid = req.query.productid;
    const orderid = req.params.orderId;
    const db = req.db;

    const orderResult = await db.collection("orders").findOneAndUpdate(
      {
        _id: new ObjectId(orderid),
        "items.varient": varient,
      },
      {
        $set: {
          "items.$.status": "cancelled",
        },
      },
      {
        returnDocument: "after",
      }
    );

    const cancelledItem = orderResult.items.find(
      (item) =>
        item.productId === productid &&
        item.varient.size === varient.size &&
        item.varient.color === varient.color
    );

    const productResult = await db.collection("products").updateOne(
      {
        _id: new ObjectId(productid),
        "variants.size": varient.size,
        "variants.color": varient.color,
      },
      {
        $inc: {
          "variants.$.count": cancelledItem.quantity,
        },
      }
    );

    if (
      orderResult.paymentMethod === "wallet" ||
      orderResult.paymentMethod === "razorpay"
    ) {
      const refundAmount = cancelledItem.total;
      const rawUserId = req.session.uid;
      const walletUserId =
        typeof rawUserId === "string" ? new ObjectId(rawUserId) : rawUserId;

      await db.collection("wallet").updateOne(
        { userId: walletUserId },
        {
          $inc: { balance: refundAmount },
          $push: {
            transactions: {
              type: "credit",
              amount: refundAmount,
              date: new Date(),
              description: "Order cancelled refund",
            },
          },
        }
      );
    }

    if (!orderResult || productResult.modifiedCount === 0) {
      throw new AppError("Order or product not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
    });
};

const returnOrder = async (req, res) => {
  const { orderid, productid, varient, reason } = req.body;
    const db = req.db;
    const insertedReturn = await db.collection("returns").insertOne({
      orderid: orderid,
      productid: productid,
      varient: varient,
      date: new Date(),
      status: "pending",
      reason: reason,
    });
    await db.collection("notifications").insertOne({
      type: "return_request",
      title: "New Return Request",
      message: "You have a new order return request to review",
      icon: "mdi mdi-undo",
      iconClass: "text-warning",
      date: new Date(),
      isRead: false,
      returnId: insertedReturn.insertedId,
    });
    res.json({ status: "success" });
};

module.exports = {
  placeOrder,
  loadcheckout,
  loadorderview,
  cancelOrder,
  returnOrder,
};

