// import dotenv from "dotenv";
// dotenv.config();

// import express from "express";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";
// import cors from "cors";
// import nodemailer from "nodemailer";
// import mongoose from "mongoose";
// import User from "./models/User.js";

// const app = express();
// app.use(express.json());
// app.use(cors());

// const SECRET = process.env.JWT_SECRET;

// // ===================== DB CONNECT =====================
// mongoose
//   .connect(process.env.MONGO_URI)
//   .then(() => console.log("✅ MongoDB Atlas connected"))
//   .catch((err) => console.error("❌ MongoDB error:", err));

// // ===================== TEMP: Check Environment Variables =====================
// app.get("/api/check-env", (req, res) => {
//   res.json({
//     mongoUri: process.env.MONGO_URI ? "✅ OK" : "❌ Missing",
//     jwtSecret: process.env.JWT_SECRET ? "✅ OK" : "❌ Missing",
//     emailUser: process.env.EMAIL_USER ? "✅ OK" : "❌ Missing",
//     emailPass: process.env.EMAIL_PASS ? "✅ OK" : "❌ Missing",
//     port: process.env.PORT || "❌ Missing",
//   });
// });

// // ===================== ADMIN USER =====================
// const adminUser = {
//   email: "geomancysolutions@gmail.com",
//   fullname: "Admin User",
//   role: "admin",
//   password: "$2b$10$JQWKGJmWuAr5NTtd1lz8ueqkvLXUvs3d6.3HnPkxJPz9fCrrTQ6mi", // hash of 'admin123'
// };

// // ===================== EMAIL TRANSPORTER =====================
// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// // ===================== LOGIN / SIGNUP / PASSWORD ROUTES =====================

// // ---------- LOGIN ----------
// app.post("/login", async (req, res) => {
//   const { email, password, rememberMe } = req.body;

//   let user;
//   if (email === adminUser.email) {
//     user = adminUser;
//   } else {
//     try {
//       user = await User.findOne({ email });
//     } catch (err) {
//       return res.status(500).json({ error: "Database error." });
//     }
//     if (!user) return res.status(401).json({ error: "Invalid email or password." });

//     if (user.lockUntil && user.lockUntil > Date.now()) {
//       return res.status(403).json({
//         error: `Account locked. Try again in ${Math.ceil(
//           (user.lockUntil - Date.now()) / 60000
//         )} min.`,
//       });
//     }
//   }

//   const match = await bcrypt.compare(password, user.password);
//   if (!match) {
//     if (user.role === "user") {
//       user.failedAttempts = (user.failedAttempts || 0) + 1;
//       if (user.failedAttempts >= 5) {
//         user.lockUntil = Date.now() + 15 * 60 * 1000;
//       }
//       await user.save();
//     }
//     return res.status(401).json({ error: "Invalid email or password." });
//   }

//   if (user.role === "user") {
//     user.failedAttempts = 0;
//     user.lockUntil = null;
//     await user.save();
//   }

//   const token = jwt.sign({ email: user.email, role: user.role }, SECRET, {
//     expiresIn: rememberMe ? "7d" : "2h",
//   });

//   res.json({
//     token,
//     user: { email: user.email, fullname: user.fullname, role: user.role },
//   });
// });

// // ---------- SIGNUP ----------
// app.post("/signup", async (req, res) => {
//   const { fullname, email, password } = req.body;

//   if (!fullname || !email || !password) {
//     return res.status(400).json({ error: "All fields are required." });
//   }

//   const existingUser = await User.findOne({ email });
//   if (existingUser) return res.status(400).json({ error: "Email already in use." });

