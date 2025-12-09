import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../model/User.js";
import UnverifiedUser from "../model/UnverifiedUser.js";
import Otp from "../model/Otp.js";
import "dotenv/config";
import { MailerSend } from "mailersend";

const mailerSend = new MailerSend({ apiKey: process.env.MAILERSEND_API_KEY });

// ---------- Helpers ----------
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
    `;

    try {
      await mailerSend.email.send({
        from: {
          email: process.env.MAILERSEND_FROM_EMAIL,
          name: "Bhrugesh Tutorials",
        },
        to: [{ email }],
        subject: "Verify Your Email Address",
        html: emailContent,
      });

      return res.status(200).json({
        message:
          "Verification code sent to your email. If you don't see the email, please check your spam folder and mark it as 'Not Spam'.",
        email,
        name,
      });
    } catch (mailErr) {
      console.error("❌ Email sending failed:", mailErr);
      console.error("Status:", mailErr?.response?.status);
      console.error("Body:", mailErr?.response?.data);
      return res.status(500).json({
        message: "Failed to send verification email. Please try again later.",
      });
    }
  } catch (err) {
    console.error("Signup error:", err.message);
    res
      .status(500)
      .json({ message: "Something went wrong.", error: err.message });
  }
};

// ---------- LOGIN ----------
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found." });

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect)
      return res.status(400).json({ message: "Invalid credentials." });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
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
  } catch {
    res.status(500).json({ message: "Something went wrong." });
  }
};

// ---------- VERIFY EMAIL ----------
export const verifyEmail = async (req, res) => {
  const { email, code } = req.body;

  try {
    const otpDoc = await Otp.findOne({ email });
    if (!otpDoc || otpDoc.otp !== code) {
      return res
        .status(400)
        .json({ message: "Invalid or expired verification code" });
    }

    const userData = await UnverifiedUser.findOne({ email });
    if (!userData)
      return res.status(400).json({ message: "User data not found" });

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

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // fire-and-forget confirmation email via MailerSend
    (async () => {
      try {
        const html = `
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
        `;

        await mailerSend.email.send({
          from: {
            email: process.env.MAILERSEND_FROM_EMAIL,
            name: "Bhrugesh Tutorials",
          },
          to: [{ email }],
          subject:
            "🎉 Email Verified Successfully - Welcome to Bhrugesh Tutorials!",
          html,
        });

        console.log("Confirmation email sent");
      } catch (e) {
        console.error("Confirmation email failed:", e);
      }
    })();

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
    res
      .status(500)
      .json({ message: "Verification error", error: err.message });
  }
};

// ---------- FORGOT PASSWORD ----------
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found." });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });
    const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;

    const html = `
      <h2>Password Reset Request</h2>
      <p>Hello ${user.name || "User"},</p>
      <p>Click below to reset your password (expires in 15 minutes):</p>
      <a href="${resetLink}" style="color:#4f46e5;">Reset Password</a>
    `;

    await mailerSend.email.send({
      from: {
        email: process.env.MAILERSEND_FROM_EMAIL,
        name: "Bhrugesh Tutorials",
      },
      to: [{ email }],
      subject: "Password Reset - Bhrugesh Tutorials",
      html,
    });

    res.json({ message: "Password reset link sent to your email." });
  } catch (err) {
    console.error("Forgot password email error:", err);
    res
      .status(500)
      .json({ message: "Error sending reset link.", error: err.message });
  }
};

// ---------- RESET PASSWORD ----------
export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired link." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password reset successful." });
  } catch (error) {
    console.error("❌ Reset password error:", error.message);
    res.status(400).json({ message: "Invalid or expired link." });
  }
};
