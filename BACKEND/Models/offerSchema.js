const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
    offerName: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false
    },
    discountPercentage: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    products: [{
        type: mongoose.Types.ObjectId,
        ref: 'products',
        required: false
    }],
    category: {
        type: mongoose.Types.ObjectId,
        ref: 'category',
        required: false
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Offer = mongoose.model("offer", offerSchema);
module.exports = Offer;
