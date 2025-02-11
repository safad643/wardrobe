const mongo = require('../mongodb/mongo');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const passport = require('passport');
const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');

const loadlogin = (req, res) => {
  try {
    res.render('user/login', { error: '' });
  } catch (error) {
    console.error('Error in loadlogin:', error);
    res.status(500).send('Internal Server Error');
  }
};

const register = async (req, res) => {
  try {
    const db = await mongo();
   

    const user = await db.collection('users').find({ email: req.body.email }).toArray();
    

    if (!user[0]) {
      const data = {
        name: req.body.name,
        email: req.body.email,
        password: await bcrypt.hash(req.body.password, 10),
        otp: generateOTP(),
        otpCreatedAt: Date.now(), // Store the current timestamp
      };
     

      console.log(data.otp);

      req.session.data = data;
      res.redirect('otp');
    } else {
      res.render('user/login', { error: 'user already exist' });
    }
  } catch (error) {
    console.error('Error in register:', error);
    res.status(500).send('Internal Server Error');
  }
};

const loadotp = (req, res) => {
  try {
    sendotp(req.session.data.otp, req.session.data.email);
    res.render('user/otp', { error: '' });
  } catch (error) {
    console.error('Error in loadotp:', error);
    res.status(500).send('Internal Server Error');
  }
};

const otpverify = async (req, res) => {
  try {
    const otparr = Object.values(req.body);
    let otp = '';
    for (i of otparr) {
      otp += i;
    }

    const data = req.session.data;
    const currentTime = Date.now();
    const otpExpiryTime = data.otpCreatedAt + 30000;
    if (currentTime > otpExpiryTime) {
      res.render('user/otp', { error: 'expired' });
      return;
    }
    if (data.otp === otp) {
      delete data.otp;
     
      
      if(req.session.forgot){
        req.session.authtochangepassword=true
        res.render('user/passwordreset')
      }
      else{
        const db = await mongo();
      data.createdAt = new Date().toDateString();
      const doc= db.collection('users').insertOne(data)
      .then(data=>{req.session.uid=data.insertedId
        req.session.save(); 
      })
      
      console.log(req.session.uid);
      
      req.session.user = true;
      res.redirect('home')
      }
    } else {
      res.render('user/otp', { error: 'wrong otp' });
    }
  } catch (error) {
    console.error('Error in otpverify:', error);
    res.status(500).send('Internal Server Error');
  }
};

const reotp = (req, res) => {
  try {
    const otp = generateOTP();
    console.log(otp);
    req.session.data.otp = otp;
    req.session.data.otpCreatedAt = Date.now();
    sendotp(otp, req.session.data.email);
    res.send(JSON.stringify({ changed: true }));
  } catch (error) {
    console.error('Error in reotp:', error);
    res.status(500).send('Internal Server Error');
  }
};

const login = async (req, res) => {
  try {
    const { password, email } = req.body;
    const db = await mongo();
    const users = await db.collection('users').find({ email }).toArray();

    
    const match = await bcrypt.compare(password, users[0]?.password || "");
    if (users[0]?.email === email && match) {
      req.session.data = {email}
      
      
      req.session.uid=users[0]._id 
  

  
  
      
      req.session.user = true;
      res.redirect('home');
    } else {
      res.render('user/login', { error: 'wrong credentials' });
    }
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).send('Internal Server Error');
  }
};

const googleauth = (req, res) => {
  try {
    passport.authenticate('google', { scope: ['profile', 'email'] });
  } catch (error) {
    console.error('Error in googleauth:', error);
    res.status(500).send('Internal Server Error');
  }
};

const loadhome = async (req, res) => {
  try {
    if (req.session.user) {
      const db = await mongo();
      const categories = await db.collection('catogories').find({}).toArray();
      const products = await db.collection('products').find({ list: true }).toArray();
      const user=await db.collection('users').find({email:req.session.data.email})
      res.render('user/index', { categories, products ,user,profilepic:req?.user?.profilepic});
    } else {
      // Change after user-related stuff is added in home page
      const db = await mongo();
      const categories = await db.collection('catogories').find({}).toArray();
      const products = await db.collection('products').find({ list: true }).toArray();
      res.render('user/index', { categories, products });
    }
  } catch (error) {
    console.error('Error in loadhome:', error);
    res.status(500).send('Internal Server Error');
  }
};

