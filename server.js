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

/* =============================
   TRUST PROXY (Render Fix)
============================= */
app.set("trust proxy", 1);

/* =============================
   CORS CONFIGURATION
============================= */
const allowedOrigins = [
  "https://sacred-geomancy-solutions-icfvpfufr.vercel.app", // vercel preview
  "https://www.geomancysolutions.com", // ✅ your custom domain
  "http://localhost:5173", // local development
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error(`❌ Blocked by CORS: ${origin}`);
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
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: "Too many requests, try again later." },
});
app.use(limiter);

/* =============================
   DATABASE CONNECTION
============================= */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

/* =============================
   ROUTES
============================= */
app.use("/api/auth", authRoutes);

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Auth backend is live 🚀",
    timestamp: new Date(),
  });
});

/* =============================
   GLOBAL ERROR HANDLER
============================= */
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
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