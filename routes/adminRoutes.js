const express =require('express')
const router =express.Router()
const admincontroller=require('../controllers/adminController')
const midddlewares=require('../midddlewares/session')
//login routes
router.get('/',admincontroller.loadlogin)
router.post('/',admincontroller.loginverify)

//dashboard route
router.get('/dashboard',midddlewares.adminsession,admincontroller.loaddashboard)
//user-managment routes 
router.get('/user-managment',midddlewares.adminsession,admincontroller.loadusermanagment)

// catogory-managment routes
router.get('/catogory',midddlewares.adminsession,admincontroller.loadcatogory)
router.get('/catogoryadd',midddlewares.adminsession,admincontroller.catogoryaddload)
router.post('/catogoryadd',midddlewares.adminsession,admincontroller.catogoryadd)
router.get('/catogoryUpdate',midddlewares.adminsession,admincontroller.loadcatogupdate)
router.post('/catogoryupdate',midddlewares.adminsession,admincontroller.catogoryupdate)

// product managment routes
router.get('/product-managment',midddlewares.adminsession,admincontroller.loadproducts)
router.get('/productUpdate',admincontroller.productupdateload)
router.post('/productUpdate',admincontroller.productupdate)


router.get('/productadd',midddlewares.adminsession,admincontroller.productaddload)
router.post('/productadd',midddlewares.adminsession,admincontroller.productadd)


//general for deleting
router.post('/delete',midddlewares.adminsession,admincontroller.Delete)


router.get('/ordermanagment',admincontroller.loadordermanagment)
router.put('/orders/:orderId',admincontroller.updateProductStatus)
router.put('/orders/update-status', admincontroller.updateProductStatus)

module.exports=router