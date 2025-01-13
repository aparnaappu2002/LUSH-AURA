const mongoose = require("mongoose")
const Coupons = require("../Models/couponSchema")


const addCoupon = async (req, res) => {
    try {
      const {
        code,
        description,
        discountType,
        discountValue,
        minPurchaseAmount,
        maxDiscount,
        usageLimit,
        startDate,
        endDate,
        status,
        userId, // assuming userId is passed in the request
      } = req.body;

      console.log("body:",req.body)
  
      // Validate required fields
      if (!code || !discountType || !discountValue || !startDate || !endDate || !userId) {
        return res.status(400).json({ message: 'Required fields are missing.' });
      }
  
      // Create a new coupon document
      const newCoupon = new Coupons({
        code,
        description,
        discountType,
        discountValue: parseFloat(discountValue), // Convert to number
        minPurchaseAmount: parseFloat(minPurchaseAmount), // Convert to number
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : undefined, // Handle empty string
        usageLimit: usageLimit ? parseInt(usageLimit, 10) : undefined, // Handle empty string
        startDate,
        endDate,
        status: status || 'active',
        userId,
      });
      
      console.log("newcoupon:",newCoupon)
  
      // Save the coupon to the database
      const savedCoupon = await newCoupon.save();
  
      return res.status(201).json(savedCoupon);
    } catch (error) {
      console.error('Error creating coupon:', error);
      return res.status(500).json({ message: 'Internal server error.' });
    }
  }

  const getCoupons = async (req, res) => {
    try {
        const coupons = await Coupons.find();
        res.status(200).json(coupons);
    } catch (error) {
        console.error('Error fetching coupons:', error);
        res.status(500).json({ message: 'Failed to fetch coupons' });
    }
}


  const couponStatus = async (req, res) => {
    const { code } = req.params;
    const { status } = req.body;
  
    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
  
    try {
      const coupon = await Coupons.findOneAndUpdate(
        { code },
        { status, updatedAt: new Date() },
        { new: true } // Return the updated document
      );
  
      if (!coupon) {
        return res.status(404).json({ message: 'Coupon not found' });
      }
  
      res.status(200).json(coupon);
    } catch (error) {
      console.error('Error updating coupon status:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  const updateCoupon = async (req, res) => {
    const { code } = req.params; // Coupon code to identify the coupon
    const {
        description,
        discountType,
        discountValue,
        minPurchaseAmount,
        maxDiscount,
        usageLimit,
        startDate,
        endDate,
        status,
    } = req.body; // Fields to update

    try {
        const updatedCoupon = await Coupons.findOneAndUpdate(
            { code }, // Find the coupon by code
            {
                description,
                discountType,
                discountValue,
                minPurchaseAmount,
                maxDiscount,
                usageLimit,
                startDate,
                endDate,
                status,
                updatedAt: new Date(), // Update the last modified date
            },
            { new: true } // Return the updated document
        );

        if (!updatedCoupon) {
            return res.status(404).json({ message: 'Coupon not found' });
        }

        res.status(200).json(updatedCoupon);
    } catch (error) {
        console.error('Error updating coupon:', error);
        res.status(500).json({ message: 'Failed to update the coupon' });
    }
}

  
  
  module.exports = {
    addCoupon,
    getCoupons,
    couponStatus,
    updateCoupon,
  }
  

