const { buffer } = require("stream/consumers");
const mongo = require("../mongodb/mongo");
const fs = require("fs");
const { error } = require("console");
const loadlogin = (req, res) => {
  res.render("admin/login.ejs", { msg: "" });
};

const loginverify = async (req, res) => {
  const { email, password } = req.body;
  const db = await mongo();

  const adminData = await db.collection("admin").find({ email }).toArray();
  if (adminData[0]?.password === password) {
    req.session.admin = true
    req.session.name=adminData[0].name
    res.redirect("admin/dashboard")
  } else {
    res.render("admin/login.ejs", { msg: "invalid credentials" })
  }
};

const loadusermanagment = async (req, res) => {
  const db = await mongo();
  const user = await db.collection("users").find({}).toArray();
  res.render("admin/nav/usermanagment", { user });
};

const userupdateLoad = async (req, res) => {
  res.render("admin/forms/userupdate",{error:'',ogmail:''})
};








const Delete = async (req, res) => {
  const { identifier, data, bool } = req.body;
  

  if (identifier === "user") {
    
    
    const db = await mongo();
    try {
      await db
        .collection("users")
        .updateOne({ email: data }, { $set: { list: bool } });
      //changeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
      const user = await db.collection("users").find({}).toArray();
      res.render("admin/nav/usermanagment", { user });
    } catch (err) {
      console.log(err);
    }
  } else if (identifier === "catogories") {
    const db = await mongo();
    try {
      await db
        .collection("catogories")
        .updateOne({ name: data }, { $set: { list: bool } });
      const a = await db.collection("catogories").find({}).toArray();
      res.render("admin/nav/catogory", { categories: a });
    } catch (err) {
      console.log(err);
    }
  } else if (identifier === "product") {
    const db = await mongo();
    try {
      9;
      await db
        .collection("products")
        .updateOne({ name: data }, { $set: { list: bool } });
      const a = await db.collection("products").find({}).toArray();
      res.render("admin/nav/products", { products: a });
    } catch (err) {
      console.log(err);
    }
  }
};

const loadAdduser = (req, res) => {
  res.render("admin/forms/addform.ejs");
};



const loadcatogory = async (req, res) => {
  const db = await mongo();
  const categories = await db.collection("catogories").find({}).toArray();
  res.render("admin/nav/catogory", { categories });
};

const catogoryaddload = (req, res) => {
  res.render("admin/forms/catogoryaddform.ejs");
};

const catogoryadd = async (req, res) => {
  const { catogoryName, description } = req.body;

  const data = {
    name: catogoryName.trim(),
    descr: description.trim(),
    createdAt: new Date().toDateString(),
  }

  try {
    const db = await mongo();

   
    const existingCategory = await db.collection("catogories").findOne({ name: data.name })
    if (existingCategory) {
      return res.status(400).json({ error: "Category already exists." })
    }

    
    await db.collection("catogories").insertOne(data);

    
    const categories = await db.collection("catogories").find({}).toArray();
    res.render("admin/nav/catogory", { categories })
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred while processing your request." });
  }
};

const loadcatogupdate = (req, res) => {
  res.render("admin/forms/catogoryupdateform");
};

const catogoryupdate = async (req, res) => {
  const db = await mongo();
  await db
    .collection("catogories")
    .updateOne(
      { name: req.body.ogname },
      { $set: { name: req.body.name, status: req.body.status } }
    );
  const categories = await db.collection("catogories").find({}).toArray();
  res.render("admin/nav/catogory", { categories });
};

const deletecatogory = async (req, res) => {
  const db = await mongo();
  await db.collection("catogories").deleteOne({ name: req.body.name });
  const a = await db.collection("catogories").find({}).toArray();
 

  res.render("admin/nav/catogory", { categories: a });
};

const loaddashboard = (req, res) => {
  res.render("admin/dashboard",{adminName:req.session.name});
};

const loadproducts = async (req, res) => {
  const db = await mongo();
  const products = await db.collection("products").find({}).toArray();
  res.render("admin/nav/products", { products });
};

const productupdateload = async (req, res) => {
  const db = await mongo();
  const optionsobj = await db
    .collection("catogories")
    .find({}, { projection: { name: 1, _id: 0 } })
    .toArray();
  let options = [];
  optionsobj.forEach((doc) => {
    options.push(doc.name);
  });
  

  res.render("admin/forms/productupdate", { options });
};
const productaddload = async (req, res) => {
  const db = await mongo();
  const optionsobj = await db
    .collection("catogories")
    .find({}, { projection: { name: 1, _id: 0 } })
    .toArray();
  let options = [];
  optionsobj.forEach((doc) => {
    options.push(doc.name);
  });

  res.render("admin/forms/productadd", { options });
};


const productadd = async (req, res) => {
  const db = await mongo()
  const existingProduct = await db.collection("products").findOne({ name: req.body.name })
  if (existingProduct) {
    return res.status(400).json({ error: "Product name already exists" });
  }
  const imgarray = [req.body.image0, req.body.image1, req.body.image2];
  const dirPath = `./images/${req.body.name}`;
  fs.mkdir(dirPath,{ recursive: true }, (err) => {
    if (err) {
      console.log(err);
    }
  });
  for (i of imgarray) {
    const base64Data = i.replace(/^data:image\/\w+;base64,/, "");
    const binary = Buffer.from(base64Data, "base64");
    fs.writeFile(
      dirPath + `/image${imgarray.indexOf(i)}.png`,
      binary,
      (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log("images uploded");
        }
      }
    )
    req.body[`image${imgarray.indexOf(i)}`]=`/images/${req.body.name}/image${imgarray.indexOf(i)}.png`
  }
  req.body.list=true
  
  await db.collection("products").insertOne(req.body);
  const products = await db.collection("products").find({}).toArray();
  res.render("admin/nav/products", { products });
};


const productupdate = async (req, res) => {
  const imgarray = [req.body.image0, req.body.image1, req.body.image2]
  for (i of imgarray) {
    if(i){
      delete req.body[`image${imgarray.indexOf(i)}`]
    const base64Data = i.replace(/^data:image\/\w+;base64,/, "");
    const binary = Buffer.from(base64Data, "base64");
    fs.writeFile(`./images/${req.body.ogname}/image${imgarray.indexOf(i)}.png`,
      binary,
      (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log("images uploded");
        }
      }
    )
    }
    req.body[`image${imgarray.indexOf(i)}`]=`/images/${req.body.ogname}/image${imgarray.indexOf(i)}.png`
  }
  
  const db = await mongo();
  await db.collection("products").updateOne({ name: req.body.ogname }, { $set: req.body });
  const products = await db.collection("products").find({}).toArray();
  res.render("admin/nav/products", { products });
};
module.exports = {
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
};
