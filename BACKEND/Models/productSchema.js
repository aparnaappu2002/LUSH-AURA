const mongoose = require ('mongoose')

const varianceSchema = new mongoose.Schema({
    size: {
        type: Number, 
        required: false
    },
    color: {
        type: String, 
        required: false
    },
    quantity: {
        type: Number,
        required: true,
        default: 0
    },
    price: {
        type: Number,
        required: true
    },
    varianceImage:{
        type:[String],
        required:true

    },
    

});

const productSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
        unique:true
    },
    
    price:{
        type:Number,
        required:true
    },
    // availableQuantity:{
    //     type:Number, 
    //     required:true,
    //     default:0
    // },
    description:{
        type:String,
        required:true
    },
    productImage:{
        type:[String],
        required:true

    },
    status:{
        type:String,
        enum:['active','inactive'],
        default:'active'
    },
    categoryId:{
        type:mongoose.Types.ObjectId,
        ref:'category',
        required:true
    },
    stock:{
        type:String,
        enum:["In Stock","Out of Stock","in_stock"]
    },
    sizes:{
        type:Number,
        required:false
    },
    sku: { type: String, default: "no-sku" },
    highlights:{
        type:String,
        required:false
    },
    specifications:{
        type:String,
        required:false
    },
    variances:[varianceSchema],
    salesCount: {  
        type: Number,
        default: 0,
        required: true
    }




})

const Products = mongoose.model("products",productSchema)
module.exports = Products