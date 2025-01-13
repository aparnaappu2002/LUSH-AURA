const mongoose = require("mongoose");

const walletTransactionSchema = new mongoose.Schema({
    transactionType: {
        type: String,
        enum: ["Credit", "Debit"],
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    date: {
        type: Date,
        default: Date.now
    },
    orderId: {
        type: mongoose.Types.ObjectId,
        ref: "orders",
        required: false 
    },
    description: {
        type: String,
        required: true
    }
});

const walletSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: "users",
        required: true,
        unique: true
    },
    balance: {
        type: Number,
        default: 0,
        min: 0
    },
    transactions: [walletTransactionSchema]
});

const Wallet = mongoose.model("wallets", walletSchema);

module.exports = Wallet;
