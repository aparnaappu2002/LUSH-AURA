const mongoose = require("mongoose");
const Address = require('../Models/addressSchema')
const User = require('../Models/userSchema')

const addAddress = async (req, res) => {
    try {
      const {userId, address: addressLine, street, city, state, country, pincode,phone } = req.body;
      console.log("Body",req.body)
  
      if (!addressLine || !street || !city || !state || !country || !pincode) {
        return res.status(400).json({ message: 'All fields are required' });
      }
  
      // Create the address entry
      const newAddress = await Address.create({
        userId,
        addressLine,
        street,
        city,
        state,
        country,
        pincode,
        phone,
      });
  
      res.status(201).json(newAddress);
    } catch (error) {
      console.error("Server Error:", error);  // Add detailed logging
      res.status(500).json({ message: 'Server Error', error });
    }
  };

  const showAddress = async (req, res) => {
    const { userId } = req.params;
    console.log('User ID received:', userId);
  
    try {
      // Find addresses by userId
      const addresses = await Address.find({ userId });
  
      // Check if addresses exist
      if (!addresses || addresses.length === 0) {
        return res.status(404).json({ message: 'No addresses found' });
      }
  
      console.log('Fetched addresses:', addresses);
      return res.status(200).json({ 
        message: addresses.length ? "Addresses fetched successfully" : "No addresses found", 
        addresses 
    });
      
    } catch (error) {
      console.error('Error while fetching addresses:', error);
      return res.status(500).json({ message: "Server error while fetching addresses", error });
    }
  };

  const editAddress = async (req, res) => {
    const { _id, addressLine, street, city, state, country, phone, pincode } = req.body;
  
    console.log('Received address for editing:', req.body);
  
    try {
      // Validate address data
      if (!_id) {
        return res.status(400).json({ message: 'Address ID is required' });
      }
  
      // Update the address
      const updatedAddress = await Address.findByIdAndUpdate(
        _id,        // Find by address ID
        { $set: { addressLine, street, city, state, country, phone, pincode } },  // Update address fields
        { new: true, runValidators: true } // Return updated document
      );
  
      // Check if the address was updated
      if (!updatedAddress) {
        return res.status(404).json({ message: 'Address not found' });
      }
  
      console.log('Updated address:', updatedAddress);
      return res.status(200).json({ message: 'Address Edited', updatedAddress });
  
    } catch (error) {
      console.error('Error while updating the address:', error);
      return res.status(500).json({ message: 'Error while updating address', error });
    }
  };

  const removeAddress = async (req, res) => {
    const { addressId } = req.params;
  
    console.log('Address ID received for deletion:', addressId);
  
    try {
      // Validate address ID
      if (!mongoose.Types.ObjectId.isValid(addressId)) {
        return res.status(400).json({ message: 'Invalid address ID' });
      }
  
      // Delete the address
      const deletedAddress = await Address.findByIdAndDelete(addressId);
  
      // Check if the address was deleted
      if (!deletedAddress) {
        return res.status(404).json({ message: 'Address not found' });
      }
  
      console.log('Deleted address:', deletedAddress);
      return res.status(200).json({ message: 'Address removed successfully', deletedAddress });
    } catch (error) {
      console.error('Error while deleting the address:', error);
      return res.status(500).json({ message: 'Server error while deleting address', error });
    }
  };
  
  
  
  
  
  

module.exports = { addAddress,showAddress,editAddress,removeAddress };
