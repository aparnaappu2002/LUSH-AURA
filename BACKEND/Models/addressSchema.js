const mongoose = require("mongoose")


const addressSchema = new mongoose.Schema({

    userId:{
        type:mongoose.Types.ObjectId,
        ref:'users',
        required:true
    },
    addressLine: {
        type: String,
        required: true,
      },
    street:{
        type:String,
        required:true
    },
    city:{
        type:String,
        required:true
    },
    state:{
        type:String,
        required:true
    },
    pincode:{
        type:Number,
        required:true
    },
    country:{
        type:String,
        required:true
    },
    phone:{
        type:Number,
        required:true,
        ref:"users"
    },
    defaultAddress:{
        type:Boolean,
        default:false
    }
})

const Address = mongoose.model("address",addressSchema)
module.exports= Address