const logout = (req, res) => {
  try {
    req.session.destroy();
    res.redirect('/user/login');
  } catch (error) {
    console.error('Error in logout:', error);
    res.status(500).send('Internal Server Error');
  }
};

const loadshop = async (req, res) => {
  try {
    const db = await mongo();
    const categories = await db.collection('catogories').find({}).toArray();
    const products = await db.collection('products').find({ list: true }).toArray();
    res.render('user/catogory', { categories, products ,user:true});
  } catch (error) {
    console.error('Error in loadshop:', error);
    res.status(500).send('Internal Server Error');
  }
};

const loadproductview = async (req, res) => {
  try {
    const { name } = req.params;
    const db = await mongo();
    const categories = await db.collection('catogories').find({}).toArray();
    
    // Get the current product
    const product = await db.collection('products').findOne({ name });
    
    if (!product) {
      return res.status(404).send('Product not found');
    }

    // Get related products from the same category (excluding current product)
    const relatedProducts = await db.collection('products')
      .find({ 
        category: product.category, 
        name: { $ne: product.name },  // Exclude current product
        list: true  // Only listed products
      })
      .limit(10)  // Limit to 10 products
      .toArray();

    res.render('user/productview', { 
      categories, 
      product, 
      relatedProducts,
      userid: req.session.uid,
      user: true 
    });
  } catch (error) {
    console.error('Error in loadproductview:', error);
    res.status(500).send('Internal Server Error');
  }
};

const loadcategory = async (req, res) => {
  try {
    const { name } = req.params;
    const db = await mongo();
    const categories = await db.collection('catogories').find({}).toArray();
    const products = await db.collection('products').find({ category: name, list: true }).toArray();

    res.render('user/catogory', { categories, products,user:true });
  } catch (error) {
    console.error('Error in loadcategory:', error);
    res.status(500).send('Internal Server Error');
  }
}

const forgot= async(req,res)=>{
  const {email}=req.params
  const db= await mongo()
  if(!await db.collection('users').findOne({email})){
     return res.render('user/login',{error:"email doesnt exist"}) 
  }
  req.session.data={otp:generateOTP(),otpCreatedAt:new Date()}
  
  sendotp(req.session.data.otp  ,email)
  req.session.data.otpCreatedAt=Date.now()  
  req.session.forgot=true
  req.session.data.email=email
  console.log(req.session.data.otp)
  res.render('user/otp',{error:""})
}

const resetpassword= async(req,res)=>{
  try{
    if(req.session.authtochangepassword){
      const hashedpass= await bcrypt.hash(req.body.password,10)
      const db=await mongo()
      
    
      
      
      await db.collection('users').updateOne({email:req.session.data.email},{$set:{password:hashedpass}})
      res.redirect('/user/login')
    }
    else{
      res.redirect('/user/login')
    }
  }
  catch(er){
    console.log(er);
    
  }
}

