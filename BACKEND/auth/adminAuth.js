const jwt=require('jsonwebtoken')
require('dotenv').config()
const verifyAdmin=async(req,res,next)=>{
    const authHeader=req.headers['authorization']
    const token=authHeader && authHeader.split(' ')[1]
 
   
    if(!token) return res.status(401).json({message:"no token available"})
        try {
            const decoded=jwt.verify(token,process.env.ADMIN_ACCESS_TOKEN_KEY)
            req.userId=decoded.userId;
            next();
        } catch (error) {
            console.log('token validation failed',error.message)
            return res.status(403).json({ message: "Token is not valid" });
        }
}

module.exports=verifyAdmin