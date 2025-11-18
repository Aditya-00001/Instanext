import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/users.js';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
dotenv.config();
//contains operations related to user registration, login, id existence check, email verification, and resending verification emails.
const registerUser = async (req, res) => {
  try {
    const { name, email, password, userID } = req.body;
    if (!name || !email || !password || !userID) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate token and expiry
    const token = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const newUser = new User({
      name,
      email,
      userID,
      password: hashedPassword,
      isVerified: false,
      verificationToken: hashedToken,
      verificationTokenExpires: Date.now() + 24 * 60 * 60 * 1000, // 24 hrs
    });

    await newUser.save();

    // Construct verification link
    const verificationLink = `${process.env.FRONTEND_URL}/verify?token=${token}`;

    // Send verification email
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"InstaNext" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verify your InstaNext account",
      html: `
        <h2>Welcome to InstaNext, ${name} 🎉</h2>
        <p>Click the link below to verify your email:</p>
        <a href="${verificationLink}" target="_blank">${verificationLink}</a>
        <p>This link will expire in 24 hours.</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    return res.status(201).json({
      success: true,
      message: "User registered successfully. Please verify your email.",
    });
  } catch (error) {
    console.error("Error during registration:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

//loginUser;
const loginUser = async(req, res) => {
    try{
        const {email, password} = req.body;
        
        if(!email || !password){
            return res.status(400).json({message: 'All fields are required'});
        }
        const user = await User.findOne({email});
        if(!user){
            return res.status(404).json({message: 'User not found'});

        }
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(401).json({message: 'Invalid credentials'});
        }
        
        if (!user.isVerified) {
          return res.status(403).json({ message: 'Email not verified' });
        }

        const token = jwt.sign(
          {id: user._id, email: user.email, userID: user.userID}, 
          process.env.JWT_SECRET, 
          {expiresIn: '7d'});

        res.cookie('token', token, { httpOnly: true, secure: true });

        res.status(200).json({
            message: 'Login successful',
            token,
            user:{
                id: user._id,
                name: user.name,
                email: user.email,
                userID: user.userID,
            }
        });
    }catch(error){
        console.error('Error during login:', error);
        res.status(500).json({message: 'Server error'});
    }
};

const userIDExists = async(req,res) => {
  try {
    const {userID} = req.query;
    const user = await User.findOne({userID});
    return res.json({exists: !!user});
  } catch (error) {
    console.error('Error checking userID existence:', error);
    return res.status(500).json({message: 'Server error'});
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ message: "Missing token" });

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      verificationToken: hashedToken,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired verification link" });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Email verified successfully! You can now log in.",
    });
  } catch (error) {
    console.error("Error verifying email:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isVerified)
      return res.status(400).json({ message: "User already verified" });

    const token = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    user.verificationToken = hashedToken;
    user.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;

    await user.save();

    const verificationLink = `${process.env.FRONTEND_URL}/verify?token=${token}`;

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    await transporter.sendMail({
      from: `"InstaNext" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Resend: Verify your InstaNext account",
      html: `
        <p>Here is your new verification link (valid for 24 hours):</p>
        <a href="${verificationLink}" target="_blank">${verificationLink}</a>
      `,
    });

    return res.status(200).json({ message: "Verification link resent successfully." });
  } catch (error) {
    console.error("Error resending verification:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export { registerUser, loginUser, userIDExists, verifyEmail, resendVerification };
