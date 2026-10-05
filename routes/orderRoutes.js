const express = require("express");
const Order = require("../models/Order");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();


// ===============================
// USER — PLACE ORDER
// ===============================
router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      items,
      totalAmount,
      deliveryAddress,
      paymentMethod,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        message: "Order must contain at least one item",
      });
    }

    if (!deliveryAddress) {
      return res.status(400).json({
        message: "Delivery address is required",
      });
    }

    const order = new Order({
      user: req.user.userId,
      items,
      totalAmount,
      deliveryAddress,
      paymentMethod,
    });

    const savedOrder = await order.save();

    res.status(201).json({
      message: "Order placed successfully",
      order: savedOrder,
    });

  } catch (error) {
    res.status(400).json({
      message: "Failed to place order",
      error: error.message,
    });
  }
});


// ===============================
// USER — MY ORDERS
// ===============================
router.get("/my-orders", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user.userId,
    })
      .populate("user", "name email phone")
      .sort({ createdAt: -1 });

    res.json(orders);

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
});


// ===============================
// ADMIN — ALL ORDERS
// ===============================
router.get("/admin/all", authMiddleware, async (req, res) => {
  try {

    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Admin access required",
      });
    }

    const orders = await Order.find()
      .populate("user", "name email phone")
      .sort({ createdAt: -1 });

    res.json(orders);

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch admin orders",
      error: error.message,
    });
  }
});


// ===============================
// ADMIN — UPDATE ORDER STATUS
// ===============================
router.put(
  "/admin/:id/status",
  authMiddleware,
  async (req, res) => {
    try {

      if (req.user.role !== "admin") {
        return res.status(403).json({
          message: "Admin access required",
        });
      }

      const { orderStatus } = req.body;

      const allowedStatuses = [
        "Placed",
        "Confirmed",
        "Preparing",
        "Out for Delivery",
        "Delivered",
        "Cancelled",
      ];

      if (!allowedStatuses.includes(orderStatus)) {
        return res.status(400).json({
          message: "Invalid order status",
        });
      }

      const order = await Order.findById(req.params.id);

      if (!order) {
        return res.status(404).json({
          message: "Order not found",
        });
      }

      order.orderStatus = orderStatus;

      const updatedOrder = await order.save();

      res.json({
        message: "Order status updated successfully",
        order: updatedOrder,
      });

    } catch (error) {
      res.status(500).json({
        message: "Failed to update order status",
        error: error.message,
      });
    }
  }
);


// ===============================
// USER — GET SINGLE ORDER
// ===============================
router.get("/:id", authMiddleware, async (req, res) => {
  try {

    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.userId,
    })
      .populate("user", "name email phone");

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.json(order);

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch order",
      error: error.message,
    });
  }
});


// ===============================
// USER — CANCEL OWN ORDER
// ===============================
router.put("/:id/cancel", authMiddleware, async (req, res) => {
  try {

    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.userId,
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (order.orderStatus === "Delivered") {
      return res.status(400).json({
        message: "Delivered orders cannot be cancelled",
      });
    }

    if (order.orderStatus === "Cancelled") {
      return res.status(400).json({
        message: "Order is already cancelled",
      });
    }

    order.orderStatus = "Cancelled";

    const updatedOrder = await order.save();

    res.json({
      message: "Order cancelled successfully",
      order: updatedOrder,
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to cancel order",
      error: error.message,
    });
  }
});


module.exports = router;