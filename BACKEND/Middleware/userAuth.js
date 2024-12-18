const jwt = require("jsonwebtoken");
const User = require("../Models/userModel"); // Import User model
require("dotenv").config();

const verifyUser = async (req, res, next) => {
    try {
        // Extract token from cookies
        const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
        
        if (!token) {
            return res.status(401).json({ message: "No token provided, authorization denied" });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("-password"); // Exclude password
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Attach user to request object
        req.user = user;
        next(); // Proceed to the next middleware or route handler
    } catch (err) {
        console.log("Error in authMiddleware:", err);
        return res.status(401).json({ message: "Invalid token, authorization denied" });
    }
};

module.exports = verifyUser;
