const express = require("express");
const Order = require("../models/Order");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { items, totalAmount, deliveryAddress, paymentMethod } = req.body;
    if (!items || items.length === 0) return res.status(400).json({ message: "Order must contain at least one item" });
    if (!deliveryAddress) return res.status(400).json({ message: "Delivery address is required" });
    const order = new Order({ user:req.user.userId, items, totalAmount, deliveryAddress, paymentMethod });
    const savedOrder = await order.save();
    res.status(201).json({ message:"Order placed successfully", order:savedOrder });
  } catch (error) { res.status(400).json({ message:"Failed to place order", error:error.message }); }
});

router.get("/my-orders", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ user:req.user.userId }).populate("user", "name email phone").sort({ createdAt:-1 });
    res.json(orders);
  } catch (error) { res.status(500).json({ message:"Failed to fetch orders", error:error.message }); }
});

router.get("/admin/all", authMiddleware, adminMiddleware, async (req,res)=>{
  try {
    const orders = await Order.find().populate("user","name email phone").sort({createdAt:-1});
    res.json(orders);
  } catch(error){ res.status(500).json({message:"Failed to fetch all orders",error:error.message}); }
});

router.put("/admin/:id/status", authMiddleware, adminMiddleware, async (req,res)=>{
  try {
    const allowed = ["Placed","Confirmed","Preparing","Out for Delivery","Delivered","Cancelled"];
    if (!allowed.includes(req.body.orderStatus)) return res.status(400).json({message:"Invalid order status"});
    const order = await Order.findByIdAndUpdate(req.params.id,{orderStatus:req.body.orderStatus},{new:true,runValidators:true}).populate("user","name email phone");
    if(!order) return res.status(404).json({message:"Order not found"});
    res.json({message:"Order status updated",order});
  } catch(error){ res.status(500).json({message:"Failed to update order status",error:error.message}); }
});

router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const order = await Order.findOne({ _id:req.params.id, user:req.user.userId }).populate("user", "name email phone");
    if (!order) return res.status(404).json({ message:"Order not found" });
    res.json(order);
  } catch (error) { res.status(500).json({ message:"Failed to fetch order", error:error.message }); }
});

router.put("/:id/cancel", authMiddleware, async (req, res) => {
  try {
    const order = await Order.findOne({ _id:req.params.id, user:req.user.userId });
    if (!order) return res.status(404).json({ message:"Order not found" });
    if (["Delivered","Cancelled","Out for Delivery"].includes(order.orderStatus)) return res.status(400).json({ message:"This order can no longer be cancelled" });
    order.orderStatus = "Cancelled";
    const updatedOrder = await order.save();
    res.json({ message:"Order cancelled successfully", order:updatedOrder });
  } catch (error) { res.status(500).json({ message:"Failed to cancel order", error:error.message }); }
});

module.exports = router;
