require("dotenv").config();

const { connect } = require("../mongodb/mongo");

async function seed() {
  try {
    const db = await connect();

    console.log("Connected to MongoDB. Starting seed...");

    const collectionsToClean = ["products", "catogories"];

    for (const name of collectionsToClean) {
      const exists = await db.listCollections({ name }).hasNext();
      if (!exists) {
        console.log(`Collection "${name}" does not exist, skipping clean.`);
        continue;
      }

      const result = await db.collection(name).deleteMany({});
      console.log(
        `Cleared collection "${name}": deleted ${result.deletedCount} documents.`
      );
    }

    const categories = [
      {
        name: "Men",
        descr: "Men's fashion and accessories",
        createdAt: new Date().toDateString(),
      },
      {
        name: "Women",
        descr: "Women's fashion and accessories",
        createdAt: new Date().toDateString(),
      },
      {
        name: "Kids",
        descr: "Kids clothing and essentials",
        createdAt: new Date().toDateString(),
      },
    ];

    const catResult = await db.collection("catogories").insertMany(categories);
    console.log(`Inserted ${catResult.insertedCount} categories.`);

    const products = [
      {
        name: "Classic White T-Shirt",
        descr: "Soft cotton t-shirt, regular fit.",
        price: 499,
        category: "Men",
        list: true,
        createdAt: new Date(),
        variants: [
          { color: "white", size: "S", count: 10 },
          { color: "white", size: "M", count: 15 },
          { color: "white", size: "L", count: 8 },
        ],
        images: [],
      },
      {
        name: "Denim Jacket",
        descr: "Blue denim jacket with button closure.",
        price: 1999,
        category: "Women",
        list: true,
        createdAt: new Date(),
        variants: [
          { color: "blue", size: "S", count: 5 },
          { color: "blue", size: "M", count: 7 },
        ],
        images: [],
      },
      {
        name: "Kids Hoodie",
        descr: "Warm hoodie perfect for everyday wear.",
        price: 899,
        category: "Kids",
        list: true,
        createdAt: new Date(),
        variants: [
          { color: "red", size: "4-5", count: 6 },
          { color: "blue", size: "6-7", count: 4 },
        ],
        images: [],
      },
    ];

    const prodResult = await db.collection("products").insertMany(products);
    console.log(`Inserted ${prodResult.insertedCount} products.`);

    console.log("Seeding finished.");
    process.exit(0);
  } catch (err) {
    console.error("Error while seeding database:", err);
    process.exit(1);
  }
}

seed();

