const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true, 
    },
    description: {
        type: String,
        required: false, 
    },
    discountType: {
        type: String,
        enum: ['percentage', 'fixed'], 
        required: true,
    },
    discountValue: {
        type: Number,
        required: true, 
    },
    minPurchaseAmount: {
        type: Number,
        required: false, 
    },
    maxDiscount: {
        type: Number,
        required: false, 
    },

    usageLimit: {
        type: Number,
        required: false, 
        default: null, 
    },
    usedCount: {
        type: Number,
        default: 0, 
    },
    startDate: {
        type: Date,
        required: true, 
    },
    endDate: {
        type: Date,
        required: true, 
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'inactive', 
    },
    userId: {
        type: mongoose.Types.ObjectId,
        ref: 'users', 
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now, 
    },
    updatedAt: {
        type: Date,
        default: Date.now, 
    },
});

const Coupons = mongoose.model('coupons', couponSchema);

module.exports = Coupons;
