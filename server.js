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

app.use(cors({
  origin: [
    "https://sacred-geomancy-solutions-icfvpfufr.vercel.app", // ✅ your production frontend
    "http://localhost:5173" // ✅ for local testing
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));

app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());
app.use(compression());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
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
const PORT = process.env.PORT || 10000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);