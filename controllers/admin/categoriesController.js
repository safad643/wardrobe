const { getPagination } = require("../../helpers/pagination");
const AppError = require("../../utils/AppError");

const loadcatogory = async (req, res) => {
  const db = req.db;

  const total = await db.collection("catogories").countDocuments({});
  const { currentPage, totalPages, skip, limit } = getPagination(
    req.query.page,
    total
  );

  const categories = await db
    .collection("catogories")
    .find({})
    .sort({ createdAt: -1, _id: -1 })
    .skip(skip)
    .limit(limit)
    .toArray();

  res.render("admin/nav/catogory", {
    categories,
    pagination: {
      currentPage,
      totalPages,
      total,
    },
  });
};

const catogoryaddload = (req, res) => {
  res.render("admin/forms/catogoryaddform.ejs");
};

const catogoryadd = async (req, res) => {
  const { catogoryName, description, offer } = req.body;

  const parsedOffer = Number(offer);
  const safeOffer =
    Number.isFinite(parsedOffer) && parsedOffer >= 0 && parsedOffer <= 100
      ? parsedOffer
      : 0;

  const data = {
    name: catogoryName.trim(),
    descr: description.trim(),
    offer: safeOffer,
    createdAt: new Date().toDateString(),
  };

  const db = req.db;
  const existingCategory = await db
    .collection("catogories")
    .findOne({ name: data.name });
  if (existingCategory) {
    throw new AppError("Category already exists.", 400);
  }

  await db.collection("catogories").insertOne(data);
  const categories = await db.collection("catogories").find({}).toArray();
  res.render("admin/nav/catogory", { categories });
};

const loadcatogupdate = async (req, res) => {
  const db = req.db;
  const { ObjectId } = require("mongodb");
  const categoryId = req.params.id;
  const category = await db
    .collection("catogories")
    .findOne({ _id: new ObjectId(categoryId) });
  if (!category) {
    throw new AppError("Category not found", 404);
  }
  res.render("admin/forms/catogoryupdateform", { category: category || null });
};

const catogoryupdate = async (req, res) => {
  try {
    const { name, description, offer } = req.body;
    const { ObjectId } = require("mongodb");
    const categoryId = req.params.id;
    const nameTrim = (name ?? "").trim();
    const descrTrim = typeof description === "string" ? description.trim() : "";

    const db = req.db;
    const currentCategory = await db
      .collection("catogories")
      .findOne({ _id: new ObjectId(categoryId) });

    if (!currentCategory) {
      return res.status(STATUS_CODES.NOT_FOUND).json({ error: "Category not found." });
    }

    const nextName = nameTrim || currentCategory.name;
    const nextDescr = descrTrim || currentCategory.descr;
    const parsedOffer = Number(offer);
    const nextOffer =
      Number.isFinite(parsedOffer) && parsedOffer >= 0 && parsedOffer <= 100
        ? parsedOffer
        : typeof currentCategory.offer === "number"
        ? currentCategory.offer
        : 0;

    const existingCategory = await db.collection("catogories").findOne({
      $and: [{ name: nextName }, { _id: { $ne: new ObjectId(categoryId) } }],
    });

    if (existingCategory) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({ error: "Category name must be unique." });
    }

    await db.collection("catogories").updateOne(
      { _id: new ObjectId(categoryId) },
      {
        $set: {
          name: nextName,
          descr: nextDescr,
          offer: nextOffer,
          updatedAt: new Date().toDateString(),
        },
      }
    );

    const categories = await db.collection("catogories").find({}).toArray();
    res.render("admin/nav/catogory", { categories });
  } catch (err) {
    console.error(err);
    res
      .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
      .json({ error: "An error occurred while processing your request." });
  }
};

const deletecatogory = async (req, res) => {
  try {
    const db = req.db;
    const { ObjectId } = require("mongodb");
    const categoryId = req.params.id;
    const { targetCategory } = req.body || {};

    const trimmedTarget = (targetCategory || "").trim();

    if (!trimmedTarget) {
      return res
        .status(STATUS_CODES.BAD_REQUEST)
        .json({ error: "Target category is required." });
    }

    const sourceCat = await db
      .collection("catogories")
      .findOne({ _id: new ObjectId(categoryId) });

    if (!sourceCat) {
      return res.status(STATUS_CODES.NOT_FOUND).json({ error: "Category to delete not found." });
    }

    if (sourceCat.name === trimmedTarget) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        error: "Target category must be different from the deleted category.",
      });
    }

    const targetCat = await db
      .collection("catogories")
      .findOne({ name: trimmedTarget });

    if (!targetCat) {
      return res.status(STATUS_CODES.NOT_FOUND).json({ error: "Target category not found." });
    }

    await db
      .collection("products")
      .updateMany({ category: sourceCat.name }, { $set: { category: trimmedTarget } });

    await db.collection("catogories").deleteOne({ _id: new ObjectId(categoryId) });

    const categories = await db.collection("catogories").find({}).toArray();
    res.render("admin/nav/catogory", { categories });
  } catch (err) {
    console.error(err);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).send("Internal Server Error");
  }
};

module.exports = {
  loadcatogory,
  catogoryaddload,
  catogoryadd,
  loadcatogupdate,
  catogoryupdate,
  deletecatogory,
};

