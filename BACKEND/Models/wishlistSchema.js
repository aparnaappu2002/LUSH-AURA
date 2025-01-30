const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
    userId: {
      type: mongoose.Types.ObjectId,
      ref: 'user',
      required: true
    },
    items: [
      {
        productId: {
          type: mongoose.Types.ObjectId,
          ref: 'products', 
          required: true
        },
        productName: {
            type: String, 
            required: true
        },
        price: {
          type: Number,
          required: true
        },
    
        variance: {
          size: {
            type: Number,
            required: false
          },
          color: {
            type: String,
            required: false
          },
          availableQuantity: {
            type: Number,
            //required: true,
            default: 0
          },
          
        },
        productImage: {
          type: String,  // Assuming the image URL is stored as a string
          required: false
        },
        addedAt: {
          type: Date,
          default: Date.now
        },
        quantity: {
          type: Number,
          required: false,
          default: 1  // Optional field to track desired quantity
        }
      }
    ],
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  });
  

const Wishlist = mongoose.model('wishlist', wishlistSchema);
module.exports = Wishlist;
