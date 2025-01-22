const Wallet = require('../Models/walletSchema'); // Adjust the path to your 
const User = require('../Models/userSchema')
const mongoose = require("mongoose");


const getWalletData = async (req, res) => {
    try {
      // Extracting userId from the request parameters
      const { userId } = req.params;
  
      console.log("user:", userId);
  
      // Find the wallet by userId
      const wallet = await Wallet.findOne({ userId: new mongoose.Types.ObjectId(userId) });
  
      if (!wallet) {
        // User does not have a wallet
        return res.status(200).json({ 
            message: "User does not have a wallet", 
            walletExists: false 
        });
    }
  
      // Respond with the wallet data
      res.status(200).json(wallet);
    } catch (error) {
      console.error("Error fetching wallet data:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
  

module.exports = { getWalletData };
