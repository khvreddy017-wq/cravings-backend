const express = require("express");
const Order = require("../models/Order");
const Food = require("../models/Food");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();
router.use(adminMiddleware);

router.get("/orders", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).limit(500);
    res.json(orders);
  } catch (error) { res.status(500).json({ message: "Failed to fetch all orders", error: error.message }); }
});

router.put("/orders/:id/status", async (req, res) => {
  try {
    const allowed = ["Placed", "Confirmed", "Preparing", "Out for Delivery", "Delivered", "Cancelled"];
    if (!allowed.includes(req.body.orderStatus)) return res.status(400).json({ message: "Invalid order status" });
    const order = await Order.findByIdAndUpdate(req.params.id, { orderStatus: req.body.orderStatus }, { new: true, runValidators: true });
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json({ message: "Order status updated", order });
  } catch (error) { res.status(400).json({ message: "Failed to update order", error: error.message }); }
});

router.get("/foods", async (req, res) => {
  try { res.json(await Food.find().sort({ createdAt: -1 })); }
  catch (error) { res.status(500).json({ message: "Failed to fetch foods", error: error.message }); }
});

router.post("/foods", async (req, res) => {
  try { res.status(201).json(await Food.create(req.body)); }
  catch (error) { res.status(400).json({ message: "Failed to create food", error: error.message }); }
});

router.put("/foods/:id", async (req, res) => {
  try {
    const food = await Food.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!food) return res.status(404).json({ message: "Food not found" });
    res.json(food);
  } catch (error) { res.status(400).json({ message: "Failed to update food", error: error.message }); }
});

router.delete("/foods/:id", async (req, res) => {
  try {
    const food = await Food.findByIdAndDelete(req.params.id);
    if (!food) return res.status(404).json({ message: "Food not found" });
    res.json({ message: "Food deleted" });
  } catch (error) { res.status(500).json({ message: "Failed to delete food", error: error.message }); }
});

module.exports = router;
