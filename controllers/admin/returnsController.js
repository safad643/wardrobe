const { ObjectId } = require("mongodb");
const { getPagination } = require("../../helpers/pagination");
const STATUS_CODES = require("../../constants/statusCodes");

const getReturnData = async (req, res) => {
  try {
    const db = req.db;
    const returnId = req.params.returnId;
    const returnData = await db
      .collection("returns")
      .findOne({ _id: new ObjectId(returnId) });
    const product = await db
      .collection("products")
      .findOne({ _id: new ObjectId(returnData.productid) });

    res.json({
      returnId: returnData._id,
      productName: product.name,
      size: returnData.varient.size,
      color: returnData.varient.color,
      price: product.price,
      orderId: returnData.orderid,
      returnDate: returnData.date,
      reason: returnData.reason,
      status: returnData.status,
      customerNotes: returnData.reason,
      images: product.images,
    });
  } catch (err) {
    console.error(err);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).send("Internal Server Error");
  }
};

const removeReturnNotification = async (req, res) => {
  try {
    const db = req.db;
    const returnId = req.params.returnId;
    await db
      .collection("notifications")
      .deleteOne({ returnId: new ObjectId(returnId) });
    res.json({
      success: true,
      message: "Return notification removed successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Error removing return notification",
    });
  }
};

const updateReturnStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const returnId = req.params.returnId;
    const db = req.db;

    const existingReturn = await db
      .collection("returns")
      .findOne({ _id: new ObjectId(returnId) });

    if (!existingReturn) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: "Return request not found",
      });
    }

    if (existingReturn.status !== "pending") {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: "Return request has already been processed",
      });
    }

    if (status === "approved") {
      const order = await db
        .collection("orders")
        .findOne({ orderNo: existingReturn.orderid });

      if (!order) {
        return res.status(STATUS_CODES.NOT_FOUND).json({
          success: false,
          message: "Order not found for this return request",
        });
      }

      const item = order.items.find(
        (item) =>
          item.productId === existingReturn.productid &&
          item.varient?.color === existingReturn.varient?.color &&
          item.varient?.size === existingReturn.varient?.size
      );

      if (!item) {
        return res.status(STATUS_CODES.NOT_FOUND).json({
          success: false,
          message: "Matching order item not found for this return request",
        });
      }

      const price = item.total;

      const rawUserId = order.userId;
      const walletUserId =
        typeof rawUserId === "string" ? new ObjectId(rawUserId) : rawUserId;

      await db.collection("wallet").updateOne(
        { userId: walletUserId },
        {
          $inc: { balance: price },
          $push: {
            transactions: {
              type: "credit",
              amount: price,
              date: new Date(),
              description: "Return refund",
            },
          },
        }
      );
    }

    await db
      .collection("returns")
      .updateOne(
        { _id: new ObjectId(existingReturn._id) },
        { $set: { status: status } }
      );

    res.json({ success: true, message: "Return status updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Error updating return status",
    });
  }
};

const loadreturnmanagment = async (req, res) => {
  try {
    const db = req.db;

    const total = await db.collection("returns").countDocuments({});
    const { currentPage, totalPages, skip, limit } = getPagination(
      req.query.page,
      total
    );

    const returns = await db
      .collection("returns")
      .find({})
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    res.render("admin/nav/returnmanagment", {
      returns,
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

module.exports = {
  loadreturnmanagment,
  updateReturnStatus,
  removeReturnNotification,
  getReturnData,
};