const profileload = async (req, res) => {
  try {
    const db = await mongo();
    const user = await db.collection('users').findOne({ _id: new ObjectId(req.session.uid)});
    
    const addresses = await db.collection('adress')
      .find({ userId: req.session.uid })
      .toArray();

    // Fetch orders for the current user
    const orders = await db.collection('orders')
      .find({ userId: req.session.uid })
      .sort({ createdAt: -1 }) // Sort by newest first
      .toArray();

    res.render('user/profile', { 
      user: user,
      addresses: addresses,
      orders: orders // Pass orders to the view
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
}
const changename=async(req,res)=>{
  try{
    const {name,email}= req.body
    const db=await mongo()
    await db.collection('users').updateOne({email},{$set:{name}})
    res.redirect('/user/profile')
  }catch(err){
    console.log(err);
    
  }
  
}



const addtocart = async (req, res) => {
  try {
    const { productid, qty, varient } = req.body;
    const userid = req.session.uid;
    const db = await mongo();

    // Get product details and variant count
    const product = await db.collection('products').findOne({
      _id: new ObjectId(productid),
      variants: {
        $elemMatch: {
          color: varient.color,
          size: varient.size
        }
      }
    });

    if (!product) {
      return res.status(404).json({ message: "Product or variant not found" });
    }

    // Get count from matching variant
    const matchingVariant = product.variants.find(v => 
      v.color === varient.color && v.size === varient.size
    );
    
    // Add count to varient object
    varient.count = matchingVariant.count;

    // Check if product already exists in cart
    const existingProduct = await db.collection('cart').findOne({
      userid: userid,
      products: {
        $elemMatch: {
          productid: productid,
          "varient.color": varient.color,
          "varient.size": varient.size
        }
      }
    });

    if (existingProduct) {
      return res.status(400).json({ message: "product already exist" });
    }

    // Remove from wishlist if exists
    await db.collection('wishlist').updateOne(
      { userId: userid },
      { $pull: { products: productid } }
    );

    // Add product to cart
    const result = await db.collection('cart').updateOne(
      { userid: userid },
      {
        $push: { products: { productid: productid, quantity: 1, varient } },
        $setOnInsert: { userid: userid }
      },
      { upsert: true }
    );

    res.status(200).json({ message: "product added to cart" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error updating cart" });
  }
};

const laodcart = async(req,res) => {
  const db = await mongo()
  const products = await db.collection('products').aggregate([
    {
      $lookup: {
        from: "cart",
        let: { productId: "$_id" },
        pipeline: [
          {
            $match: {
              userid: req.session.uid
            }
          },
          { $unwind: "$products" },
          {
            $match: {
              $expr: {
                $eq: [
                  "$$productId",
                  { $toObjectId: "$products.productid" }
                ]
              }
            }
          },
          {
            $project: {
              quantity: "$products.quantity", 
              varient: "$products.varient",
              _id: 0
            }
          }
        ],
        as: "cartDetails"
      }
    },
    { $unwind: "$cartDetails" },
    {
      $addFields: {
        quantity: "$cartDetails.quantity",
        varient: {
          $let: {
            vars: {
              matchingVariant: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: "$variants",
                      cond: {
                        $and: [
                          { $eq: ["$$this.color", "$cartDetails.varient.color"] },
                          { $eq: ["$$this.size", "$cartDetails.varient.size"] }
                        ]
                      }
                    }
                  },
                  0
                ]
              }
            },
            in: {
              color: "$cartDetails.varient.color",
              size: "$cartDetails.varient.size",
              count: "$$matchingVariant.count"
            }
          }
        }
      }
    },
    {
      $project: {
        cartDetails: 0
      }
    }
  ]).toArray()

  res.render('user/cart',{products,userid:req.session.uid,user:true})
}

const removeFromCart = async (req, res) => {
  try {
      const productId = req.params.productid;
      const userId = req.session.uid;
      const { size, color } = req.query;

      const db = await mongo();
      
      // Remove only the specific product variant from the cart
      const result = await db.collection('cart').updateOne(
          { userid: userId },
          { 
            $pull: { 
              products: { 
                productid: productId,
                'varient.size': size,
                'varient.color': color
              } 
            } 
          }
      );

      if (result.modifiedCount === 0) {
        req.flash('error', 'Product not found in cart');
      }

      res.redirect('/user/cart');
  } catch (err) {
      console.error(err);
      req.flash('error', 'Failed to remove product from cart');
      res.redirect('/user/cart');
  }
};

const updatecart = async (req, res) => {
  try {
      const { productid, userid, quantity, varient } = req.body;
      
      const db = await mongo();

      const result = await db.collection('cart').updateOne(
          { 
              userid, 
              "products": {
                  $elemMatch: {
                      productid: productid,
                      "varient.size": varient.size,
                      "varient.color": varient.color
                  }
              }
          },
          { $set: { "products.$.quantity": quantity } }
      );

      if (result.modifiedCount === 0) return res.status(404).json({ message: "Product not found" });
      res.status(200).json({ message: "Quantity updated" });
  } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error updating quantity" });
  }
}

