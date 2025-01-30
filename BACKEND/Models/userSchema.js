const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    firstName:{
        type:String,
        required:true
    },
    lastName:{
        type:String,
        required:false

    },
    email:{
        type:String,
        required:true,
        
    },
    phoneNumber:{
        type:String,
        required:false
    },
    password:{
        type:String,
        required:false
    },
    isAdmin:{
        type:Boolean,
        default:false
    },
    status:{
        type:String,
        enum:['active','inactive'],
        default:'active'
    },
    googleId:{
        type:String,
        default:null
    },
    GoogleVerified:{
        type:Boolean,
        default:false,
        required:false
    },
    joinDate:{
        type:Date,
        default:Date.now()
    }


})

const User = mongoose.model("users",userSchema)
module.exports= User