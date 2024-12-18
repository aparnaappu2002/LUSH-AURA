const User = require('../Models/userSchema')
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
require("dotenv").config(); // Make sure .env is loaded
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Helper function to hash the password
const securePassword = async (password) => {
    try {
        return await bcrypt.hash(password, 10);
    } catch (error) {
        console.log('Password hashing error:', error);
        throw new Error('Password hashing failed');
    }
};

const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendVerificationMail = async (email, otp) => {
    console.log('Sending OTP to email:', email);  
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: process.env.NODEMAILER_EMAIL,
                pass: process.env.NODEMAILER_PASSWORD,
            },
        });

        const info = await transporter.sendMail({
            from: process.env.NODEMAILER_EMAIL,
            to: email,
            subject: 'Verify Your Email',
            text: `Your OTP is ${otp}`,
            html: `<b>Your OTP is ${otp}</b>`,
        });
        console.log('Email sent:', info);

        return info.accepted.length > 0;
    } catch (error) {
        console.log('Error sending email', error);
        return false;
    }
};


const signUp = async (req, res) => {
    try {
        const { firstName, lastName, password, email, phoneNumber } = req.body;

        

        // Check if email already exists
        const isEmailExists = await User.findOne({ email });
        if (isEmailExists) {
            return res.status(409).json({ message: "User already exists" });
        }

        // Generate OTP
        const otp = generateOtp();

        // Send OTP via email
        const emailSent = await sendVerificationMail(email, otp);
        if (!emailSent) {
            return res.status(500).json({ message: "Failed to send verification email" });
        }

        // Hash the password and temporarily store user data along with OTP in the session
        
        req.session.user = {
            firstName,
            lastName,
            email,
            phoneNumber,
            password,
        };
        req.session.otp = otp;

        // console.log(req.session.user)
         console.log(req.session.otp)

        return res.status(200).json({
            message: "User registered. OTP sent to email for verification",
            email,
        });
    } catch (error) {
        console.error('Sign Up Error:', error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


const otpVerification = async (req, res) => {
    console.log("Session Data in OTP Verification:", req.session);

    const { firstName, lastName, email, phoneNumber, password } = req.session.user;
    const HashPassword = await securePassword(password);
    const { otp } = req.body;

    try {
        if (!req.session.otp || req.session.otp !== otp) {
            return res.status(400).json({ success: false, message: "Invalid OTP" });
        }

        if (otp === req.session.otp) {
            const user = new User({
                firstName,
                lastName,
                email,
                password: HashPassword,
                phoneNumber,
                status: 'active',
                isAdmin: 0,
            });
            await user.save();
            console.log(user);

            // Respond with a success flag
            return res.json({ success: true, message: "User created" });
        } else {
            return res.status(400).json({ success: false, message: "Invalid OTP" });
        }
    } catch (error) {
        console.error("Error during OTP verification:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};



const resendOtp = async (req, res) => {
    try {
        const email = req.session.user.email; // Retrieve the email from session

        if (!email) {
            return res.status(400).json({ message: 'No email found in session' });
        }

        // Generate a new OTP
        const newOtp = generateOtp();

        // Send the OTP to the user's email
        const emailSent = await sendVerificationMail(email, newOtp);

        if (!emailSent) {
            return res.status(400).json({ message: 'Failed to resend OTP' });
        }

        // Update session with new OTP
        req.session.otp = newOtp;
        console.log('Resent OTP:', req.session.otp);

        return res.status(200).json({ message: 'OTP resent successfully' });
    } catch (error) {
        console.error('Error resending OTP:', error);
        return res.status(500).json({ message: 'Error in resending OTP' });
    }
};

const googleLogin = async (req, res) => {
    const { email, email_verified, firstName, lastName, id } = req.body;
  
    try {
      if (!email || !id) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
  
      // Check if the user already exists
      let existingUser = await User.findOne({ email });
  
      if (existingUser) {
        // Generate Tokens
        const token = jwt.sign(
          { email: existingUser.email, id: existingUser._id },
          process.env.ACCESS_TOKEN_SECRET_KEY,
          { expiresIn: '1h' }
        );
        console.log("Token:",token)
  
        const refreshToken = jwt.sign(
          { email: existingUser.email, id: existingUser._id },
          process.env.REFRESH_TOKEN_SECRET_KEY,
          { expiresIn: '7d' }
        );
        console.log("Refresh Token:",refreshToken)
  
        return res.status(200).json({
          message: 'User logged in successfully',
          user: existingUser,
          token,
          refreshToken,
        });
      }
  
      // Create a new user if not exists
      const newUser = new User({
        firstName,
        lastName,
        email,
        status: 'active',
        googleId: id,
        isAdmin: 0, 
        GoogleVerified: email_verified,
      });
  
      // Save the new user to the database
      const savedUser = await newUser.save();
  
      const token = jwt.sign(
        { email: savedUser.email, id: savedUser._id },
        process.env.ACCESS_TOKEN_SECRET_KEY,
        { expiresIn: '1h' }
      );
  
      const refreshToken = jwt.sign(
        { email: savedUser.email, id: savedUser._id },
        process.env.REFRESH_TOKEN_SECRET_KEY,
        { expiresIn: '7d' }
      );
  
      return res.status(201).json({
        message: 'User created successfully',
        user: savedUser,
        token,
        refreshToken,
      });
    } catch (error) {
      console.error('Error saving Google user:', error.message);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  };
  
  
  // Helper function to generate a JWT token
  const generateToken = (user) => {
    return jwt.sign({ id: user._id, email: user.email }, process.env.ACCESS_TOKEN_SECRET_KEY, { expiresIn: '1h' });
  };


const login = async (req, res) => {
    const { email, password } = req.body;
    console.log(email, password);

    try {
        // Check the database for the user
        const user = await User.findOne({ email });
        console.log("User Found",user)

        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        // Check if the user is inactive
        if (user.status === 'inactive') {
            return res.status(400).json({ message: "User is blocked by admin" });
        }

        let token, refreshToken;
        
        if (!user.googleId) {
            console.log("Plaintext password:", password);
            console.log("Stored hashed password:", user.password);
            const isPasswordValid = await bcrypt.compare(password, user.password);
            console.log("Password Valid",isPasswordValid)
            if (!isPasswordValid) return res.status(400).json({ message: "Invalid password" });
            console.log("Access Token Secret:", process.env.ACCESS_TOKEN_SECRET_KEY);
            console.log("Refresh Token Secret:", process.env.REFRESH_TOKEN_SECRET_KEY);

            
            token = await jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET_KEY, { expiresIn: '1h' });
            console.log("Token generated:",token)
            refreshToken = await jwt.sign({ email: email }, process.env.REFRESH_TOKEN_SECRET_KEY, { expiresIn: '7d' });
            console.log(" Referesh Token generated:",refreshToken)
        } 

        // Store the refresh token in an HttpOnly cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: false, // Set to `true` in production with HTTPS
            maxAge: 7 * 24 * 60 * 60 * 1000 // Refresh token expires in 7 days
        });

        // Return the login response with the access token
        return res.status(200).json({
            message: "User logged in successfully",
            user: {
                id: user._id,
                name: user.firstName + ' ' + user.lastName,
                email: user.email,
                profileImage: user.profileImage || null,
            },
            token, // Send access token as part of the response
        });

    } catch (error) {
        console.error("Login failed:", error.message);
        return res.status(500).json({ message: "Login failed" });
    }
};

// Refresh Token API endpoint
const refreshToken = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) return res.status(401).json({ message: "No refresh token available" });

    try {
        // Verify the refresh token
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET_KEY);

        // Find the user associated with the email in the refresh token
        const user = await User.findOne({ email: decoded.email });
        if (!user) return res.status(400).json({ message: "User not found" });

        // Generate a new access token
        const newAccessToken = jwt.sign({ email: user.email }, process.env.ACCESS_TOKEN_SECRET_KEY, { expiresIn: '1h' });

        // Return the new access token
        return res.status(200).json({
            message: "New access token created",
            accessToken: newAccessToken,
        });

    } catch (error) {
        console.log('Error in creating the new access token:', error.message);
        return res.status(403).json({ message: "Error in creating the new access token" });
    }
};

module.exports={
    signUp,
    login,
    refreshToken,
    otpVerification,
    resendOtp,
    googleLogin

    

}