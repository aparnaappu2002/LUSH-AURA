import HomePage from "../user/Home"
import { Routes,Route } from "react-router-dom"
import SignupPage from "../user/SignupPage"
import LoginPage from "../user/LoginPage"
import OTPVerification from "../verification/Otp"
import Shop from "../user/Shop"
import ProductDetails from "../user/ProductDetails"
import Profile from "../account/Profile"
import Layout from "../account/Layout"
import MyAddressPage from "../account/adress/MyAdress"
import ForgotPassword from "../verification/ForgotPassword"
import ResetPassword from "../verification/ResetPassword"
import CartPage from "../user/CartPage"
import Checkout from "../user/CheckoutPage"
import Navbar from "../shared/Navbar"
import OrderListPage from "../account/adress/orderList"


function User()
{
    return(
        <>
        <Routes>

           
            <Route path="/" element={<HomePage/>}/>
            <Route path="/signup" element={<SignupPage/>}/>
            <Route path="/login" element={<LoginPage/>}/>
            <Route path="/otpverification" element={<OTPVerification/>}/>
           
            <Route path="/shop" element={<Shop/>}/>
            <Route path="/productdetails/:id" element={<ProductDetails/>}/>
            <Route path="/forgotpassword" element={<ForgotPassword/>}/>
            <Route path="/resetpassword/:token" element={<ResetPassword/>}/>
            <Route path="/cart" element={<CartPage/>}/>
            <Route path="/checkout" element={<Checkout/>}/>
            

            
            <Route element={<Layout/>}>
            <Route path="/profile" element={<Profile/>}/>
            <Route path="/address" element={<MyAddressPage/>}/>
             <Route path="/orderlist" element={<OrderListPage/>}/> 
            </Route>
            
            

        </Routes>
        
        
        
        </>
    )
}
export default User