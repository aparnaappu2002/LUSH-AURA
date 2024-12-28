const express = require("express")
const userRoute= express.Router()
const {signUp,login, otpVerification, resendOtp, refreshToken, googleLogin, changeInformation,getUser, changePassword, forgotPassword, resetPassword}=require('../Controller/userController')
const {showProductListed, showProductone, relatedProducts,filterProduct} = require("../Controller/productController")
const {addAddress, showAddress, editAddress, removeAddress} = require("../Controller/addressController")
const {authToken} = require('../auth/userAuth')
const {cartAdd, getCartItems, removeCartItem, updateCartQuantity, removeCart} = require("../Controller/cartController")
const { addOrder, getUserOrder, cancelOrder } = require("../Controller/orderController")
const {showCategory} = require("../Controller/categoryController")

userRoute.post('/signup',signUp)
userRoute.post('/otpverification',otpVerification)
userRoute.post('/resendotp',resendOtp)
userRoute.post('/google-login',googleLogin)
userRoute.post('/login',login)
userRoute.post('/refreshtoken',refreshToken)
userRoute.put('/changeUserInfo/:userId',authToken,changeInformation)
userRoute.patch('/changePassword/:userId',authToken,changePassword)
userRoute.get('/profile/:id',authToken,getUser)
userRoute.post('/forgot-password',forgotPassword)
userRoute.post('/reset-password/:token',resetPassword)


userRoute.get('/productlist',showProductListed)
userRoute.get('/productdetails/:id',showProductone)
userRoute.get('/relatedproducts/:id',relatedProducts)


userRoute.post('/address',authToken,addAddress)
userRoute.get('/showAddress/:userId',authToken,showAddress)
userRoute.put('/editAddress',authToken,editAddress)
userRoute.delete('/deleteAddress/:addressId',authToken,removeAddress)

userRoute.post('/cartadd',authToken,cartAdd)
userRoute.get('/cart/:userId',authToken,getCartItems)
userRoute.post('/removecart',authToken,removeCartItem)
userRoute.put('/updatecart',authToken,updateCartQuantity)

userRoute.post('/addOrder',authToken,addOrder)
userRoute.post('/cartempty',authToken,removeCart)
userRoute.get('/orders/:userId',authToken,getUserOrder)
userRoute.post('/cancelorder/:orderId',authToken,cancelOrder)

userRoute.get('/category',showCategory)



module.exports=userRoute;
