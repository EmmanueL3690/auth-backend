import mongoose from "mongoose";

const uri = "mongodb+srv://myUser:MyPassword903@cluster0.ecim46n.mongodb.net/?retryWrites=true&w=majority";

mongoose
  .connect(uri)
  .then(() => console.log("✅ MongoDB connected!"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));
