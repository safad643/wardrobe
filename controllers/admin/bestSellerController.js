
const switchBestSeller = async (req, res) => {
  try {
    const { table } = req.query;
    const db = req.db;
    if (table === "category") {
      const topCategories = await db
        .collection("orders")
        .aggregate([
          { $unwind: "$items" },
          {
            $addFields: {
              "items.productId": { $toObjectId: "$items.productId" },
            },
          },
          {
            $lookup: {
              from: "products",
              localField: "items.productId",
              foreignField: "_id",
              as: "product",
            },
          },
          { $unwind: "$product" },
          {
            $group: {
              _id: "$product.category",
              count: { $sum: 1 },
            },
          },
          { $sort: { count: -1 } },
          { $limit: 3 },
        ])
        .toArray();

      res.json({
        categories: topCategories.map((cat) => ({
          name: cat._id,
          orders: cat.count,
        })),
      });
    } else if (table === "product") {
      const topProducts = await db
        .collection("orders")
        .aggregate([
          { $unwind: "$items" },
          {
            $addFields: {
              "items.productId": { $toObjectId: "$items.productId" },
            },
          },
          {
            $lookup: {
              from: "products",
              localField: "items.productId",
              foreignField: "_id",
              as: "product",
            },
          },
          { $unwind: "$product" },
          {
            $group: {
              _id: "$product.name",
              count: { $sum: 1 },
            },
          },
          { $sort: { count: -1 } },
          { $limit: 3 },
        ])
        .toArray();

      res.json({
        products: topProducts.map((prod) => ({
          name: prod._id,
          orders: prod.count,
        })),
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { switchBestSeller };

