const fs = require("fs");
const { getPagination } = require("../../helpers/pagination");
const AppError = require("../../utils/AppError");

const loadproducts = async (req, res) => {
  const db = req.db;

  const total = await db.collection("products").countDocuments({});
  const { currentPage, totalPages, skip, limit } = getPagination(
    req.query.page,
    total
  );

  const products = await db
    .collection("products")
    .find({})
    .sort({ createdAt: -1, _id: -1 })
    .skip(skip)
    .limit(limit)
    .toArray();

  res.render("admin/nav/products", {
    products,
    pagination: {
      currentPage,
      totalPages,
      total,
    },
  });
};

const productupdateload = async (req, res) => {
  const db = req.db;
  const { ObjectId } = require("mongodb");
  const productId = req.params.id;
  const product = await db
    .collection("products")
    .findOne({ _id: new ObjectId(productId) });
  if (!product) {
    throw new AppError("Product not found", 404);
  }
  const optionsobj = await db
    .collection("catogories")
    .find({}, { projection: { name: 1, _id: 0 } })
    .toArray();
  const options = optionsobj.map((doc) => doc.name);
  res.render("admin/forms/productupdate", { options, product });
};

const productaddload = async (req, res) => {
  const db = req.db;
  const optionsobj = await db
    .collection("catogories")
    .find({}, { projection: { name: 1, _id: 0 } })
    .toArray();
  const options = optionsobj.map((doc) => doc.name);
  res.render("admin/forms/productadd", { options });
};

const productadd = async (req, res) => {
  const db = req.db;
  const existingProduct = await db
    .collection("products")
    .findOne({ name: req.body.name });
  if (existingProduct) {
    throw new AppError("Product name already exists", 400);
  }

  const imageData = [req.body.image0, req.body.image1, req.body.image2];
  delete req.body.image0;
  delete req.body.image1;
  delete req.body.image2;

  const variants = [];
  for (const [key, value] of Object.entries(req.body)) {
    if (key.startsWith("variant_")) {
      const [, color, size] = key.split("_");
      variants.push({
        color,
        size,
        count: parseInt(value),
      });
      delete req.body[key];
    }
  }

  req.body.list = true;
  req.body.createdAt = new Date();
  const result = await db.collection("products").insertOne(req.body);
  const productId = result.insertedId;

  const dirPath = `./images/${productId}`;
  fs.mkdirSync(dirPath, { recursive: true });

  const imagePaths = [];
  for (let i = 0; i < imageData.length; i++) {
    if (imageData[i]) {
      const base64Data = imageData[i].replace(
        /^data:image\/\w+;base64,/,
        ""
      );
      const binary = Buffer.from(base64Data, "base64");
      const imagePath = `/images/${productId}/image${i}.png`;

      fs.writeFileSync(dirPath + `/image${i}.png`, binary);
      imagePaths.push(imagePath);
    }
  }

  await db.collection("products").updateOne(
    { _id: productId },
    {
      $set: {
        variants,
        images: imagePaths,
      },
    }
  );

  const products = await db.collection("products").find({}).toArray();
  res.render("admin/nav/products", { products });
};

const productupdate = async (req, res) => {
  const db = req.db;
  const { ObjectId } = require("mongodb");
  const productId = req.params.id;
  const product = await db
    .collection("products")
    .findOne({ _id: new ObjectId(productId) });
  if (!product) {
    throw new AppError("Product not found", 404);
  }
  const existingProduct = await db.collection("products").findOne({
    $and: [{ name: req.body.name }, { _id: { $ne: new ObjectId(productId) } }],
  });
  if (existingProduct) {
    throw new AppError("Product name already exists", 400);
  }

  delete req.body.ogname;

  const variants = [];
  for (const key in req.body) {
    if (key.startsWith("variant_")) {
      const [, color, size] = key.split("_");
      const count = parseInt(req.body[key]);
      delete req.body[key];

      const existingVariantIndex = variants.findIndex(
        (v) => v.color === color && v.size === size
      );

      if (existingVariantIndex >= 0) {
        variants[existingVariantIndex].count = count;
      } else {
        variants.push({ color, size, count });
      }
    }
  }
  req.body.variants = variants;

  const imageData = [req.body.image0, req.body.image1, req.body.image2];
  delete req.body.image0;
  delete req.body.image1;
  delete req.body.image2;

  for (let i = 0; i < imageData.length; i++) {
    if (imageData[i]) {
      const base64Data = imageData[i].replace(
        /^data:image\/\w+;base64,/,
        ""
      );
      const binary = Buffer.from(base64Data, "base64");
      const imagePath = `/images/${productId}/image${i}.png`;

      fs.writeFileSync(`./images/${productId}/image${i}.png`, binary);

      await db.collection("products").updateOne(
        { _id: productId },
        { $set: { [`images.${i}`]: imagePath } }
      );
    }
  }

  req.body.updatedAt = new Date();

  await db.collection("products").updateOne(
    { _id: productId },
    { $set: { ...req.body } }
  );

  const products = await db.collection("products").find({}).toArray();
  res.render("admin/nav/products", { products });
};

module.exports = {
  loadproducts,
  productupdateload,
  productupdate,
  productaddload,
  productadd,
};

