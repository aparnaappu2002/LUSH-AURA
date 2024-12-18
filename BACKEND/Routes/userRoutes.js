const express = require("express")
const userRoute= express.Router()
const {signUp,login, otpVerification, resendOtp, refreshToken, googleLogin}=require('../Controller/userController')
const {showProductListed, showProductone, relatedProducts} = require("../Controller/productController")

userRoute.post('/signup',signUp)
userRoute.post('/otpverification',otpVerification)
userRoute.post('/resendotp',resendOtp)
userRoute.post('/google-login',googleLogin)
userRoute.post('/login',login)
userRoute.post('/refreshtoken',refreshToken)


userRoute.get('/productlist',showProductListed)
userRoute.get('/productdetails/:id',showProductone)
userRoute.get('/relatedproducts/:id',relatedProducts)


module.exports=userRoute;
