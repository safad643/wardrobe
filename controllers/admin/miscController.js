
// Legacy "toggle list" endpoint used by admin panel (users/categories/products).
const Delete = async (req, res) => {
  try {
    const { identifier, data, bool } = req.body;

    if (identifier === "user") {
      const db = req.db;
      await db
        .collection("users")
        .updateOne({ email: data }, { $set: { list: bool } });
      const user = await db.collection("users").find({}).toArray();
      res.render("admin/nav/usermanagment", { user });
    } else if (identifier === "catogories") {
      const db = req.db;
      await db
        .collection("catogories")
        .updateOne({ name: data }, { $set: { list: bool } });
      const a = await db.collection("catogories").find({}).toArray();
      res.render("admin/nav/catogory", { categories: a });
    } else if (identifier === "product") {
      const db = req.db;
      await db
        .collection("products")
        .updateOne({ name: data }, { $set: { list: bool } });
      const a = await db.collection("products").find({}).toArray();
      res.render("admin/nav/products", { products: a });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = { Delete };

