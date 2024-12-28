const express = require("express")
const adminRoute = express.Router()
const {login, fetchUser, editUser} = require('../Controller/adminController')
const verifyAdmin =require( "../auth/adminAuth")

const { addCategory, showCategory, editStatus, editCategory } = require("../Controller/categoryController")
const {addProduct, showProduct, editProduct}=require('../Controller/productController')
const { getOrders, editOrders } = require("../Controller/orderController")


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










module.exports=adminRoute;