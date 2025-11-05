import nodemailer from "nodemailer";
import crypto from "crypto";
import User from "../model/User.js";
import UnverifiedUser from "../model/UnverifiedUser.js";
import Otp from "../model/Otp.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const validatePassword = (password) => {
  const regex = /^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{6,})/;
  return regex.test(password);
};

// helper: secure 6-digit OTP using crypto.randomBytes
const generateOtp = () => {
  // Use 3 bytes = 24 bits, then mod 900000 to get 0..899999, add 100000 -> 100000..999999
  const num = crypto.randomBytes(3).readUIntBE(0, 3) % 900000;
  return String(100000 + num);
};

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
    // Check if user already exists in verified users
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists." });
    }

    // Remove any previous unverified records
    await Otp.deleteOne({ email });
    await UnverifiedUser.deleteOne({ email });

    // Generate OTP and hash password
    const otp = generateOtp();
    const hashedPassword = await bcrypt.hash(password, 12);

    // Save to UnverifiedUser and Otp
    await UnverifiedUser.create({
      name,
      email,
      password: hashedPassword,
      role: "user",
      standard,
    });

    await Otp.create({ email, otp });

    // --- ✅ Nodemailer transporter setup ---
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // true for 465, false for 587
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Verify transporter before sending
    await transporter.verify().catch((err) => {
      console.error("❌ Email transporter verification failed:", err.message);
      throw new Error("Mail transporter setup failed. Check your email credentials.");
    });

    // Email content
    const mailOptions = {
      from: `"Bhrugesh Tutorials" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verify Your Email - Bhrugesh Tutorials",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #007bff;">Welcome to Bhrugesh Tutorials!</h1>
          <p>Hi ${name},</p>
          <p>Thank you for registering. Please verify your email using the code below:</p>
          <h2 style="background: #f0f0f0; padding: 12px; text-align: center; letter-spacing: 3px; font-size: 24px;">
            ${otp}
          </h2>
          <p>This code is valid for 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <br>
          <p>Best regards,<br><strong>Bhrugesh Tutorials Team</strong></p>
        </div>
      `,
    };

    // --- ✅ Send mail with error handling ---
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log("📧 Verification email sent:", info.response);

      return res.status(200).json({
        message:
          "Verification code sent to your email. Please verify to complete registration. Check your spam folder if not found.",
        email,
        name,
      });
    } catch (mailErr) {
      console.error("❌ Email sending failed:", mailErr.message);
      return res
        .status(500)
        .json({ message: "Failed to send verification email. Please try again later." });
    }
  } catch (err) {
    console.error("Signup error:", err.message);
    res.status(500).json({ message: "Something went wrong.", error: err.message });
  }
};
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found." });

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect)
      return res.status(400).json({ message: "Invalid credentials." });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    return res.status(200).json({
      user: { name: user.name, email: user.email, role: user.role, standard: user.standard, _id: user._id },
      token,
      message: "Login successful",
    });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong." });
  }
};

export const verifyEmail = async (req, res) => {
  const { email, code } = req.body;

  try {
    // 1️⃣ Check OTP validity
    const otpDoc = await Otp.findOne({ email });
    if (!otpDoc || otpDoc.otp !== code) {
      return res.status(400).json({ message: "Invalid or expired verification code" });
    }

    // 2️⃣ Get unverified user data
    const userData = await UnverifiedUser.findOne({ email });
    if (!userData) return res.status(400).json({ message: "User data not found" });

    // 3️⃣ Create verified user
    const newUser = await User.create({
      name: userData.name,
      email: userData.email,
      password: userData.password,
      phone: userData.phone || "",
      role: userData.role || "user",
      standard: userData.standard || "",
    });

    // 4️⃣ Cleanup temporary data
    await Otp.deleteOne({ email });
    await UnverifiedUser.deleteOne({ email });

    // 5️⃣ Generate JWT token
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    // 6️⃣ Send confirmation email (non-blocking)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "🎉 Email Verified Successfully - Welcome to Bhrugesh Tutorials!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #004aad; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1>Bhrugesh Tutorials</h1>
          </div>
          <div style="background: #ffffff; padding: 20px; border: 1px solid #e0e0e0; border-top: none;">
            <p>Hi <strong>${newUser.name}</strong>,</p>
            <p>Congratulations! 🎉 Your email has been successfully verified.</p>
            <p>You can now log in and start exploring lectures, notes, and much more.</p>
            <p style="margin-top: 20px;">We’re thrilled to have you on board!</p>
            <p style="color: #004aad; font-weight: bold;">— Team Bhrugesh Tutorials</p>
          </div>
          <div style="background: #f8f8f8; text-align: center; padding: 10px; border-top: 1px solid #ddd; border-radius: 0 0 10px 10px;">
            <p style="font-size: 12px; color: #888;">This is an automated message, please do not reply.</p>
          </div>
        </div>
      `,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error("Confirmation email failed:", err.message);
      } else {
        console.log("Confirmation email sent:", info.response);
      }
    });

    // 7️⃣ Send success response
    res.status(200).json({
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
    console.log("verify", err.message);
    res.status(500).json({ message: "Verification error", error: err.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found." });

    // Generate reset token valid for 15 mins
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "15m" });
    const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      to: email,
      from: process.env.EMAIL_USER,
      subject: "Password Reset - Bhrugesh Tutorials",
      html: `
        <h2>Password Reset Request</h2>
        <p>Hello ${user.name || "User"},</p>
        <p>Click below to reset your password (expires in 15 minutes):</p>
        <a href="${resetLink}" style="color:#4f46e5;">Reset Password</a>
      `,
    });

    res.json({ message: "Password reset link sent to your email." });
  } catch (err) {
    console.error("Forgot password error:", err); // 👈 add this line
    res.status(500).json({ message: "Error sending reset link.", error: err.message });
  }
};


// 🔐 Reset Password
export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired link." });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password reset successful." });

  } catch (error) {
    console.error("❌ Reset password error:", error.message);
    res.status(400).json({ message: "Invalid or expired link." });
  }
};

