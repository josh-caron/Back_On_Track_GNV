import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ message: "Email already in use." });

  // Ignore role from client to prevent public registration as admin
  const user = await User.create({ name, email, password });
  res.status(201).json({
    _id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    token: generateToken(user._id),
  });
};

// Admin-only: set a user's role (promote/demote)
export const setUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  if (!["admin", "volunteer"].includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }
  const user = await User.findById(id);
  if (!user) return res.status(404).json({ message: "User not found" });
  user.role = role;
  await user.save();
  res.json({ message: `User role set to ${role}`, user: { _id: user._id, email: user.email, role: user.role } });
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
};

export const getMe = async (req, res) => {
  res.json(req.user);
};

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
