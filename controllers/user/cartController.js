const { ObjectId } = require("mongodb");
const STATUS_CODES = require("../../constants/statusCodes");

const addtocart = async (req, res) => {
  try {
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
      return res.status(STATUS_CODES.NOT_FOUND).json({ message: "Product or variant not found" });
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
      return res.status(STATUS_CODES.BAD_REQUEST).json({ message: "product already exist" });
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

    res.status(STATUS_CODES.OK).json({ message: "product added to cart" });
  } catch (err) {
    console.log(err);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: "Error updating cart" });
  }
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
  try {
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

    res.status(STATUS_CODES.OK).json({ message: "removed from cart" });
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to remove product from cart");
    res.redirect("/user/cart");
  }
};

const updatecart = async (req, res) => {
  try {
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

    if (result.modifiedCount === 0)
      return res.status(STATUS_CODES.NOT_FOUND).json({ message: "Product not found" });
    res.status(STATUS_CODES.OK).json({ message: "Quantity updated" });
  } catch (err) {
    console.error(err);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: "Error updating quantity" });
  }
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

