import User from "../models/User.js";
import { signJWT } from "../utils/jwt.js";

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, college, year } = req.body;

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "User already exists" });

    const user = new User({ name, email, password, college, year });
    await user.save();

    const secret = process.env.JWT_SECRET;
    if (!secret) return res.status(500).json({ message: "Server misconfiguration" });
    const token = signJWT({ sub: user._id.toString() }, secret);

    res.status(201).json({ message: "User registered successfully", token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const ok = await user.comparePassword(password);
    if (!ok) return res.status(400).json({ message: "Invalid credentials" });

    const secret = process.env.JWT_SECRET;
    if (!secret) return res.status(500).json({ message: "Server misconfiguration" });
    const token = signJWT({ sub: user._id.toString() }, secret);

    res.json({ message: "Login successful", token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getMe = async (req, res) => {
  try {
    // req.user is set by authRequired middleware
    res.json({ user: req.user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
