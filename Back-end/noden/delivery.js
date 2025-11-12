// delivery.js
import express from "express";
import { Order } from "./models/orders.js";
import { User } from "./models/user.js";
import { Product } from "./models/product.js";

export const deliveryRoute = express.Router();

// ✅ 1. Get all orders (for delivery staff)
// ✅ 1. Get all orders (for delivery staff)
deliveryRoute.get("/orders", async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        { model: User, attributes: ["firstName", "address", "username"], as: "orderUser" },
        { model: Product, attributes: ["name"], as: "orderProduct" },
      ],
      order: [["created_at", "DESC"]],
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Error fetching orders", error: err.message });
  }
});


// ✅ 2. Update order status to "Shipped"
deliveryRoute.patch("/orders/:id/accept", async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    await order.update({ status: "Shipped" });
    res.json({ message: "✅ Order status updated to Shipped" });
  } catch (err) {
    res.status(500).json({ message: "Error updating order", error: err.message });
  }
});

// ✅ 3. Update order status to "Delivered" and set delivered_at = NOW()
deliveryRoute.patch("/orders/:id/deliver", async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    await order.update({ status: "Delivered", delivered_at: new Date() });
    res.json({ message: "✅ Order marked as Delivered" });
  } catch (err) {
    console.error("❌ Delivery error:", err);
    res.status(500).json({ message: "Error marking delivered", error: err.message });
  }
});
