import express from "express";
import cors from "cors";
import authRoutes from "../routes/auth"; // path to auth.js

const app = express();
app.use(express.json());
app.use(cors());

// Use the auth routes
app.use("/api/users", authRoutes);

app.listen(5000, () => console.log("Server running on http://localhost:5000"));
