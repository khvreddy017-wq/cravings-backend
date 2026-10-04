const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

const makeToken = (user) => jwt.sign(
  { userId: user._id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: "7d" }
);

const publicUser = (u) => ({
  id: u._id,
  name: u.name,
  email: u.email,
  phone: u.phone,
  address: u.address,
  addresses: u.addresses || [],
  role: u.role
});

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "Name, email and password are required" });

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) return res.status(409).json({ message: "User already exists with this email" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone: phone || "",
      address: address || "",
      addresses: address ? [address] : []
    });

    const token = makeToken(user);
    res.status(201).json({ message: "Registration successful", token, user: publicUser(user) });
  } catch (error) {
    res.status(500).json({ message: "Registration failed", error: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password are required" });

    const adminEmail = (process.env.ADMIN_EMAIL || "admin@cravings.in").toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

    if (email.toLowerCase() === adminEmail && password === adminPassword) {
      const admin = { _id: "000000000000000000000001", name: "CRAVINGS Admin", email: adminEmail, phone: "", address: "", addresses: [], role: "admin" };
      return res.json({ message: "Login successful", token: makeToken(admin), user: publicUser(admin) });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ message: "Invalid email or password" });

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) return res.status(401).json({ message: "Invalid email or password" });

    res.json({ message: "Login successful", token: makeToken(user), user: publicUser(user) });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
});

router.get("/me", authMiddleware, async (req, res) => {
  try {
    if (req.user.role === "admin") return res.json({ user: { name: "CRAVINGS Admin", email: process.env.ADMIN_EMAIL || "admin@cravings.in", role: "admin" } });
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user: publicUser(user) });
  } catch (error) { res.status(500).json({ message: "Failed to load profile" }); }
});

router.put("/me", authMiddleware, async (req, res) => {
  try {
    if (req.user.role === "admin") return res.status(403).json({ message: "Admin profile is managed separately" });
    const { name, phone, address, addresses } = req.body;
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;
    if (Array.isArray(addresses)) user.addresses = addresses.filter(Boolean).slice(0, 10);
    await user.save();
    res.json({ message: "Profile updated", user: publicUser(user) });
  } catch (error) { res.status(400).json({ message: "Profile update failed", error: error.message }); }
});

module.exports = router;
