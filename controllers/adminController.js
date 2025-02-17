const { buffer } = require("stream/consumers");
const mongo = require("../mongodb/mongo");
const fs = require("fs");
const { error } = require("console");
const { ObjectId } = require("mongodb");

const loadlogin = (req, res) => {
  try {
    res.render("admin/login.ejs", { msg: "" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

const loginverify = async (req, res) => {
  try {
    const { email, password } = req.body;
    const db = await mongo();

    const adminData = await db.collection("admin").find({ email }).toArray();
    if (adminData[0]?.password === password) {
      req.session.admin = true;
      req.session.name = adminData[0].name;
      res.redirect("admin/dashboard");
    } else {
      res.render("admin/login.ejs", { msg: "invalid credentials" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

const loadusermanagment = async (req, res) => {
  try {
    const db = await mongo();
    const user = await db.collection("users").find({}).toArray();
    res.render("admin/nav/usermanagment", { user });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

const userupdateLoad = async (req, res) => {
  try {
    res.render("admin/forms/userupdate", { error: '', ogmail: '' });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

const Delete = async (req, res) => {
  try {
    const { identifier, data, bool } = req.body;

    if (identifier === "user") {
      const db = await mongo();
      await db.collection("users").updateOne({ email: data }, { $set: { list: bool } });
      const user = await db.collection("users").find({}).toArray();
      res.render("admin/nav/usermanagment", { user });
    } else if (identifier === "catogories") {
      const db = await mongo();
      await db.collection("catogories").updateOne({ name: data }, { $set: { list: bool } });
      const a = await db.collection("catogories").find({}).toArray();
      res.render("admin/nav/catogory", { categories: a });
    } else if (identifier === "product") {
      const db = await mongo();
      await db.collection("products").updateOne({ name: data }, { $set: { list: bool } });
      const a = await db.collection("products").find({}).toArray();
      res.render("admin/nav/products", { products: a });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

const loadAdduser = (req, res) => {
  try {
    res.render("admin/forms/addform.ejs");
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

const loadcatogory = async (req, res) => {
  try {
    const db = await mongo();
    const categories = await db.collection("catogories").find({}).toArray();
    res.render("admin/nav/catogory", { categories });
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
    const existingCategory = await db.collection("catogories").findOne({ name: data.name });
    if (existingCategory) {
      return res.status(400).json({ error: "Category already exists." });
    }

    await db.collection("catogories").insertOne(data);
    const categories = await db.collection("catogories").find({}).toArray();
    res.render("admin/nav/catogory", { categories });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred while processing your request." });
  }
};

const loadcatogupdate = (req, res) => {
  try {
    res.render("admin/forms/catogoryupdateform");
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

const catogoryupdate = async (req, res) => {
  try {
    const { ogname, name, description } = req.body;

console.log(name.trim());

    
    const db = await mongo();
    const existingCategory = await db.collection("catogories").findOne({
      $and: [
        { name: name.trim() },
        { name: { $ne: ogname.trim() } } 
      ]
    });
console.log(existingCategory);

    if (existingCategory) {
      return res.status(400).json({ error: "Category name must be unique." });
    }

   
    await db.collection("catogories").updateOne(
      { name: ogname.trim() },
      { $set: { name: name.trim(),description} }
    );

    
    const categories = await db.collection("catogories").find({}).toArray();
    res.render("admin/nav/catogory", { categories });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred while processing your request." });
  }
};

const deletecatogory = async (req, res) => {
  try {
    const db = await mongo();
    await db.collection("catogories").deleteOne({ name: req.body.name });
    const a = await db.collection("catogories").find({}).toArray();
    res.render("admin/nav/catogory", { categories: a });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

const loaddashboard = async (req, res) => {
  try {
    const db = await mongo();
    const notifications = await db.collection("notifications").find({}).toArray();
    res.render("admin/dashboard", { adminName: req.session.name, notifications });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

const loadproducts = async (req, res) => {
  try {
    const db = await mongo();
    const products = await db.collection("products").find({}).toArray();
    res.render("admin/nav/products", { products });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

const productupdateload = async (req, res) => {
  try {
    const db = await mongo();
    const optionsobj = await db.collection("catogories").find({}, { projection: { name: 1, _id: 0 } }).toArray();
    let options = [];
    optionsobj.forEach((doc) => {
      options.push(doc.name);
    });
    res.render("admin/forms/productupdate", { options });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

const productaddload = async (req, res) => {
  try {
    const db = await mongo();
    const optionsobj = await db.collection("catogories").find({}, { projection: { name: 1, _id: 0 } }).toArray();
    let options = [];
    optionsobj.forEach((doc) => {
      options.push(doc.name);
    });
    res.render("admin/forms/productadd", { options });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

  const productadd = async (req, res) => {
  try {
    const db = await mongo();
    const existingProduct = await db.collection("products").findOne({ name: req.body.name });
    if (existingProduct) {
      return res.status(400).json({ error: "Product name already exists" });
    }

    // Save images and variants from req.body
    const imageData = [req.body.image0, req.body.image1, req.body.image2];
    delete req.body.image0;
    delete req.body.image1; 
    delete req.body.image2;

    // Extract variants
    const variants = [];
    for (const [key, value] of Object.entries(req.body)) {
      if (key.startsWith('variant_')) {
        const [_, color, size] = key.split('_');
        variants.push({
          color: color,
          size: size,
          count: parseInt(value)
        });
        delete req.body[key];
      }
    }

    // Create initial document
    req.body.list = true;
    const result = await db.collection("products").insertOne(req.body);
    const productId = result.insertedId;

    // Create directory with product ID
    const dirPath = `./images/${productId}`;
    fs.mkdirSync(dirPath, { recursive: true });

    // Upload images and save paths
    const imagePaths = [];
    for (let i = 0; i < imageData.length; i++) {
      if (imageData[i]) {
        const base64Data = imageData[i].replace(/^data:image\/\w+;base64,/, "");
        const binary = Buffer.from(base64Data, "base64");
        const imagePath = `/images/${productId}/image${i}.png`;
        
        fs.writeFileSync(dirPath + `/image${i}.png`, binary);
        imagePaths.push(imagePath);
      }
    }

    // Update document with variants and image paths
    await db.collection("products").updateOne(
      { _id: productId },
      { 
        $set: {
          variants: variants,
          images: imagePaths
        }
      }
    );

    const products = await db.collection("products").find({}).toArray();
    res.render("admin/nav/products", { products });

  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

const productupdate = async (req, res) => {
  try {
    const db = await mongo();
    const existingProduct = await db.collection("products").findOne({$and: [
      { name: req.body.name },
      { name: { $ne: req.body.ogname } } 
    ]});
    if (existingProduct) {
      return res.status(400).json({ error: "Product name already exists" });
    }

    // Get product ID from original name
    const product = await db.collection("products").findOne({ name: req.body.ogname });
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    const productId = product._id;

    // Remove ogname from req.body so it doesn't get added to document
    delete req.body.ogname;

    // Handle variants
    const variants = [];
    for (const key in req.body) {
      if (key.startsWith('variant_')) {
        const [_, color, size] = key.split('_');
        const count = parseInt(req.body[key]);
        delete req.body[key];

        const existingVariantIndex = variants.findIndex(v => 
          v.color === color && v.size === size
        );

        if (existingVariantIndex >= 0) {
          variants[existingVariantIndex].count = count;
        } else {
          variants.push({
            color: color,
            size: size,
            count: count
          });
        }
      }
    }
    req.body.variants = variants;

    // Handle images
    const imageData = [req.body.image0, req.body.image1, req.body.image2];
    delete req.body.image0;
    delete req.body.image1;
    delete req.body.image2;

    // Process and save each image individually
    for (let i = 0; i < imageData.length; i++) {
      if (imageData[i]) {
        const base64Data = imageData[i].replace(/^data:image\/\w+;base64,/, "");
        const binary = Buffer.from(base64Data, "base64");
        const imagePath = `/images/${productId}/image${i}.png`;
        
        fs.writeFileSync(`./images/${productId}/image${i}.png`, binary);

        // Update the specific image index in the database
        await db.collection("products").updateOne(
          { _id: productId },
          { $set: { [`images.${i}`]: imagePath } }
        );
      }
    }

    // Update other product fields
    await db.collection("products").updateOne(
      { _id: productId }, 
      { $set: { ...req.body } }
    );

    const products = await db.collection("products").find({}).toArray();
    res.render("admin/nav/products", { products });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

const loadordermanagment = async (req, res) => {
  try {
    const db = await mongo();
    const orders = await db.collection("orders").find({}).sort({ createdAt: -1 }).toArray();
    
    // Create array to hold all order items
    let allOrderItems = [];

    // Iterate through each order
    for (const order of orders) {
      // Iterate through items in each order
      for (const item of order.items) {
        // Create new object for each item with common order properties
        const orderItem = {
          orderId: order._id,
          createdAt: order.createdAt,
          paymentMethod: order.paymentMethod,
          paymentStatus: order.paymentStatus || 'pending', // Default to pending if not set
          // Item specific properties
          productId: item.productId,
          status: item.status,
          quantity: item.quantity,
          price: item.price,
          total: item.total,
          varient: item.varient // Include size and color
        };
        
        allOrderItems.push(orderItem);
      }
    }

    // Sort all items by creation date descending
    allOrderItems.sort((a, b) => b.createdAt - a.createdAt);

    res.render("admin/nav/ordermanagment", { orders: allOrderItems });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};



const updateProductStatus = async (req, res) => {
    try {
        const { orderId, productId, status,varient } = req.body;
        
        const db = await mongo();
        
        // Update the specific product's status in the order
        const result = await db.collection("orders").updateOne(
            { 
                _id: new ObjectId(orderId),
                "items.productId": productId ,
                "items.varient.color": varient.color,
                "items.varient.size": varient.size
            },
            { 
                $set: { 
                    "items.$.status": status,
                    updatedAt: new Date()
                } 
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: "Order or product not found." });
        }

        res.json({ 
            success: true, 
            message: "Product status updated successfully" 
        });
        
    } catch (err) {
        console.error(err);
        res.status(500).json({ 
            error: "An error occurred while updating the product status." 
        });
    }
};

const loadcoupons = async (req, res) => {
  try {
    const db = await mongo();
    const coupons = await db.collection("coupons").find({}).toArray();
    
    // Fetch categories and create a map of category IDs to names
    const categories = await db.collection("catogories").find({}).toArray();
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat._id.toString()] = cat.name;
    });

    // Add category name to each coupon
    const couponsWithCategories = coupons.map(coupon => {
      return {
        ...coupon,
        catogory: categoryMap[coupon.applicableCategories] || 'Unknown Category'
      };
    });
    
    res.render("admin/nav/coupons", { coupons: couponsWithCategories });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

const loadaddcoupon = async (req, res) => {
 
   
    try {
      const db = await mongo();
      const categories = await db.collection("catogories").find({}).toArray();
      res.render("admin/forms/couponadd", { categories });
    } catch (err) {
      console.error(err)
    }
 
  
}

const addCoupon = async (req, res) => {
  try {
    const db = await mongo();
    
    // Check if coupon code already exists
    const existingCoupon = await db.collection("coupons").findOne({
      code: req.body.code
    });

    if (existingCoupon) {
      return res.json({
        success: false,
        message: "Coupon code already exists"
      });
    }

    // Create new coupon document
    const couponDoc = {
      code: req.body.code,
      discountValue: req.body.discountValue,
      minPurchase: parseInt(req.body.minPurchase),
      startDate: new Date(req.body.startDate),
      endDate: new Date(req.body.endDate), 
      usageLimit: parseInt(req.body.usageLimit),
      usedCount: 0,
      applicableCategories: req.body.applicableCategories,
      list: true
    };

    // Insert the coupon
    await db.collection("coupons").insertOne(couponDoc);

    res.json({
      success: true,
      message: "Coupon added successfully"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error adding coupon"
    });
  }
};


const deleteCoupon = async (req, res) => {
  try {
    const db = await mongo();
    
    // Delete the coupon using the id from request body
    const result = await db.collection("coupons").deleteOne({
      _id: new ObjectId(req.body.id)
    });

    if(result){
      res.json({
        success: true,
        message: "Coupon deleted successfully"
      })
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false, 
      message: "Error deleting coupon"
    });
  }
};

const loadupdatecoupon = async (req, res) => {
  try {
    const id = req.body.id
    const db = await mongo(); 
    const categories = await db.collection("catogories").find({}).toArray();
    const coupon = await db.collection("coupons").findOne({ _id: new ObjectId(id) });
    res.render("admin/forms/updatecoupon", { categories, coupon });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

const updatecoupon = async (req, res) => {
console.log(req.body);
  try {
    const db = await mongo();
    const data = {...req.body.data};
    data.startDate = new Date(data.startDate);
    data.endDate = new Date(data.endDate);
    await db.collection("coupons").updateOne({ _id: new ObjectId(req.body.id) }, { $set: data });
    const coupons = await db.collection("coupons").find({}).toArray();
    // Attach category names to each coupon
    for (let coupon of coupons) {
      const category = await db.collection("catogories").findOne({
        _id: new ObjectId(coupon.applicableCategories)
      });
      coupon.catogory = category ? category.name : 'N/A';
    }
    res.render("admin/nav/coupons", { coupons });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

const getReturnData = async (req, res) => {
  try {
    const db = await mongo();
    const returnId = req.params.returnId;
    const returnData = await db.collection("returns").findOne({ _id: new ObjectId(returnId) });
    const product = await db.collection("products").findOne({ _id: new ObjectId(returnData.productid) });
    

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
      images: product.images
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

const removeReturnNotification = async (req, res) => {
  
  try {
    const db = await mongo();
    const returnId = req.body.returnid;
    await db.collection("notifications").deleteOne({ returnId: new ObjectId(returnId) });
    res.json({ success: true, message: "Return notification removed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error removing return notification" });
  }
};

const updateReturnStatus = async (req, res) => {
  const {returnid,status} = req.body;
  const db = await mongo();
  if(status === 'approved'){
    console.log('approved');
    
    const returnData = await db.collection("returns").findOne({ _id: new ObjectId(returnid) });
    const order = await db.collection("orders").findOne({ _id: new ObjectId(returnData.orderid) });
    const item = order.items.find(item => item.productId === returnData.productid && item.varient.color === returnData.varient.color && item.varient.size === returnData.varient.size);
    const price = item.price;
   
    console.log(order.userId);
    const walletUpdate = await db.collection("wallet").updateOne(
      { userId:order.userId },
      { 
        $inc: { balance: price },
        $push: {
          transactions: {
            type: "credit",
            amount: price,
            date: new Date(),
            description: "Return refund"
          }
        }
      }
    );
    console.log('Wallet update successful:', walletUpdate.modifiedCount > 0);
  }
  
  await db.collection("returns").updateOne({ _id: new ObjectId(returnid) }, { $set: { status: status } });
  res.json({ success: true, message: "Return status updated successfully" });
}

const loadreturnmanagment = async (req, res) => {
  try {
    const db = await mongo();
    const returns = await db.collection("returns").find({}).toArray();
    res.render("admin/nav/returnmanagment", { returns });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
}
module.exports = {
  loadreturnmanagment,
  updateReturnStatus,
  removeReturnNotification,
  getReturnData,
  updatecoupon,
  loadupdatecoupon,
  deleteCoupon,
  addCoupon,
  loadaddcoupon,
  loadcoupons,
  updateProductStatus,
  loadordermanagment,
  productupdate,
  productadd,
  productaddload,
  productupdateload,
  loadproducts,
  loaddashboard,
  loadlogin,
  loginverify,
  userupdateLoad,
  loadusermanagment,
  Delete,
  loadAdduser,
  loadcatogory,
  catogoryaddload,
  catogoryadd,
  loadcatogupdate,
  catogoryupdate,
  deletecatogory,
  updateProductStatus,
};