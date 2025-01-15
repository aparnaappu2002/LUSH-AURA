const express = require("express")
const adminRoute = express.Router()
const {login, fetchUser, editUser} = require('../Controller/adminController')
const verifyAdmin =require( "../auth/adminAuth")

const { addCategory, showCategory, editStatus, editCategory } = require("../Controller/categoryController")
const {addProduct, showProduct, editProduct}=require('../Controller/productController')
const { getOrders, editOrders, acceptReturnRequest, rejectReturnRequest, salesReport, downloadReport } = require("../Controller/orderController")
const { addCoupon, getCoupons, couponStatus, updateCoupon } = require("../Controller/couponController")
const { addOffer, getOffers, productOffer, categoryOffer, offers, editOffer, getProductOffers } = require("../Controller/offerController")
const { bestProducts, bestCategories } = require("../Controller/bestController")


adminRoute.post('/adminlogin',login)
adminRoute.get('/userlist',fetchUser)
adminRoute.get('/userlist',fetchUser)
adminRoute.patch('/useredit/:id',verifyAdmin,editUser)

adminRoute.get('/category',showCategory)
adminRoute.post('/addcategory',verifyAdmin,addCategory)
adminRoute.patch('/editstatus/:id',verifyAdmin,editStatus)
adminRoute.patch('/editcategory/:id',verifyAdmin,editCategory)

adminRoute.post('/addproduct',verifyAdmin,addProduct)
adminRoute.get('/productlist',verifyAdmin,showProduct)
adminRoute.put('/editproduct/:id',verifyAdmin,editProduct)


adminRoute.get('/orders',verifyAdmin,getOrders)
adminRoute.put('/editorder/:orderId',verifyAdmin,editOrders)
adminRoute.put('/acceptreturn/:orderId',verifyAdmin,acceptReturnRequest)
adminRoute.put('/rejectreturn/:orderId',verifyAdmin,rejectReturnRequest)



adminRoute.post('/addcoupon',verifyAdmin,addCoupon)
adminRoute.get('/coupons',verifyAdmin,getCoupons)
adminRoute.put('/couponstatus/:code',verifyAdmin,couponStatus)
adminRoute.put('/updatecoupon/:code',verifyAdmin,updateCoupon)


adminRoute.post('/addoffer/:productId',verifyAdmin,productOffer)
adminRoute.get('/offers',verifyAdmin,getOffers)
adminRoute.post('/addoffercategory',verifyAdmin,categoryOffer)
adminRoute.get('/viewoffers',verifyAdmin,offers)
adminRoute.put('/editoffers/:id',verifyAdmin,editOffer)




adminRoute.get('/salesreport',verifyAdmin,salesReport)
adminRoute.get('/downloadreport',verifyAdmin,downloadReport)

adminRoute.get('/bestsellers/products',verifyAdmin,bestProducts)
adminRoute.get('/bestsellers/categories',verifyAdmin,bestCategories)












module.exports=adminRoute;