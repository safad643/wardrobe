const { ObjectId } = require("mongodb");
const AppError = require("../../utils/AppError");

const loadWishlist = async (req, res) => {
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
};

const addToWishlist = async (req, res) => {
  const db = req.db;
  const productId = req.params.productId;
  const userId = req.session.uid;

  const cart = await db.collection("cart").findOne({
    userid: userId,
    "products.productid": productId,
  });

  if (cart) {
    throw new AppError("Product is in cart", 400);
  }

  const userWishlist = await db.collection("wishlist").findOne({
    userId: userId,
  });

  if (userWishlist && userWishlist.products.includes(productId)) {
    throw new AppError("Product already in wishlist", 400);
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
};

const removeFromWishlist = async (req, res) => {
  const db = req.db;
  const productId = req.params.productId;
  const userId = req.session.uid;

  const userWishlist = await db.collection("wishlist").findOne({
    userId: userId,
  });

  if (!userWishlist) {
    throw new AppError("Wishlist not found", 404);
  }

  await db
    .collection("wishlist")
    .updateOne({ userId: userId }, { $pull: { products: productId } });

  res.status(200).json({ message: "Removed from wishlist" });
};

const checkWishlist = async (req, res) => {
  const db = req.db;
  const userId = req.session.uid;

  if (!userId) {
    throw new AppError("User not logged in", 400);
  }

  const userWishlist = await db.collection("wishlist").findOne({
    userId: userId,
  });

  const products = userWishlist ? userWishlist.products : [];
  res.json(products);
};

module.exports = {
  loadWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlist,
};

