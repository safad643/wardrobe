const mongo = require("../../mongodb/mongo");
const { getPagination } = require("../../helpers/pagination");

const loadcatogory = async (req, res) => {
  try {
    const db = await mongo();

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
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

const catogoryaddload = (req, res) => {
  try {
    res.render("admin/forms/catogoryaddform.ejs");
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

const catogoryadd = async (req, res) => {
  try {
    const { catogoryName, description } = req.body;

    const data = {
      name: catogoryName.trim(),
      descr: description.trim(),
      createdAt: new Date().toDateString(),
    };

    const db = await mongo();
    const existingCategory = await db
      .collection("catogories")
      .findOne({ name: data.name });
    if (existingCategory) {
      return res.status(400).json({ error: "Category already exists." });
    }

    await db.collection("catogories").insertOne(data);
    const categories = await db.collection("catogories").find({}).toArray();
    res.render("admin/nav/catogory", { categories });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "An error occurred while processing your request." });
  }
};

const loadcatogupdate = async (req, res) => {
  try {
    const db = await mongo();
    const { ObjectId } = require("mongodb");
    const categoryId = req.params.id;
    const category = await db
      .collection("catogories")
      .findOne({ _id: new ObjectId(categoryId) });
    if (!category) {
      return res.status(404).send("Category not found");
    }
    res.render("admin/forms/catogoryupdateform", { category: category || null });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

const catogoryupdate = async (req, res) => {
  try {
    const { name, description } = req.body;
    const { ObjectId } = require("mongodb");
    const categoryId = req.params.id;
    const nameTrim = (name ?? "").trim();
    const descrTrim = typeof description === "string" ? description.trim() : "";

    const db = await mongo();
    const currentCategory = await db
      .collection("catogories")
      .findOne({ _id: new ObjectId(categoryId) });

    if (!currentCategory) {
      return res.status(404).json({ error: "Category not found." });
    }

    const nextName = nameTrim || currentCategory.name;
    const nextDescr = descrTrim || currentCategory.descr;

    const existingCategory = await db.collection("catogories").findOne({
      $and: [{ name: nextName }, { _id: { $ne: new ObjectId(categoryId) } }],
    });

    if (existingCategory) {
      return res.status(400).json({ error: "Category name must be unique." });
    }

    await db.collection("catogories").updateOne(
      { _id: new ObjectId(categoryId) },
      {
        $set: {
          name: nextName,
          descr: nextDescr,
          updatedAt: new Date().toDateString(),
        },
      }
    );

    const categories = await db.collection("catogories").find({}).toArray();
    res.render("admin/nav/catogory", { categories });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "An error occurred while processing your request." });
  }
};

const deletecatogory = async (req, res) => {
  try {
    const db = await mongo();
    const { ObjectId } = require("mongodb");
    const categoryId = req.params.id;
    const { targetCategory } = req.body || {};

    const trimmedTarget = (targetCategory || "").trim();

    if (!trimmedTarget) {
      return res
        .status(400)
        .json({ error: "Target category is required." });
    }

    const sourceCat = await db
      .collection("catogories")
      .findOne({ _id: new ObjectId(categoryId) });

    if (!sourceCat) {
      return res.status(404).json({ error: "Category to delete not found." });
    }

    if (sourceCat.name === trimmedTarget) {
      return res.status(400).json({
        error: "Target category must be different from the deleted category.",
      });
    }

    const targetCat = await db
      .collection("catogories")
      .findOne({ name: trimmedTarget });

    if (!targetCat) {
      return res.status(404).json({ error: "Target category not found." });
    }

    await db
      .collection("products")
      .updateMany({ category: sourceCat.name }, { $set: { category: trimmedTarget } });

    await db.collection("catogories").deleteOne({ _id: new ObjectId(categoryId) });

    const categories = await db.collection("catogories").find({}).toArray();
    res.render("admin/nav/catogory", { categories });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
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

