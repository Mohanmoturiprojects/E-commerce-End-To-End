// delivery.js
import express from "express";
import mysql from "mysql2";

export const deliveryRoute = express.Router();

// ✅ Database Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Mohan@234",
  database: "logikal",
});

// ✅ 1. Get all orders (for delivery staff)
deliveryRoute.get("/orders", (req, res) => {
  const sql = `
    SELECT 
      o.id, 
      u.username AS customer, 
      p.name AS product, 
      o.quantity, 
      o.total_price, 
      o.status, 
      o.created_at,
      o.delivered_at   -- ✅ Include delivery date
    FROM orders o
    JOIN usercredentials u ON o.user_id = u.id
    JOIN products p ON o.product_id = p.id
    ORDER BY o.created_at DESC
  `;
  db.query(sql, (err, result) => {
    if (err)
      return res.status(500).json({
        message: "Error fetching orders",
        error: err.message,
      });
    res.json(result);
  });
});

// ✅ 2. Update order status to "Shipped" when delivery accepts
deliveryRoute.patch("/orders/:id/accept", (req, res) => {
  const { id } = req.params;
  const sql = "UPDATE orders SET status = 'Shipped' WHERE id = ?";
  db.query(sql, [id], (err) => {
    if (err)
      return res
        .status(500)
        .json({ message: "Error updating to shipped", error: err.message });
    res.json({ message: "✅ Order status updated to Shipped" });
  });
});

// ✅ 3. Update order status to "Delivered" and auto set delivered_at = NOW()
deliveryRoute.patch("/orders/:id/deliver", (req, res) => {
  const { id } = req.params;
  const { pin } = req.body;

  // Security: simple PIN check
  if (pin !== "LOGIKAL") {
    return res.status(403).json({ message: "❌ Invalid PIN" });
  }

  // ✅ Automatically set delivered_at to current timestamp
  const sql = `
    UPDATE orders 
    SET status = 'Delivered', delivered_at = NOW() 
    WHERE id = ?
  `;
  db.query(sql, [id], (err) => {
    if (err)
      return res.status(500).json({
        message: "Error updating to delivered",
        error: err.message,
      });
    res.json({ message: "✅ Order status updated to Delivered and delivery date saved" });
  });
});

export default deliveryRoute;
