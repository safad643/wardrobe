const { ObjectId } = require("mongodb");
const AppError = require("../../utils/AppError");

const addtocart = async (req, res) => {
  let { productid, varient } = req.body;
  const userid = req.session.uid;
  const db = req.db;

  const query = {
    _id: new ObjectId(productid),
    ...(varient && {
      variants: {
        $elemMatch: {
          color: varient.color,
          size: varient.size,
        },
      },
    }),
  };

  const product = await db.collection("products").findOne(query);

  if (!varient && product) {
    varient = product.variants[0];
  }

  if (!product) {
    throw new AppError("Product or variant not found", 404);
  }

  const matchingVariant = product.variants.find(
    (v) => v.color === varient.color && v.size === varient.size
  );

  varient.count = matchingVariant.count;

  const existingProduct = await db.collection("cart").findOne({
    userid: userid,
    products: {
      $elemMatch: {
        productid: productid,
        "varient.color": varient.color,
        "varient.size": varient.size,
      },
    },
  });

  if (existingProduct) {
    // If product is already in cart, just inform the client
    return res.status(200).json({ message: "product already exist" });
  }

  await db
    .collection("wishlist")
    .updateOne({ userId: userid }, { $pull: { products: productid } });

  await db.collection("cart").updateOne(
    { userid: userid },
    {
      $push: { products: { productid: productid, quantity: 1, varient } },
      $setOnInsert: { userid: userid },
    },
    { upsert: true }
  );

  res.status(200).json({ message: "product added to cart" });
};

const laodcart = async (req, res) => {
  const db = req.db;
  const products = await db
    .collection("products")
    .aggregate([
      {
        $lookup: {
          from: "cart",
          let: { productId: "$_id" },
          pipeline: [
            {
              $match: {
                userid: req.session.uid,
              },
            },
            { $unwind: "$products" },
            {
              $match: {
                $expr: {
                  $eq: ["$$productId", { $toObjectId: "$products.productid" }],
                },
              },
            },
            {
              $project: {
                quantity: "$products.quantity",
                varient: "$products.varient",
                _id: 0,
              },
            },
          ],
          as: "cartDetails",
        },
      },
      { $unwind: "$cartDetails" },
      {
        $addFields: {
          quantity: "$cartDetails.quantity",
          varient: {
            $let: {
              vars: {
                matchingVariant: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$variants",
                        cond: {
                          $and: [
                            {
                              $eq: [
                                "$$this.color",
                                "$cartDetails.varient.color",
                              ],
                            },
                            {
                              $eq: ["$$this.size", "$cartDetails.varient.size"],
                            },
                          ],
                        },
                      },
                    },
                    0,
                  ],
                },
              },
              in: {
                color: "$cartDetails.varient.color",
                size: "$cartDetails.varient.size",
                count: "$$matchingVariant.count",
              },
            },
          },
        },
      },
      {
        $project: {
          cartDetails: 0,
        },
      },
    ])
    .toArray();

  res.render("user/cart", { products, userid: req.session.uid, user: true });
};

const removeFromCart = async (req, res) => {
  const productId = req.params.productId;
  const userId = req.session.uid;
  const { size, color } = req.query;

  const db = req.db;

  await db.collection("cart").updateOne(
    { userid: userId },
    {
      $pull: {
        products: {
          productid: productId,
          "varient.size": size,
          "varient.color": color,
        },
      },
    }
  );

  res.status(200).json({ message: "removed from cart" });
};

const updatecart = async (req, res) => {
  const { productid, userid, quantity, varient } = req.body;

  const db = req.db;

  const result = await db.collection("cart").updateOne(
    {
      userid,
      products: {
        $elemMatch: {
          productid: productid,
          "varient.size": varient.size,
          "varient.color": varient.color,
        },
      },
    },
    { $set: { "products.$.quantity": quantity } }
  );

  if (result.modifiedCount === 0) {
    throw new AppError("Product not found", 404);
  }
  res.status(200).json({ message: "Quantity updated" });
};

const getwishlist_cartcount = async (req, res) => {
  const db = req.db;
  const userId = req.session.uid;
  const wishlist = await db.collection("wishlist").findOne({ userId: userId });
  const cart = await db.collection("cart").findOne({ userid: userId });
  res.json({
    wishlistcount: wishlist ? wishlist.products.length : 0,
    cartcount: cart ? cart.products.length : 0,
  });
};

module.exports = {
  addtocart,
  laodcart,
  removeFromCart,
  updatecart,
  getwishlist_cartcount,
};

