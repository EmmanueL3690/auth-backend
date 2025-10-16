import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import rateLimit from "express-rate-limit";
import User from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";

const router = express.Router();

/* =============================
   RATE LIMITERS
============================= */
const signupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: { message: "Too many signup attempts. Try again later." },
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "Too many login attempts. Try again later." },
});

/* =============================
   HELPERS
============================= */
const generateOTP = () => String(crypto.randomInt(100000, 999999)); // 6 digits only

const strongPassword =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

const generateAccessToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "15m" });

const generateRefreshToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });

/* =============================
   SIGNUP
============================= */
router.post("/signup", signupLimiter, async (req, res) => {
  try {
    let { fullname, email, password } = req.body;
    if (!fullname || !email || !password)
      return res.status(400).json({ status: "error", message: "All fields are required" });

    email = email.toLowerCase().trim();

    if (!strongPassword.test(password)) {
      return res.status(400).json({
        status: "error",
        message:
          "Password too weak. Must include upper, lower, number, special char, min 8 chars",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ status: "error", message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 12);
    const otp = generateOTP();

    const newUser = new User({
      fullname,
      email,
      password: hashedPassword,
      isVerified: false,
      verificationCode: otp,
      verificationCodeExpires: Date.now() + 10 * 60 * 1000, // 10 minutes
    });

    await newUser.save();

    await sendEmail(
      email,
      "Verify Your Account",
      `<p>Hello ${fullname},</p>
       <p>Your verification code is: <b>${otp}</b></p>
       <p>This code expires in 10 minutes.</p>`
    );

    res.status(201).json({
      status: "success",
      message: "Signup successful. Check your email for the verification code.",
      email,
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ status: "error", message: "Server error", error: err.message });
  }
});

/* =============================
   VERIFY EMAIL
============================= */
router.post("/verify-email", async (req, res) => {
  try {
    let { email, code } = req.body;
    email = email.toLowerCase().trim();
    code = String(code).trim();

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ status: "error", message: "User not found" });

    if (user.isVerified)
      return res.status(400).json({ status: "error", message: "Account already verified" });

    if (user.verificationCode !== code)
      return res.status(400).json({ status: "error", message: "Invalid verification code" });

    if (user.verificationCodeExpires < Date.now())
      return res.status(400).json({ status: "error", message: "Verification code expired" });

    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    res.json({ status: "success", message: "Account verified successfully! You can now log in." });
  } catch (err) {
    console.error("Verify error:", err);
    res.status(500).json({ status: "error", message: "Server error", error: err.message });
  }
});

/* =============================
   RESEND VERIFICATION CODE
============================= */
router.post("/resend-code", async (req, res) => {
  try {
    let { email } = req.body;
    email = email.toLowerCase().trim();

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ status: "error", message: "User not found" });

    if (user.isVerified)
      return res.status(400).json({ status: "error", message: "Account already verified" });

    const otp = generateOTP();
    user.verificationCode = otp;
    user.verificationCodeExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    await sendEmail(
      email,
      "New Verification Code",
      `<p>Hello ${user.fullname},</p>
       <p>Your new verification code is: <b>${otp}</b></p>
       <p>This code expires in 10 minutes.</p>`
    );

    res.json({ status: "success", message: "New verification code sent to your email." });
  } catch (err) {
    console.error("Resend error:", err);
    res.status(500).json({ status: "error", message: "Server error", error: err.message });
  }
});

/* =============================
   LOGIN
============================= */
router.post("/login", loginLimiter, async (req, res) => {
  try {
    let { email, password } = req.body;
    email = email.toLowerCase().trim();

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ status: "error", message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ status: "error", message: "Invalid email or password" });

    if (!user.isVerified)
      return res.status(403).json({ status: "error", message: "Please verify your email first" });

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      status: "success",
      message: "Login successful",
      user: { fullname: user.fullname, email: user.email },
      accessToken,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ status: "error", message: "Server error", error: err.message });
  }
});

/* =============================
   REFRESH TOKEN
============================= */
router.post("/refresh-token", async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token)
      return res.status(401).json({ status: "error", message: "No refresh token" });

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const accessToken = generateAccessToken(decoded.id);

    res.json({ status: "success", accessToken });
  } catch (err) {
    console.error("Token refresh error:", err);
    res.status(403).json({ status: "error", message: "Invalid refresh token" });
  }
});

export default router;