require("dotenv").config();

const { connect } = require("../mongodb/mongo");

async function cleanCollections() {
  try {
    const db = await connect();

    const collections = ["users", "products", "catogories", "orders", "returns"];

    console.log("Connected to MongoDB. Starting cleanup...");

    for (const name of collections) {
      const exists = await db.listCollections({ name }).hasNext();
      if (!exists) {
        console.log(`Collection "${name}" does not exist, skipping.`);
        continue;
      }

      const result = await db.collection(name).deleteMany({});
      console.log(
        `Cleared collection "${name}": deleted ${result.deletedCount} documents.`
      );
    }

    console.log("Cleanup finished.");
    process.exit(0);
  } catch (err) {
    console.error("Error while cleaning database:", err);
    process.exit(1);
  }
}

cleanCollections();

