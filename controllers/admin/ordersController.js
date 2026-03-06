const { ObjectId } = require("mongodb");
const { getPagination } = require("../../helpers/pagination");
const STATUS_CODES = require("../../constants/statusCodes");

const loadordermanagment = async (req, res) => {
  try {
    const db = req.db;

    const countResult = await db
      .collection("orders")
      .aggregate([
        { $project: { itemCount: { $size: "$items" } } },
        {
          $group: {
            _id: null,
            totalItems: { $sum: "$itemCount" },
          },
        },
      ])
      .toArray();

    const total = countResult[0]?.totalItems || 0;
    const { currentPage, totalPages, skip, limit } = getPagination(
      req.query.page,
      total
    );

    const allOrderItems = await db
      .collection("orders")
      .aggregate([
        { $unwind: "$items" },
        { $sort: { createdAt: -1, _id: -1 } },
        { $skip: skip },
        { $limit: limit },
        {
          $project: {
            orderId: "$orderNo",
            createdAt: "$createdAt",
            paymentMethod: "$paymentMethod",
            paymentStatus: { $ifNull: ["$paymentStatus", "pending"] },
            productId: "$items.productId",
            status: "$items.status",
            quantity: "$items.quantity",
            price: "$items.price",
            total: "$items.total",
            varient: "$items.varient",
          },
        },
      ])
      .toArray();

    res.render("admin/nav/ordermanagment", {
      orders: allOrderItems,
      pagination: {
        currentPage,
        totalPages,
        total,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).send("Internal Server Error");
  }
};

const updateProductStatus = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const { productId, status, varient } = req.body;

    const db = req.db;

    const result = await db.collection("orders").updateOne(
      {
        orderNo: orderId,
        "items.productId": productId,
        "items.varient.color": varient.color,
        "items.varient.size": varient.size,
      },
      {
        $set: {
          "items.$.status": status,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(STATUS_CODES.NOT_FOUND).json({ error: "Order or product not found." });
    }

    res.json({
      success: true,
      message: "Product status updated successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      error: "An error occurred while updating the product status.",
    });
  }
};

const loadorderdetails = async (req, res) => {
  try {
    const { orderId, productId } = req.params;
    const varient = req.query.varient ? JSON.parse(req.query.varient) : null;
    const db = req.db;

    const order = await db.collection("orders").findOne(
      {
        orderNo: orderId,
        "items.productId": productId,
        ...(varient && { "items.varient": varient }),
      },
      {
        projection: {
          _id: 0,
        },
      }
    );
    const product = await db.collection("products").findOne(
      { _id: new ObjectId(order.items[0].productId) },
      { projection: { _id: 0, name: 1, images: { $slice: 1 } } }
    );
    const user = await db.collection("users").findOne(
      { _id: new ObjectId(order.userId) },
      { projection: { _id: 0, name: 1, email: 1 } }
    );
    res.json({
      order: {
        ...order,
        name: product.name,
        image: product.images[0],
        user: user,
      },
    });
  } catch (error) {
    console.error("Error loading order details:", error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      status: "error",
      message: "Failed to load order details",
    });
  }
};

module.exports = { loadordermanagment, updateProductStatus, loadorderdetails };

