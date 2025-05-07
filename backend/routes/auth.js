const express = require("express");
const router = express.Router();
const User = require("../model/users");
const sendOtp = require("../utils/otp");


const otpStore = {};

// Signup Route
router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;

  
  console.log("Signup request received:", req.body);

  if (!username || !email || !password) {
    console.log("Validation failed: Missing fields");
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
 
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      console.log("Validation failed: Username already exists");
      return res.status(409).json({ error: "Username already exists." });
    }

  
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      console.log("Validation failed: Email already exists");
      return res.status(409).json({ error: "Email already exists." });
    }

   
    const newUser = new User({ username, email, password });
    console.log("Creating new user:", newUser);
    await newUser.save();

    res.status(201).json({ message: "Signup successful. Please verify your email." });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ error: "An error occurred. Please try again." });
  }
});

// Send OTP Route
router.post("/send-otp", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).send("Email is required.");
  }

  try {
    const otp = Math.floor(100000 + Math.random() * 900000); 
    otpStore[email] = otp;

    // Send OTP email
    await sendOtp(email, otp);
    res.status(200).send("OTP sent successfully!");
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).send("Failed to send OTP. Please try again.");
  }
});

// Verify OTP Route
router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).send("Email and OTP are required.");
  }

  if (otpStore[email] && otpStore[email] === parseInt(otp, 10)) {
    delete otpStore[email]; // Remove OTP after successful verification
    await User.updateOne({ email }, { isVerified: true });

    res.status(200).send("OTP verified successfully!");
  } else {
    res.status(400).send("Invalid OTP. Please try again.");
  }
});

// Login Route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

   
    if (!user.isVerified) {
      return res.status(403).json({ error: "User is not verified. Please verify your email." });
    }

  
    if (user.password !== password) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

  
    res.status(200).json({ message: "Login successful.", username: user.username });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "An error occurred. Please try again." });
  }
});

module.exports = router;