//   try {
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const newUser = new User({
//       fullname,
//       email,
//       password: hashedPassword,
//       role: "user",
//       failedAttempts: 0,
//       lockUntil: null,
//     });
//     await newUser.save();

//     const token = jwt.sign({ email: newUser.email, role: newUser.role }, SECRET, {
//       expiresIn: "2h",
//     });

//     res.status(201).json({
//       user: { email: newUser.email, fullname: newUser.fullname, role: newUser.role },
//       token,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// // ---------- FORGOT PASSWORD ----------
// app.post("/forgot-password", async (req, res) => {
//   const { email } = req.body;
//   const user = await User.findOne({ email });

//   if (!user) return res.status(404).json({ error: "User not found" });

//   const resetToken = jwt.sign({ email: user.email }, SECRET, { expiresIn: "15m" });
//   const resetLink = `https://sacred-geomancy-solutions.vercel.app/reset-password/${resetToken}`;

//   await transporter.sendMail({
//     from: process.env.EMAIL_USER,
//     to: email,
//     subject: "Password Reset Request",
//     html: `<p>You requested a password reset.</p>
//            <p><a href="${resetLink}">Click here to reset</a></p>
//            <p>This link expires in 15 minutes.</p>`,
//   });

//   res.json({ message: "Password reset link sent to your email." });
// });

// // ---------- RESET PASSWORD ----------
// app.post("/reset-password/:token", async (req, res) => {
//   const { token } = req.params;
//   const { newPassword } = req.body;

//   if (!newPassword) return res.status(400).json({ error: "New password is required." });

//   try {
//     const decoded = jwt.verify(token, SECRET);
//     const user = await User.findOne({ email: decoded.email });

//     if (!user) return res.status(404).json({ error: "User not found" });

//     user.password = await bcrypt.hash(newPassword, 10);
//     await user.save();

//     res.json({ message: "Password has been reset successfully." });
//   } catch (err) {
//     res.status(400).json({ error: "Invalid or expired token." });
//   }
// });

// // ===================== HEALTH CHECK =====================
// app.get("/api/health", (req, res) => {
//   res.json({
//     status: "ok",
//     message: "Backend is running 🚀",
//     timestamp: new Date(),
//   });
// });

// export default app;
// import dotenv from "dotenv";
// dotenv.config();

// import express from "express";
// import cors from "cors";
// import mongoose from "mongoose";

// const app = express();
// app.use(express.json());
// app.use(cors());

// // ---------------- DB CONNECT ----------------
// mongoose.connect(process.env.MONGO_URI)
//   .then(() => console.log("✅ MongoDB Atlas connected"))
//   .catch(err => console.error("❌ MongoDB error:", err));

// // ---------------- Routes ----------------
// app.get("/api/health", (req, res) => {
//   res.json({ status: "ok", message: "Backend is running 🚀", timestamp: new Date() });
// });

// // ===================== ADMIN USER =====================
// const adminUser = {
//   email: "geomancysolutions@gmail.com",
//   fullname: "Admin User",
//   role: "admin",
//   password: "$2b$10$JQWKGJmWuAr5NTtd1lz8ueqkvLXUvs3d6.3HnPkxJPz9fCrrTQ6mi", // hash of 'admin123'
// };

// // ===================== EMAIL TRANSPORTER =====================
// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// // ===================== LOGIN / SIGNUP / PASSWORD ROUTES =====================

// // ---------- LOGIN ----------
// app.post("/login", async (req, res) => {
//   const { email, password, rememberMe } = req.body;

//   let user;
//   if (email === adminUser.email) {
//     user = adminUser;
//   } else {
//     try {
//       user = await User.findOne({ email });
//     } catch (err) {
//       return res.status(500).json({ error: "Database error." });
//     }
//     if (!user) return res.status(401).json({ error: "Invalid email or password." });

//     if (user.lockUntil && user.lockUntil > Date.now()) {
//       return res.status(403).json({
//         error: `Account locked. Try again in ${Math.ceil(
//           (user.lockUntil - Date.now()) / 60000
//         )} min.`,
//       });
//     }
//   }

//   const match = await bcrypt.compare(password, user.password);
//   if (!match) {
//     if (user.role === "user") {
//       user.failedAttempts = (user.failedAttempts || 0) + 1;
//       if (user.failedAttempts >= 5) {
//         user.lockUntil = Date.now() + 15 * 60 * 1000;
//       }
//       await user.save();
//     }
//     return res.status(401).json({ error: "Invalid email or password." });
//   }

//   if (user.role === "user") {
//     user.failedAttempts = 0;
//     user.lockUntil = null;
//     await user.save();
//   }

//   const token = jwt.sign({ email: user.email, role: user.role }, SECRET, {
//     expiresIn: rememberMe ? "7d" : "2h",
//   });

//   res.json({
//     token,
//     user: { email: user.email, fullname: user.fullname, role: user.role },
//   });
// });

// // ---------- SIGNUP ----------
// app.post("/signup", async (req, res) => {
//   const { fullname, email, password } = req.body;

//   if (!fullname || !email || !password) {
//     return res.status(400).json({ error: "All fields are required." });
//   }

//   const existingUser = await User.findOne({ email });
//   if (existingUser) return res.status(400).json({ error: "Email already in use." });

//   try {
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const newUser = new User({
//       fullname,
//       email,
//       password: hashedPassword,
//       role: "user",
//       failedAttempts: 0,
//       lockUntil: null,
//     });
//     await newUser.save();

//     const token = jwt.sign({ email: newUser.email, role: newUser.role }, SECRET, {
//       expiresIn: "2h",
//     });

//     res.status(201).json({
//       user: { email: newUser.email, fullname: newUser.fullname, role: newUser.role },
//       token,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// // ---------- FORGOT PASSWORD ----------
// app.post("/forgot-password", async (req, res) => {
//   const { email } = req.body;
//   const user = await User.findOne({ email });

//   if (!user) return res.status(404).json({ error: "User not found" });

//   const resetToken = jwt.sign({ email: user.email }, SECRET, { expiresIn: "15m" });
//   const resetLink = `https://sacred-geomancy-solutions.vercel.app/reset-password/${resetToken}`;

//   await transporter.sendMail({
//     from: process.env.EMAIL_USER,
//     to: email,
//     subject: "Password Reset Request",
//     html: `<p>You requested a password reset.</p>
//            <p><a href="${resetLink}">Click here to reset</a></p>
//            <p>This link expires in 15 minutes.</p>`,
//   });

//   res.json({ message: "Password reset link sent to your email." });
// });

// // ---------- RESET PASSWORD ----------
// app.post("/reset-password/:token", async (req, res) => {
//   const { token } = req.params;
//   const { newPassword } = req.body;

//   if (!newPassword) return res.status(400).json({ error: "New password is required." });

//   try {
//     const decoded = jwt.verify(token, SECRET);
//     const user = await User.findOne({ email: decoded.email });

//     if (!user) return res.status(404).json({ error: "User not found" });

//     user.password = await bcrypt.hash(newPassword, 10);
//     await user.save();

//     res.json({ message: "Password has been reset successfully." });
//   } catch (err) {
//     res.status(400).json({ error: "Invalid or expired token." });
//   }
// });

// export default app;
// app.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// ✅ Example health route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Backend is running 🚀", timestamp: new Date() });
});

// ⬇️ Add your login/signup/password routes here

// ✅ Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Atlas connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

export default app;
