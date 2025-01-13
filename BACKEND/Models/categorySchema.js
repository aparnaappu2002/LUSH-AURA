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
    
})

const Category = mongoose.model("category",categorySchema)
module.exports=Category