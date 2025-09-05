// /api/index.js
import express from "express";
import serverless from "serverless-http";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cors from "cors";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../models/User.js"; // adjust path if needed

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const SECRET = process.env.JWT_SECRET;

// ---------------- DB CONNECT ----------------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Atlas connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// ---------------- Routes ----------------
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Backend is running 🚀", timestamp: new Date() });
});

// Add /login, /signup, /forgot-password, /reset-password routes here

export default app;
export const handler = serverless(app);
