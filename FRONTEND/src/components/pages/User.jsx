import HomePage from "../user/Home"
import { Routes,Route } from "react-router-dom"
import SignupPage from "../user/SignupPage"
import LoginPage from "../user/LoginPage"
import OTPVerification from "../verification/Otp"
import Shop from "../user/Shop"
import ProductDetails from "../user/ProductDetails"


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
            

        </Routes>
        
        
        
        </>
    )
}
export default User