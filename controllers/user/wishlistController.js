const { ObjectId } = require("mongodb");
const STATUS_CODES = require("../../constants/statusCodes");

const loadWishlist = async (req, res) => {
  try {
    const db = req.db;
    const userId = req.session.uid;

    const userWishlist = await db.collection("wishlist").findOne({
      userId: userId,
    });

    let products = [];
    if (userWishlist && userWishlist.products.length > 0) {
      const productIds = userWishlist.products.map((id) => new ObjectId(id));
      products = await db
        .collection("products")
        .find({ _id: { $in: productIds } })
        .toArray();
    }

    res.render("user/wishlist", {
      products: products,
      user: true,
    });
  } catch (error) {
    console.error("Error loading wishlist:", error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).send("Internal Server Error");
  }
};

const addToWishlist = async (req, res) => {
  try {
    const db = req.db;
    const productId = req.params.productId;
    const userId = req.session.uid;

    const cart = await db.collection("cart").findOne({
      userid: userId,
      "products.productid": productId,
    });

    if (cart) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({ message: "Product is in cart" });
    }

    const userWishlist = await db.collection("wishlist").findOne({
      userId: userId,
    });

    if (userWishlist && userWishlist.products.includes(productId)) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({ message: "Product already in wishlist" });
    }

    await db.collection("wishlist").updateOne(
      { userId: userId },
      {
        $push: {
          products: productId,
        },
      },
      { upsert: true }
    );

    res.status(STATUS_CODES.OK).json({ message: "Added to wishlist" });
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: "Error adding to wishlist" });
  }
};

const removeFromWishlist = async (req, res) => {
  try {
    const db = req.db;
    const productId = req.params.productId;
    const userId = req.session.uid;

    const userWishlist = await db.collection("wishlist").findOne({
      userId: userId,
    });

    if (!userWishlist) {
      return res.status(STATUS_CODES.NOT_FOUND).json({ message: "Wishlist not found" });
    }

    await db
      .collection("wishlist")
      .updateOne({ userId: userId }, { $pull: { products: productId } });

    res.status(STATUS_CODES.OK).json({ message: "Removed from wishlist" });
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: "Error removing from wishlist" });
  }
};

const checkWishlist = async (req, res) => {
  try {
    const db = req.db;
    const userId = req.session.uid;

    if (!userId) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        message: "User not logged in",
      });
    }

    const userWishlist = await db.collection("wishlist").findOne({
      userId: userId,
    });

    const products = userWishlist ? userWishlist.products : [];
    res.json(products);
  } catch (error) {
    console.error("Error checking wishlist:", error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      message: "Internal server error",
    });
  }
};

module.exports = {
  loadWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlist,
};

