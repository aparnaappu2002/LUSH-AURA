const express = require("express")
const cors = require("cors")
const path = require('path')
const app = express()
const mongoose = require("mongoose")
const cookieParser = require("cookie-parser")
const userRoute = require("./Routes/userRoutes")
const adminRoute = require("./Routes/adminRoutes")
require('dotenv').config();
const session = require("express-session")


app.use(express.json())
app.use(cookieParser())

app.use(cors({
    origin: 'http://localhost:5173', // Replace with your frontend's URL
    // methods: ['GET', 'POST', 'PUT', 'DELETE','PATCH'], // Allowed HTTP methods
    credentials: true // If using cookies or authentication
}));
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  next();
});


mongoose.connect("mongodb://localhost:27017/LUSH_AURA")
.then(() => {
    console.log(`MongoDB connected successfully to ${mongoose.connection.name}`);
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });
  app.use(session({
    secret: process.env.SESSION_SECRET || 'your_secret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 86400000 } // Secure should be true in production
}));

app.use("/user",userRoute)
app.use("/admin",adminRoute)

app.listen("3000",()=>{
    console.log("Server Started")
})