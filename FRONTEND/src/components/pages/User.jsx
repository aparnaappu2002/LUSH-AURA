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
// import OrderListPage from "../account/adress/orderList"
import OrderListPage from "../account/adress/OrderList"
import WishlistPage from "../user/WishlistPage"
import WalletPage from "../account/WalletPage"
import AboutUs from "../user/About"
import ContactUs from "../user/Contact"
import ProtectedRouteUser from "../../protectroute/ProtectRouteUser"

function User()
{
    return(
        <>
        <Routes>

           
            <Route path="/" element={<HomePage/>}/>
            <Route path="/signup" element={<SignupPage/>}/>
            <Route path="/login" element={<LoginPage/>}/>
            <Route path="/otpverification" element={<OTPVerification/>}/>
           
            <Route path="/shop" element={ <ProtectedRouteUser><Shop/></ProtectedRouteUser> }/>
            <Route path="/productdetails/:id" element={<ProtectedRouteUser><ProductDetails/></ProtectedRouteUser>  }/>
            <Route path="/forgotpassword" element={<ForgotPassword/>}/>
            <Route path="/resetpassword/:token" element={<ResetPassword/>  }/>
            <Route path="/cart" element={<ProtectedRouteUser><CartPage/></ProtectedRouteUser>  }/>
            <Route path="/checkout" element={<ProtectedRouteUser><Checkout/></ProtectedRouteUser>}/>
            <Route path="/about" element={<AboutUs/>}/> 
            <Route path="/contact" element={<ContactUs/>}/>
           
            

            
            <Route element={<Layout/>}>
            <Route path="/profile" element={<ProtectedRouteUser><Profile/></ProtectedRouteUser>  }/>
            <Route path="/address" element={<ProtectedRouteUser><MyAddressPage/></ProtectedRouteUser> }/>
             <Route path="/orderlist" element={<ProtectedRouteUser><OrderListPage/></ProtectedRouteUser>  }/> 
             <Route path="/wishlist" element={<ProtectedRouteUser><WishlistPage/></ProtectedRouteUser> }/> 
             <Route path="/wallet" element={<ProtectedRouteUser><WalletPage/></ProtectedRouteUser> }/> 
             
            </Route>
            
            

        </Routes>
        
        
        
        </>
    )
}
export default User