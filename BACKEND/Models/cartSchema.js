const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Types.ObjectId,
        ref: "products", // Reference to the Product schema
        required: true
    },
    productName: {
        type: String,
        required: true, // Make it required to ensure every cart item has a productName
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
        varianceImage:{
            type:[String],
            required:true
    
        },
    },
    quantity: {
        type: Number,
        required: true,
        min: 1 // Ensures at least 1 item is added
    },
    price: {
        type: Number,
        required: true
    },
    subtotal: {
        type: Number,
        required: true
    },
    availableQuantity: { // Added availableQuantity field
        type: Number,
        //required: true, // You can make this required based on your business logic
        default: 0 // Default to 0 if no quantity is provided
    }

});

const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: "users", 
        required: true
    },
    items: [cartItemSchema], 
    totalItems: {
        type: Number,
        required: true,
        default: 0
    },
    totalPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    status: {
        type: String,
        enum: ["active", "completed", "cancelled"],
        default: "active"
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const Cart = mongoose.model("carts", cartSchema);
module.exports = Cart;
