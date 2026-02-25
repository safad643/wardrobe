const loadhome = async (req, res) => {
  const db = req.db;
  const categories = await db.collection("catogories").find({}).toArray();
  const products = await db
    .collection("products")
    .find({ list: true })
    .toArray();

  if (req.session.user) {
    const user = await db
      .collection("users")
      .find({ email: req.session.data.email });
    return res.render("user/index", {
      categories,
      products,
      user,
      profilepic: req?.user?.profilepic,
    });
  }

  res.render("user/index", { categories, products });
};

const loadshop = async (req, res) => {
  const db = req.db;
  const categories = await db.collection("catogories").find({}).toArray();

  res.render("user/catogory", { categories, user: true });
};

const AppError = require("../../utils/AppError");

const loadproductview = async (req, res) => {
  const { slug } = req.params;
  const db = req.db;
  const categories = await db.collection("catogories").find({}).toArray();

  const product = await db.collection("products").findOne({ name: slug });

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  const categoryOfferMap = new Map(
    categories.map((c) => [c.name, Number(c.offer) || 0])
  );

  const productOffer = Number(product.offer) || 0;
  const categoryOffer = categoryOfferMap.get(product.category) || 0;
  product.effectiveOffer = Math.max(productOffer, categoryOffer);

  const relatedProductsRaw = await db
    .collection("products")
    .find({
      category: product.category,
      name: { $ne: product.name },
      list: true,
    })
    .limit(10)
    .toArray();

  const relatedProducts = relatedProductsRaw.map((p) => {
    const pOffer = Number(p.offer) || 0;
    const cOffer = categoryOfferMap.get(p.category) || 0;
    return { ...p, effectiveOffer: Math.max(pOffer, cOffer) };
  });

  res.render("user/productview", {
    categories,
    product,
    relatedProducts,
    userid: req.session.uid,
    user: true,
  });
};

const loadcategory = async (req, res) => {
  const { slug } = req.params;
  const db = req.db;
  const categories = await db.collection("catogories").find({}).toArray();
  const products = await db
    .collection("products")
    .find({ category: slug, list: true })
    .toArray();

  res.render("user/catogory", { categories, products, user: true });
};

const search = async (req, res) => {
  const db = req.db;
  const { search, filter, sort, page = 1, limit = 12 } = req.query;
  const itemsPerPage = parseInt(limit);

  let matchStage = { list: true };
  if (search) {
    matchStage.name = { $regex: search, $options: "i" };
  }
  if (filter) {
    matchStage.category = filter;
  }

  let sortStage = {};
  switch (sort) {
    case "price_asc":
      sortStage = { $sort: { offerPrice: 1 } };
      break;
    case "price_desc":
      sortStage = { $sort: { offerPrice: -1 } };
      break;
    case "name_asc":
      sortStage = { $sort: { name: 1 } };
      break;
    case "name_desc":
      sortStage = { $sort: { name: -1 } };
      break;
    default:
      sortStage = { $sort: { _id: 1 } };
  }

  const pipeline = [
    { $match: matchStage },
    {
      $addFields: {
        numericPrice: { $toDouble: "$price" },
        numericOffer: { $toDouble: "$offer" },
        offerPrice: {
          $subtract: [
            { $toDouble: "$price" },
            {
              $multiply: [
                { $toDouble: "$price" },
                { $divide: [{ $toDouble: "$offer" }, 100] },
              ],
            },
          ],
        },
      },
    },
    {
      $facet: {
        metadata: [{ $count: "total" }],
        products: [
          sortStage,
          { $skip: (page - 1) * itemsPerPage },
          { $limit: itemsPerPage },
          {
            $project: {
              _id: 1,
              name: 1,
              price: 1,
              offer: 1,
              offerPrice: 1,
              image: { $arrayElemAt: ["$images", 0] },
            },
          },
        ],
      },
    },
  ];

  const result = await db.collection("products").aggregate(pipeline).toArray();

  const totalProducts = result[0].metadata[0]?.total || 0;
  const totalPages = Math.ceil(totalProducts / itemsPerPage);
  const currentPage = parseInt(page);

  const validPage =
    currentPage > totalPages && totalPages > 0
      ? totalPages
      : currentPage < 1
      ? 1
      : currentPage;

  let products = result[0].products;
  if (validPage !== currentPage && totalPages > 0) {
    const correctedPipeline = [
      { $match: matchStage },
      {
        $addFields: {
          numericPrice: { $toDouble: "$price" },
          numericOffer: { $toDouble: "$offer" },
          offerPrice: {
            $subtract: [
              { $toDouble: "$price" },
              {
                $multiply: [
                  { $toDouble: "$price" },
                  { $divide: [{ $toDouble: "$offer" }, 100] },
                ],
              },
            ],
          },
        },
      },
      {
        $facet: {
          products: [
            sortStage,
            { $skip: (validPage - 1) * itemsPerPage },
            { $limit: itemsPerPage },
            {
              $project: {
                _id: 1,
                name: 1,
                price: 1,
                offer: 1,
                offerPrice: 1,
                image: { $arrayElemAt: ["$images", 0] },
              },
            },
          ],
        },
      },
    ];
    const correctedResult = await db
      .collection("products")
      .aggregate(correctedPipeline)
      .toArray();
    products = correctedResult[0].products;
  }

  res.json({
    products,
    pagination: {
      currentPage: validPage,
      totalPages: totalPages,
      totalProducts,
    },
  });
};

const getCategories = async (req, res) => {
  const db = req.db;
  const categories = await db.collection("catogories").find({}).toArray();

  res.json(categories);
};

module.exports = {
  loadhome,
  loadshop,
  loadproductview,
  loadcategory,
  search,
  getCategories,
};

