const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Types.ObjectId,
        ref: "products",
        required: true
    },
    productName: {
        type: String,
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
        varianceImage: {
            type: [String],
            required: true
        }
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    price: {
        type: Number,
        required: true
    },
    subtotal: {
        type: Number,
        required: true
    }
});

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: "users",
        required: true
    },
    items: [orderItemSchema],
    shippingAddress: {
        type: mongoose.Types.ObjectId,
        ref: "address",
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ["Cash on Delivery", "Debit Card", "Credit Card", "UPI"],
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ["Pending", "Completed", "Failed"],
        default: "Pending"
    },
    orderStatus: {
        type: String,
        enum: ["Placed", "Processing", "Shipped", "Delivered", "Cancelled"],
        default: "Placed"
    },
    totalItems: {
        type: Number,
        required: true
    },
    totalPrice: {
        type: Number,
        required: true
    },
    orderDate: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const Order = mongoose.model("orders", orderSchema);
module.exports = Order;
