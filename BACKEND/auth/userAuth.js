const jwt = require('jsonwebtoken');

const authToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('Token:', token); // Debugging log

  if (!token) {
    return res.status(401).json({ message: "No token available" });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY);
    req.userId = decoded.userId;
    next(); // Proceed to the next middleware or route
  } catch (error) {
    console.log('Token validation failed:', error.message);
    return res.status(403).json({ message: "Token validation failed" });
  }
};

module.exports = {
  authToken
};
