const mongo = require("../../mongodb/mongo");

const generateSalesData = async (period, startDate, endDate) => {
  const db = await mongo();

  let dateFilter = {};
  if (startDate && endDate) {
    dateFilter = {
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    };
  }

  const salesData = await db
    .collection("orders")
    .aggregate([
      { $match: dateFilter },
      { $unwind: "$items" },
      {
        $group: {
          _id: null,
          totalorders: { $sum: 1 },
          totalrevenue: {
            $sum: {
              $cond: [{ $ne: ["$items.status", "cancelled"] }, "$items.total", 0],
            },
          },
          cancelledorders: {
            $sum: {
              $cond: [{ $eq: ["$items.status", "cancelled"] }, 1, 0],
            },
          },
        },
      },
    ])
    .toArray();

  const groupByPeriod = {
    daily: {
      $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
    },
    weekly: {
      week: { $week: "$createdAt" },
      year: { $year: "$createdAt" },
    },
    monthly: {
      month: { $month: "$createdAt" },
      year: { $year: "$createdAt" },
    },
    yearly: {
      year: { $year: "$createdAt" },
    },
  };

  const periodData = await db
    .collection("orders")
    .aggregate([
      { $match: dateFilter },
      { $unwind: "$items" },
      {
        $group: {
          _id: groupByPeriod[period],
          orders: { $sum: 1 },
          totalSales: { $sum: "$items.subtotal" },
          revenue: {
            $sum: {
              $cond: [{ $ne: ["$items.status", "cancelled"] }, "$items.total", 0],
            },
          },
          startDate: { $min: "$createdAt" },
          endDate: { $max: "$createdAt" },
        },
      },
      {
        $sort:
          period === "daily"
            ? { _id: -1 }
            : period === "weekly"
              ? { "_id.year": -1, "_id.week": -1 }
              : period === "monthly"
                ? { "_id.year": -1, "_id.month": -1 }
                : { "_id.year": -1 },
      },
    ])
    .toArray();

  const returnFilter =
    startDate && endDate
      ? {
          status: "approved",
          date: {
            $gte: startDate,
            $lte: endDate,
          },
        }
      : { status: "approved" };

  const returnCount = await db.collection("returns").countDocuments(returnFilter);

  const formattedSalesData = {
    totalorders: salesData[0]?.totalorders || 0,
    totalrevenue: `₹${Math.round(salesData[0]?.totalrevenue || 0).toLocaleString(
      "en-IN"
    )}`,
    returnorders: returnCount,
    cancelledorders: salesData[0]?.cancelledorders || 0,
  };

  const formatDate = (data, index) => {
    const prevRevenue =
      index < periodData.length - 1 ? periodData[index + 1].revenue : 0;
    const growth =
      prevRevenue > 0
        ? Math.round(((data.revenue - prevRevenue) / prevRevenue) * 100 * 100) /
          100
        : 100;

    const baseFormat = {
      orders: data.orders,
      totalSales: `₹${Math.round(data.totalSales).toLocaleString("en-IN")}`,
      revenue: `₹${Math.round(data.revenue).toLocaleString("en-IN")}`,
      growth: `${growth}%`,
    };

    switch (period) {
      case "daily":
        return {
          date: new Date(data._id).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
          ...baseFormat,
        };
      case "weekly": {
        const startDateFormatted = new Date(data.startDate).toLocaleDateString(
          "en-IN",
          {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }
        );
        const endDateFormatted = new Date(data.endDate).toLocaleDateString(
          "en-IN",
          {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }
        );
        return {
          date: `Week ${index + 1} (${startDateFormatted} - ${endDateFormatted})`,
          ...baseFormat,
        };
      }
      case "monthly": {
        const monthName = new Date(data.startDate).toLocaleString("en-IN", {
          month: "long",
        });
        const year = new Date(data.startDate).getFullYear();
        return {
          date: `${monthName} ${year}`,
          ...baseFormat,
        };
      }
      case "yearly":
        return {
          date: `${data._id.year}`,
          ...baseFormat,
        };
    }
  };

  const tabledata = periodData.map((data, index) => formatDate(data, index));

  return { salesData: formattedSalesData, tabledata };
};

const generatesalesdata = async (req, res) => {
  try {
    const { period, identifier } = req.body;
    let start, end, result;

    if (identifier === "custom") {
      start = new Date(req.body.startDate);
      end = new Date(req.body.endDate);
    }

    result = await generateSalesData(period, start, end);
    res.json(result);
  } catch (error) {
    console.error("Error generating sales data:", error);
    res.status(500).json({ error: "Failed to generate sales data" });
  }
};

module.exports = { generatesalesdata };

