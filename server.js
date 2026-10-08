const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const foodRoutes = require("./routes/foodRoutes");
const authRoutes = require("./routes/authRoutes");
const orderRoutes = require("./routes/orderRoutes");
const aiRoutes = require("./routes/aiRoutes");

const app = express();

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected successfully!");
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  });

app.use("/api/foods", foodRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);

// ===============================
// CRAVEAI
// ===============================
app.use("/api/ai", aiRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "CRAVINGS Backend is running!",
    ai: "CraveAI is connected",
  });
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`CRAVINGS Backend running on http://localhost:${PORT}`);
});