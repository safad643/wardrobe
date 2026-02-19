const { ObjectId } = require("mongodb");

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
    res.status(500).send("Internal Server Error");
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
      return res.status(400).json({ message: "Product is in cart" });
    }

    const userWishlist = await db.collection("wishlist").findOne({
      userId: userId,
    });

    if (userWishlist && userWishlist.products.includes(productId)) {
      return res.status(400).json({ message: "Product already in wishlist" });
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

    res.status(200).json({ message: "Added to wishlist" });
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    res.status(500).json({ message: "Error adding to wishlist" });
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
      return res.status(404).json({ message: "Wishlist not found" });
    }

    await db
      .collection("wishlist")
      .updateOne({ userId: userId }, { $pull: { products: productId } });

    res.status(200).json({ message: "Removed from wishlist" });
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    res.status(500).json({ message: "Error removing from wishlist" });
  }
};

const checkWishlist = async (req, res) => {
  try {
    const db = req.db;
    const userId = req.session.uid;

    if (!userId) {
      return res.status(400).json({
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
    res.status(500).json({
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