const addadress = async (req, res) => {
  try {
    const db = await mongo();
    const { street, city, state, country, postalCode, phone } = req.body;

    const newAddress = {
        userId: req.session.uid,
        street,
        city,
        state,
        country,
        postalCode,
        phone: parseInt(phone, 10)
    };

    await db.collection('adress').insertOne(newAddress);
    
    res.json({ 
      status: 'success',
      address: newAddress
  })

  } catch (error) {
    console.error(error);
    res.status(500).json({ 
        success: false,
        error: "Internal Server Error" 
    });
  } 
}

  const placeOrder = async (req, res) => {
    try {
      console.log(req.body.products);
      
        const db = await mongo();
        const { addressId, paymentMethod, products, totals } = req.body;
    
        // Check stock availability for all products
        for (const pair of products) {
            const product = await db.collection('products').findOne({_id: new ObjectId(pair['productId'])});
            if (product.count === 0) {
                return res.status(400).json({stockIssue:true,productId:product._id});
            }
        }
        
        // Update product counts
        products.forEach(async (pair) => {
            await db.collection('products').updateOne(
                {_id: new ObjectId(pair['productId'])},
                {$inc: {count: -pair['quantity']}}
            );
        });

        // Create items array from products with offer and calculated values
        const items = products.map(product => ({
            status: 'pending',
            productId: product.productId,
            quantity: product.quantity,
            price: product.price,
            offer: product.offer,
            varient: {
                size: product.size,
                color: product.color
            },
            subtotal: product.price * product.quantity,
            total: product.offer ? 
                (product.price * product.quantity) * (1 - product.offer/100) : 
                (product.price * product.quantity)
        }));

        // Create the order document
        const order = {
            userId: req.session.uid,
            addressId: addressId,
            paymentMethod: paymentMethod,
            items: items,
            subtotal: totals.subtotal,
            delivery: totals.delivery,
            discount: totals.discount,
            total: totals.total,
            createdAt: new Date()
        };

        // Insert the order
        const result = await db.collection('orders').insertOne(order);
        
        // If more than one product, clear cart (checkout from cart)
        if (products.length > 1) {
            await db.collection('cart').deleteOne({ userid: req.session.uid });
        }
        
        res.render('user/checkoutsuccess', {id: result.insertedId});
    } catch (error) {
        console.error("Order placement error:", error);
        res.status(500).json({
            success: false,
            error: "Failed to place order. Please try again."
        });
    }
};
const loadcheckout = async (req, res) => {
  console.log(req.body);
  
  try {
    const db = await mongo();
    const productQuantities = req.body || {};
    
    // Extract product IDs and details from numbered entries
    const products = [];
    const productIds = [];
    Object.values(productQuantities).forEach(item => {
      productIds.push(item.productId);
      products.push(item);
    });

    const [dbProducts, addresses] = await Promise.all([
      db.collection('products').find({
        _id: { $in: productIds.map(id => new ObjectId(id)) }
      }).toArray(),
      db.collection('adress').find({ userId: req.session.uid }).toArray()
    ]);

    // Replicate cart calculation logic
    let totalWithoutOffers = 0;
    let discount = 0;
    let deliveryCharges = 0;
    let totalItems = 0;

    dbProducts.forEach(dbProduct => {
      const matchingProducts = products.filter(p => p.productId === dbProduct._id.toString());
      
      matchingProducts.forEach(product => {
        const price = dbProduct.price;
        const quantity = product.quantity;
        const offer = dbProduct.offer || 0;

        totalWithoutOffers += price * quantity;
        totalItems += quantity;

        if (offer > 0) {
          discount += (price * (offer / 100)) * quantity;
        }

        const discountedPricePerItem = price * (1 - (offer / 100));
        if (discountedPricePerItem * quantity < 500) {
          deliveryCharges += 40 * quantity;
        }
      });
    });

    const subtotal = totalWithoutOffers - discount;
    const totalAmount = subtotal + deliveryCharges;

    res.render('user/checkout', {
      addresses,
      products: dbProducts.map(dbProduct => {
        const matchingProducts = products.filter(p => p.productId === dbProduct._id.toString());
        return matchingProducts.map(product => ({
          ...dbProduct,
          quantity: product.quantity,
          size: product.size,
          color: product.color
        }));
      }).flat(),
      subtotal: Math.round(subtotal),
      deliveryFee: Math.round(deliveryCharges),
      discount: Math.round(discount), 
      total: Math.round(totalAmount)
    });

  } catch (error) {
    console.log(error);
    res.status(500).send('Checkout error');
  }
};

const loadorderview = async(req,res) => {
  try {
    const orderid = req.params.orderid;
    const productid = req.params.productid;
    const db = await mongo();
    
    // Get order details
    const order = await db.collection("orders").findOne({
      _id: new ObjectId(orderid)
    });
    
    // Get address details
    const address = await db.collection("adress").findOne({
      _id: new ObjectId(order.addressId)
    });
    
    // Find the specific product from order items
    let orderProduct = order.items.find(item => item.productId === productid);
    
    // Get product details
    const productDetails = await db.collection("products").findOne({
      _id: new ObjectId(productid)
    });
    
    // Combine order item details with product details
    const product = {
      ...productDetails,
      ...orderProduct,
      quantity: orderProduct.quantity,
      offer: productDetails.offer || 0
    };

    // Add address to order object
    order.address = {
      street: address.street,
      city: address.city,
      state: address.state,
      country: address.country,
      pincode: address.postalCode,
      mobile: address.phone
    };

    // Set the order status based on the specific item's status
    order.status = orderProduct.status;
    
    res.render("user/orderviewpage", { order, product });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error loading order view");
  }
}

