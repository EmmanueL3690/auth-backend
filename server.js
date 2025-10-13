import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import compression from "compression";
import cookieParser from "cookie-parser"; // <-- REQUIRED for refresh tokens
import authRoutes from "./routes/auth.js";

dotenv.config();
const app = express();

/* =============================
   SECURITY & MIDDLEWARE
============================= */

// Secure HTTP headers
app.use(helmet());

// CORS (restrict to frontend domain)
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true, // allow cookies
}));

// Body parser
app.use(express.json({ limit: "10kb" }));

// Cookie parser (for refreshToken in cookies)
app.use(cookieParser());

// Compression (gzip responses)
app.use(compression());

// Global rate limiter (all routes)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 100, // max requests per IP
  message: { message: "Too many requests from this IP, try again later." },
});
app.use(limiter);

/* =============================
   DATABASE CONNECTION
============================= */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

/* =============================
   ROUTES
============================= */
app.use("/api/auth", authRoutes);

// Health check route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date() });
});

/* =============================
   ERROR HANDLER
============================= */
app.use((err, req, res, next) => {
  console.error("❌ Error:", err);
  res.status(500).json({ message: "Server error", error: err.message });
});

/* =============================
   START SERVER
============================= */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
