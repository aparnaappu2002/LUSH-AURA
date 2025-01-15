const mongoose = require("mongoose")


const categorySchema = new mongoose.Schema({
    categoryName:{
        type:String,
        required:true
    },
    status:{
        type:String,
        default:"active",
        enum:['active','inactive']

    },
    createdAt:{
        type:Date,
        default:Date.now()
    },
    salesCount: {  
        type: Number,
        default: 0,
        required: true
    }

    
})

const Category = mongoose.model("category",categorySchema)
module.exports=Category