const deleteAddress = async (req, res) => {
  try {
      const db = await mongo();
      const addressId = req.params.id;

      const result = await db.collection('adress').deleteOne({ _id: new ObjectId(addressId) });

      if (result.deletedCount === 1) {
          res.json({ status: 'success', message: 'Address deleted successfully' });
      } else {
          res.status(404).json({ success: false, error: 'Address not found' });
      }
  } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};


const updateAddress = async (req, res) => {
  try {
    const db = await mongo();
    const { addressId, street, city, state, country, postalCode, phone } = req.body;

    const result = await db.collection("adress").updateOne(
      { _id: new ObjectId(addressId) },
      {
        $set: {
          street,
          city,
          state,
          country,
          postalCode,
          phone: parseInt(phone, 10),
        },
      }
    );

  
    if (result.modifiedCount === 0) {
      return res.status(404).json({ success: false, error: "Address not found or no changes made." });
    }

    res.json({ success: true, message: "Address updated successfully." });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

const changepassword=async (req,res)=>{
  const {currentPassword,newPassword}=req.body
  const db= await mongo()
  const data = await db.collection('users').findOne({ _id: new ObjectId(req.session.uid) }); 
  
  
  const ismatch =await bcrypt.compare(currentPassword,data.password)
  
  
  if(ismatch){
    const hashed = await bcrypt.hash(newPassword,10)
    await db.collection('users').updateOne({_id:new ObjectId(req.session.uid)},{$set:{password:hashed}}) 
    res.json({status:'success'})
  }
  else{
    res.json({message:'current password is wrong'})
  }
}


const cancelOrder = async (req, res) => {
  try {
      const orderId = req.params.orderId;
      const db = await mongo();
      
      // First get the order details to know the product and quantity
      const order = await db.collection('orders').findOne({ _id: new ObjectId(orderId) });
      
      if (!order) {
          return res.status(404).json({ success: false, message: 'Order not found' });
      }

      // Update order status to cancelled
      await db.collection('orders').updateOne(
          { _id: new ObjectId(orderId) },
          { $set: { "items.$[].status": 'cancelled' } }
      );

      // For each item in the order, increase the product count
      for (const item of order.items) {
          await db.collection('products').updateOne(
              { _id: new ObjectId(item.productId) },
              { $inc: { count: Number(item.quantity) || 1 } }
          );
      }
         
      res.redirect(`/user/orderdetails/${orderId}/${order.items[0].productId}`);

  } catch (error) {
      console.error('Error cancelling order:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
const loadWishlist = async (req, res) => {
  try {
      const db = await mongo();
      const userId = req.session.uid;
   
      // Get user's wishlist
      const userWishlist = await db.collection('wishlist').findOne({
          userId: userId
      });
     
      let products = [];
      if (userWishlist && userWishlist.products.length > 0) {
          // Get the product details for wishlist items
          const productIds = userWishlist.products.map(id => new ObjectId(id));
          products = await db.collection('products')
              .find({ _id: { $in: productIds } })
              .toArray();
      }

      res.render('user/wishlist', {
          products: products,
          user: true
      });
  } catch (error) {
      console.error('Error loading wishlist:', error);
      res.status(500).send('Internal Server Error');
  }
};

const addToWishlist = async (req, res) => {
  try {
      const db = await mongo();
      const productId = req.params.productId;
      const userId = req.session.uid;

      // Check if product exists in cart
      const cart = await db.collection('cart').findOne({
          userid: userId,
          'products.productid': productId
      });

      if (cart) {
          return res.status(400).json({ message: "Product is in cart" });
      }

      // Find user's wishlist document
      const userWishlist = await db.collection('wishlist').findOne({
          userId: userId
      });

      // Check if product already exists in wishlist array
      if (userWishlist && userWishlist.products.includes(productId)) {
          return res.status(400).json({ message: "Product already in wishlist" });
      }

      if (userWishlist) {
          // Add product to existing wishlist
          await db.collection('wishlist').updateOne(
              { userId: userId },
              { 
                  $push: { 
                      products: productId
                  }
              }
          );
      } else {
          // Create new wishlist document for user
          await db.collection('wishlist').insertOne({
              userId: userId,
              products: [productId]
          });
      }

      res.status(200).json({ message: "Added to wishlist" });
  } catch (error) {
      console.error('Error adding to wishlist:', error);
      res.status(500).json({ message: "Error adding to wishlist" });
  }
};

const removeFromWishlist = async (req, res) => {
  try {
      const db = await mongo();
      const productId = req.params.productId;
      const userId = req.session.uid;

      // Find user's wishlist document
      const userWishlist = await db.collection('wishlist').findOne({
          userId: userId
      });

      if (!userWishlist) {
          return res.status(404).json({ message: "Wishlist not found" });
      }

      // Remove product from wishlist array
      await db.collection('wishlist').updateOne(
          { userId: userId },
          { $pull: { products: productId } }
      );

      res.status(200).json({ message: "Removed from wishlist" });
  } catch (error) {
      console.error('Error removing from wishlist:', error);
      res.status(500).json({ message: "Error removing from wishlist" });
  }
};

const checkWishlist = async (req, res) => {
    try {
        const db = await mongo();
        const userId = req.session.uid;

        if (!userId) {
            return res.status(400).json({ 
                message: "User not logged in" 
            });
        }

        // Find user's wishlist
        const userWishlist = await db.collection('wishlist').findOne({
            userId: userId
        });

        // Return the products array or empty array if no wishlist found
        const products = userWishlist ? userWishlist.products : [];
        res.json(products);

    } catch (error) {
        console.error('Error checking wishlist:', error);
        res.status(500).json({ 
            message: "Internal server error" 
        });
    }
};

module.exports = {
  loadWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlist,
  cancelOrder,
  updateAddress,
  deleteAddress,
  loadorderview,
  placeOrder,
  loadcheckout,
  addadress,
  removeFromCart,
  updatecart,
  laodcart,
  addtocart,
  changename,
  profileload,
  resetpassword,
  forgot,
  loadcategory,
  loadproductview,
  loadshop,
  logout,
  loadlogin,
  register,
  loadotp,
  otpverify,
  reotp,
  login,
  googleauth,
  loadhome,
  changepassword
};

function generateOTP(length = 6) {
  return crypto.randomInt(0, 10 ** length).toString().padStart(length, '0');
}

async function sendotp(otp, email) {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'safadcp14@gmail.com',
        pass: 'svhn wupg zccn dzkw',
      },
    });
    const mail = {
      from: 'your-email@gmail.com',
      to: email,
      subject: 'Your OTP Code',
      html: `
        <html>
          <head>
            <style>
              body {
                font-family: 'Arial', sans-serif;
                background-color: #f4f7fc;
                color: #333;
                margin: 0;
                padding: 0;
              }
              .container {
                max-width: 600px;
                margin: 30px auto;
                padding: 20px;
                background-color: #ffffff;
                border-radius: 8px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
              }
              .header {
                text-align: center;
                margin-bottom: 20px;
              }
              .header h1 {
                color: #4CAF50;
                font-size: 24px;
              }
              .otp-code {
                font-size: 36px;
                font-weight: bold;
                color: #4CAF50;
                text-align: center;
                margin-top: 20px;
              }
              .message {
                font-size: 16px;
                text-align: center;
                margin-top: 10px;
                color: #555;
              }
              .footer {
                font-size: 14px;
                text-align: center;
                margin-top: 30px;
                color: #777;
              }
              .button {
                display: inline-block;
                padding: 10px 20px;
                font-size: 16px;
                color: #fff;
                background-color: #4CAF50;
                text-decoration: none;
                border-radius: 4px;
                margin-top: 20px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Welcome to Our Service!</h1>
              </div>
              <div class="message">
                <p>Your OTP verification code is:</p>
                <div class="otp-code">${otp}</div>
              </div>
              <div class="footer">
                <p>This OTP is valid for 5 minutes. If you did not request this, please ignore this message.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    };
    const info = await transporter.sendMail(mail);
    console.log('Email sent: ' + info.response);
  } catch (error) {
    console.error('Error sending email: ', error);
  }
}