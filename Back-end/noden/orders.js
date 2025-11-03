import express from "express";
import mysql from "mysql2";

export const ordersRoute = express.Router();

// ✅ MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Mohan@234",
  database: "logikal",
});

/* ----------------------------------------------------------
   🛒 POST /api/orders/add
   Add one or multiple orders (frontend sends username)
---------------------------------------------------------- */
ordersRoute.post("/add", (req, res) => {
  const { username, items } = req.body;

  if (!username || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "Invalid order data" });
  }

  const findUserQuery = "SELECT id FROM usercredentials WHERE username = ?";
  db.query(findUserQuery, [username], (err, result) => {
    if (err) {
      console.error("❌ Error fetching user:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user_id = result[0].id;
    const insertQuery = `
      INSERT INTO orders (user_id, product_id, quantity, total_price)
      VALUES ?
    `;
    const values = items.map((item) => [
      user_id,
      item.product_id,
      item.quantity,
      item.total_price,
    ]);

    db.query(insertQuery, [values], (err2, result2) => {
      if (err2) {
        console.error("❌ Order insert error:", err2);
        return res.status(500).json({ message: "Failed to create order" });
      }

      res.json({
        message: "✅ Order placed successfully",
        orderCount: result2.affectedRows,
      });
    });
  });
});

/* ----------------------------------------------------------
   📦 GET /api/orders/user/:username
   Fetch all orders for a specific user (based on username)
---------------------------------------------------------- */
ordersRoute.get("/user/:username", (req, res) => {
  const { username } = req.params;

  const sql = `
    SELECT 
      o.id AS order_id,
      o.quantity,
      o.total_price,
      o.status,
      o.created_at,
      o.delivered_at,
      p.name AS product_name,
      p.price AS product_price,
      p.description,
      p.catagory,
      u.username
    FROM orders o
    INNER JOIN usercredentials u ON o.user_id = u.id
    INNER JOIN products p ON o.product_id = p.id
    WHERE u.username = ?
    ORDER BY o.created_at DESC
  `;

  db.query(sql, [username], (err, results) => {
    if (err) {
      console.error("❌ Error fetching user orders:", err);
      return res.status(500).json({ message: "Failed to fetch user orders" });
    }

    res.json({
      success: true,
      username,
      orderCount: results.length,
      orders: results,
    });
  });
});

/* ----------------------------------------------------------
   🧾 GET /api/orders
   (Optional) Fetch all orders for admin/manager
---------------------------------------------------------- */
ordersRoute.get("/", (req, res) => {
  const sql = `
    SELECT 
      o.id AS order_id,
      u.username,
      p.name AS product_name,
      o.quantity,
      o.total_price,
      o.status,
      o.created_at,
      o.delivered_at
    FROM orders o
    INNER JOIN usercredentials u ON o.user_id = u.id
    INNER JOIN products p ON o.product_id = p.id
    ORDER BY o.created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Error fetching all orders:", err);
      return res.status(500).json({ message: "Failed to fetch all orders" });
    }

    res.json({
      success: true,
      totalOrders: results.length,
      orders: results,
    });
  });
});

/* ----------------------------------------------------------
   🚚 PUT /api/orders/update-status/:orderId
   Update order status (and set delivered_at timestamp)
---------------------------------------------------------- */
ordersRoute.put("/update-status/:orderId", (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  if (!["Pending", "Shipped", "Delivered"].includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  let sql;
  let params;

  if (status === "Delivered") {
    // ✅ Set delivered_at when status = Delivered
    sql = "UPDATE orders SET status = ?, delivered_at = NOW() WHERE id = ?";
    params = [status, orderId];
  } else {
    sql = "UPDATE orders SET status = ?, delivered_at = NULL WHERE id = ?";
    params = [status, orderId];
  }

  db.query(sql, params, (err, result) => {
    if (err) {
      console.error("❌ Error updating order status:", err);
      return res.status(500).json({ message: "Failed to update order status" });
    }

    res.json({
      success: true,
      message: `✅ Order #${orderId} status updated to ${status}`,
    });
  });
});
