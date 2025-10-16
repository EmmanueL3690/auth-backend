import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import compression from "compression";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.js";

dotenv.config();
const app = express();

/* =============================
   SECURITY & MIDDLEWARE
============================= */
app.use(helmet());
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());
app.use(compression());

// ✅ CORS configuration for both local + deployed frontend
const allowedOrigins = [
  "https://sacred-geomancy-solutions-icfvpfufr.vercel.app", // frontend on Vercel
  "http://localhost:5173" // local development
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

/* =============================
   RATE LIMITER
============================= */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP
  message: { message: "Too many requests, try again later." },
});
app.use(limiter);

/* =============================
   DATABASE CONNECTION
============================= */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

/* =============================
   ROUTES
============================= */
app.use("/api/auth", authRoutes);

// Health check route
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Auth backend is live 🚀",
    timestamp: new Date(),
  });
});

/* =============================
   ERROR HANDLER
============================= */
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  res.status(500).json({
    message: "Internal Server Error",
    error: err.message,
  });
});

/* =============================
   START SERVER
============================= */
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`✅ API base URL: https://auth-backend-1qly.onrender.com/api/auth`);
});