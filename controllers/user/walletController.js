const mongo = require("../../mongodb/mongo");
const { ObjectId } = require("mongodb");

const updatewallet = async (req, res) => {
  const { amount, type } = req.body;
  const db = await mongo();
  const rawUserId = req.session.uid;
  const walletUserId =
    typeof rawUserId === "string" ? new ObjectId(rawUserId) : rawUserId;

  const balanceChange =
    type === "credit" ? parseInt(amount) : -parseInt(amount);

  await db.collection("wallet").updateOne(
    { userId: walletUserId },
    {
      $inc: { balance: balanceChange },
      $push: {
        transactions: {
          type,
          amount: amount,
          date: new Date(),
        },
      },
    },
    { upsert: true }
  );
  const wallet = await db
    .collection("wallet")
    .findOne({ userId: walletUserId });
  res.json({
    status: "success",
    balance: wallet.balance,
    date: wallet.transactions[wallet.transactions.length - 1].date,
    type: wallet.transactions[wallet.transactions.length - 1].type,
    amount: wallet.transactions[wallet.transactions.length - 1].amount,
  });
};

module.exports = { updatewallet };

