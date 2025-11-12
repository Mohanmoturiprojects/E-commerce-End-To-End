// routes/orders.js
import express from "express";
import { Order } from "./models/orders.js";
import { User } from "./models/user.js";
import { Product } from "./models/product.js";

export const ordersRoute = express.Router();

/* =========================================
   🟢 Add one or multiple orders (frontend sends username)
   ========================================= */
ordersRoute.post("/add", async (req, res) => {
  const { username, items } = req.body;

  if (!username || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "Invalid order data" });
  }

  try {
    const user = await User.findOne({ where: { username } });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Create one record per item
    const orders = items.map((item) => ({
      user_id: user.id,
      product_id: item.product_id,
      quantity: item.quantity,
      total_price: item.total_price,
      status: "Pending",
    }));

    await Order.bulkCreate(orders);

    res.json({
      success: true,
      message: "✅ Orders placed successfully",
      count: orders.length,
    });
  } catch (err) {
    console.error("❌ Error creating orders:", err);
    res.status(500).json({ message: "Error creating orders", error: err.message });
  }
});

/* =========================================
   🟢 Fetch all orders for a specific user
   ========================================= */
ordersRoute.get("/user/:username", async (req, res) => {
  try {
    const user = await User.findOne({ where: { username: req.params.username } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const orders = await Order.findAll({
      where: { user_id: user.id },
      include: [
        {
          model: Product,
          attributes: ["id", "name", "price", "catagory", "description"],
        },
        {
          model: User,
          attributes: ["username"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    res.json({
      success: true,
      username: req.params.username,
      orderCount: orders.length,
      orders,
    });
  } catch (err) {
    console.error("❌ Error fetching user orders:", err);
    res.status(500).json({ message: "Error fetching orders", error: err.message });
  }
});

/* =========================================
   🟢 Fetch all orders (for manager/admin)
   ========================================= */
ordersRoute.get("/", async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        { model: User, attributes: ["username"] },
        { model: Product, attributes: ["name", "price", "catagory"] },
      ],
      order: [["created_at", "DESC"]],
    });

    res.json({
      success: true,
      totalOrders: orders.length,
      orders,
    });
  } catch (err) {
    console.error("❌ Error fetching all orders:", err);
    res.status(500).json({ message: "Error fetching all orders", error: err.message });
  }
});

/* =========================================
   🟢 Update order status
   ========================================= */
  ordersRoute.patch("/update-status/:id", async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const { status } = req.body;
    if (!status) return res.status(400).json({ message: "Status is required" });

    order.status = status;
    order.delivered_at = status === "Delivered" ? new Date() : null;
    await order.save();

    res.json({ success: true, message: `✅ Order #${order.id} updated to ${status}` });
  } catch (err) {
    console.error("❌ Error updating order:", err);
    res.status(500).json({ message: "Error updating order", error: err.message });
  }
});
