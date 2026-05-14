import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import User from "../model/User.js";
import UnverifiedUser from "../model/UnverifiedUser.js";
import Otp from "../model/Otp.js";

import "dotenv/config";

// ---------- NODEMAILER SETUP ----------
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },

  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
});
transporter.verify((error, success) => {
  if (error) {
    console.log("SMTP ERROR:", error);
  } else {
    console.log("SMTP SERVER READY");
  }
});

// ---------- HELPERS ----------
const validatePassword = (password) => {
  const regex = /^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{6,})/;
  return regex.test(password);
};

const generateOtp = () => {
  const num = crypto.randomBytes(3).readUIntBE(0, 3) % 900000;
  return String(100000 + num);
};

// ---------- SIGNUP ----------
export const signup = async (req, res) => {
  const { name, email, password, standard } = req.body;

  if (!name || !email || !password || !standard) {
    return res.status(400).json({ message: "All fields required." });
  }

  if (!validatePassword(password)) {
    return res.status(400).json({
      message:
        "Password must be at least 6 characters, include a number and a special character.",
    });
  }

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists." });
    }

    await Otp.deleteOne({ email });
    await UnverifiedUser.deleteOne({ email });

    const otp = generateOtp();

    const hashedPassword = await bcrypt.hash(password, 12);

    await UnverifiedUser.create({
      name,
      email,
      password: hashedPassword,
      role: "user",
      standard,
    });

    await Otp.create({ email, otp });

    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h1 style="color:#4f46e5;">Welcome to Bhrugesh Tutorials</h1>

        <p>Hello ${name},</p>

        <p>Your verification code is:</p>

        <div style="
          background:#f3f4f6;
          padding:20px;
          text-align:center;
          font-size:32px;
          font-weight:bold;
          letter-spacing:5px;
          border-radius:10px;
        ">
          ${otp}
        </div>

        <p style="margin-top:20px;">
          This OTP is valid for 10 minutes.
        </p>

        <p>Thank you for registering.</p>
      </div>
    `;
    console.log("EMAIL_USER:", process.env.EMAIL_USER);
    console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "EXISTS" : "MISSING");
    try {
      await transporter.sendMail({
        from: `"Bhrugesh Tutorials" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Verify Your Email",
        html: emailContent,
      });

      return res.status(200).json({
        message: "Verification code sent successfully!",
        email,
      });
    } catch (mailErr) {
      console.error("EMAIL ERROR:", mailErr);

      return res.status(500).json({
        message: "Failed to send verification email.",
        error: mailErr.message,
      });
    }
  } catch (err) {
    console.error("SIGNUP ERROR:", err);

    return res.status(500).json({
      message: "Something went wrong.",
      error: err.message,
    });
  }
};

// ---------- LOGIN ----------
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "User not found.",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(400).json({
        message: "Invalid credentials.",
      });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    return res.status(200).json({
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        standard: user.standard,
        _id: user._id,
      },
      token,
      message: "Login successful",
    });
  } catch (err) {
    return res.status(500).json({
      message: "Something went wrong.",
    });
  }
};

// ---------- VERIFY EMAIL ----------
export const verifyEmail = async (req, res) => {
  const { email, code } = req.body;

  try {
    const otpDoc = await Otp.findOne({ email });

    if (!otpDoc || otpDoc.otp !== code) {
      return res.status(400).json({
        message: "Invalid or expired verification code",
      });
    }

    const userData = await UnverifiedUser.findOne({ email });

    if (!userData) {
      return res.status(400).json({
        message: "User data not found",
      });
    }

    const newUser = await User.create({
      name: userData.name,
      email: userData.email,
      password: userData.password,
      phone: userData.phone || "",
      role: userData.role || "user",
      standard: userData.standard || "",
    });

    await Otp.deleteOne({ email });
    await UnverifiedUser.deleteOne({ email });

    const token = jwt.sign(
      { id: newUser._id },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    // confirmation email
    try {
      await transporter.sendMail({
        from: `"Bhrugesh Tutorials" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Email Verified Successfully",
        html: `
          <h2>Welcome ${newUser.name} 🎉</h2>
          <p>Your email has been verified successfully.</p>
          <p>You can now login and start learning.</p>
        `,
      });
    } catch (err) {
      console.log("Confirmation email failed:", err.message);
    }

    return res.status(200).json({
      message: "Email verified successfully!",
      token,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        standard: newUser.standard,
      },
    });
  } catch (err) {
    console.log("VERIFY ERROR:", err);

    return res.status(500).json({
      message: "Verification error",
      error: err.message,
    });
  }
};

// ---------- FORGOT PASSWORD ----------
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      {
        expiresIn: "15m",
      }
    );

    const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;

    const html = `
      <h2>Password Reset</h2>

      <p>Hello ${user.name},</p>

      <p>Click below to reset your password:</p>

      <a href="${resetLink}">
        Reset Password
      </a>

      <p>This link expires in 15 minutes.</p>
    `;

    await transporter.sendMail({
      from: `"Bhrugesh Tutorials" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset",
      html,
    });

    return res.json({
      message: "Password reset link sent successfully.",
    });
  } catch (err) {
    console.error("FORGOT PASSWORD ERROR:", err);

    return res.status(500).json({
      message: "Error sending reset link.",
      error: err.message,
    });
  }
};

// ---------- RESET PASSWORD ----------
export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired link.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;

    await user.save();

    return res.json({
      message: "Password reset successful.",
    });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error.message);

    return res.status(400).json({
      message: "Invalid or expired link.",
    });
  }
};