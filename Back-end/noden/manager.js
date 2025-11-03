import express from "express";
import mysql from "mysql2";

export const managerRoute = express.Router();

// ✅ Database connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Mohan@234",
  database: "logikal",
});

// ✅ 1. Get all products
managerRoute.get("/products", (req, res) => {
  const sql = "SELECT * FROM products";
  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json({
        message: "Error fetching products",
        error: err.message,
      });
    }
    res.json(result);
  });
});

// ✅ 2. Get all sellers
managerRoute.get("/sellers", (req, res) => {
  const sql = "SELECT id, role_name FROM roles WHERE role_name = 'SELLER'";
  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json({
        message: "Error fetching sellers",
        error: err.message,
      });
    }
    res.json(result);
  });
});

// ✅ 3. Get all users
managerRoute.get("/users", (req, res) => {
  const sql = "SELECT id, username, mobile, address, gender FROM usercredentials";
  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json({
        message: "Error fetching users",
        error: err.message,
      });
    }
    res.json(result);
  });
});

// ✅ 4. Get all orders
managerRoute.get("/orders", (req, res) => {
  const sql = `
    SELECT 
      o.id, 
      u.username AS customer, 
      p.name AS product, 
      o.quantity, 
      o.total_price, 
      o.status, 
      o.created_at,
      o.delivered_at
    FROM orders o
    JOIN usercredentials u ON o.user_id = u.id
    JOIN products p ON o.product_id = p.id
    ORDER BY o.created_at DESC
  `;
  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json({
        message: "Error fetching orders",
        error: err.message,
      });
    }
    res.json(result);
  });
});

// ✅ 5. Add a new product
managerRoute.post("/products", (req, res) => {
  const { name, catagory, price, description, availability } = req.body;

  if (!name || !catagory || !price) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const sql = `
    INSERT INTO products (name, catagory, price, description, availability) 
    VALUES (?, ?, ?, ?, ?)
  `;
  db.query(sql, [name, catagory, price, description, availability], (err) => {
    if (err) {
      return res.status(500).json({
        message: "Error adding product",
        error: err.message,
      });
    }
    res.json({ message: "✅ Product added successfully" });
  });
});

// ✅ 6. Update product
managerRoute.put("/products/:id", (req, res) => {
  const { id } = req.params;
  const { name, catagory, price, description, availability } = req.body;

  const sql = `
    UPDATE products 
    SET name=?, catagory=?, price=?, description=?, availability=? 
    WHERE id=?
  `;
  db.query(sql, [name, catagory, price, description, availability, id], (err) => {
    if (err) {
      return res.status(500).json({
        message: "Error updating product",
        error: err.message,
      });
    }
    res.json({ message: "✅ Product updated successfully" });
  });
});

// ✅ 7. Delete product
managerRoute.delete("/products/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM products WHERE id=?";
  db.query(sql, [id], (err) => {
    if (err) {
      return res.status(500).json({
        message: "Error deleting product",
        error: err.message,
      });
    }
    res.json({ message: "✅ Product deleted successfully" });
  });
});

// ✅ 8. PATCH - Update order (status / quantity / total_price)
managerRoute.patch("/orders/:id", (req, res) => {
  const { id } = req.params;
  const { status, quantity, total_price } = req.body;

  const sql = `
    UPDATE orders 
    SET 
      status = COALESCE(?, status),
      quantity = COALESCE(?, quantity),
      total_price = COALESCE(?, total_price)
    WHERE id = ?
  `;
  db.query(sql, [status, quantity, total_price, id], (err) => {
    if (err) {
      return res.status(500).json({
        message: "Error updating order",
        error: err.message,
      });
    }
    res.json({ message: "✅ Order updated successfully" });
  });
});

// ✅ 9. PUT - Update order (status / quantity / total_price / delivered_at)
managerRoute.put("/orders/:id", (req, res) => {
  const { id } = req.params;
  const { status, quantity, total_price } = req.body;

  // Automatically set delivered_at when status = 'Delivered'
  const sql = `
    UPDATE orders 
    SET 
      status = COALESCE(?, status),
      quantity = COALESCE(?, quantity),
      total_price = COALESCE(?, total_price),
      delivered_at = CASE 
        WHEN ? = 'Delivered' THEN CURRENT_TIMESTAMP 
        ELSE delivered_at 
      END
    WHERE id = ?
  `;

  db.query(sql, [status, quantity, total_price, status, id], (err, result) => {
    if (err) {
      console.error("❌ SQL Error:", err);
      return res.status(500).json({
        message: "Error updating order",
        error: err.message,
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ message: "✅ Order updated successfully" });
  });
});

// ✅ 10. DELETE - Remove user
managerRoute.delete("/users/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM usercredentials WHERE id=?";
  db.query(sql, [id], (err) => {
    if (err) {
      return res.status(500).json({
        message: "Error deleting user",
        error: err.message,
      });
    }
    res.json({ message: "✅ User deleted successfully" });
  });
});

export default managerRoute;
