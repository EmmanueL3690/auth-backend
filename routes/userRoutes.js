import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { usersDB } from "../usersDB"; // adjust path

const router = express.Router();
const SECRET = "SUPER_SECRET_KEY_CHANGE_THIS";

// User signup
router.post("/signup", async (req, res) => {
  const { fullname, email, password } = req.body;

  if (!fullname || !email || !password)
    return res.status(400).json({ error: "All fields are required." });

  const existingUser = usersDB.find((u) => u.email === email);
  if (existingUser)
    return res.status(400).json({ error: "Email already in use." });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { email, fullname, password: hashedPassword, role: "user" };
    usersDB.push(newUser);

    const token = jwt.sign(
      { email: newUser.email, role: newUser.role },
      SECRET,
      { expiresIn: "2h" }
    );

    res.status(201).json({ user: { fullname, email, role: "user" }, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Forgot password
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const user = usersDB.find((u) => u.email === email);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Simulate reset link
    return res.json({ message: `Reset link sent to ${email}` });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error, try again later" });
  }
});

export default router;
