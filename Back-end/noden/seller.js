// seller.js
import express from "express";
import mysql from "mysql2";

export const sellerRoute = express.Router();

// ✅ MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Mohan@234",
  database: "logikal",
});

// ✅ Create (Insert product)
sellerRoute.post("/", (req, res) => {
  const { name, catagory, price, description, availability } = req.body;

  // Validation check
  if (!name || !catagory || !price) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  // ✅ Insert query (simple clean version)
  const sql = `INSERT INTO products (name, catagory, price, description, availability) VALUES (?, ?, ?, ?, ?)`;

  db.query(
    sql,
    [name, catagory, price, description || "", availability || 1],
    (err, result) => {
      if (err) {
        console.error("❌ Insert Error:", err);
        return res
          .status(500)
          .json({ message: "Failed to add product", error: err.message });
      }
      res.json({
        message: "✅ Product added successfully",
        productId: result.insertId,
      });
    }
  );
});

// ✅ Read (Get all products)
sellerRoute.get("/", (req, res) => {
  const sql = "SELECT * FROM products";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Fetch Error:", err);
      return res
        .status(500)
        .json({ message: "Failed to fetch products", error: err.message });
    }
    res.json(results);
  });
});

// ✅ Update (Full update)
sellerRoute.put("/:id", (req, res) => {
  const { id } = req.params;
  const { name, catagory, price, description, availability } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Product ID is required" });
  }

  const sql = `
    UPDATE products
    SET name = ?, catagory = ?, price = ?, description = ?, availability = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [name, catagory, price, description, availability, id],
    (err, result) => {
      if (err) {
        console.error("❌ Update Error:", err);
        return res
          .status(500)
          .json({ message: "Failed to update product", error: err.message });
      }
      res.json({ message: "✅ Product updated successfully" });
    }
  );
});

// ✅ Patch (Partial update: change price or availability)
sellerRoute.patch("/:id", (req, res) => {
  const { id } = req.params;
  const { price, availability } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Product ID is required" });
  }

  const updates = [];
  const values = [];

  if (price !== undefined) {
    updates.push("price = ?");
    values.push(price);
  }
  if (availability !== undefined) {
    updates.push("availability = ?");
    values.push(availability);
  }

  if (updates.length === 0) {
    return res.status(400).json({ message: "No fields to update" });
  }

  const sql = `UPDATE products SET ${updates.join(", ")} WHERE id = ?`;
  values.push(id);

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("❌ Patch Error:", err);
      return res
        .status(500)
        .json({ message: "Failed to update product partially", error: err.message });
    }
    res.json({ message: "✅ Product updated partially" });
  });
});

// ✅ Delete product
sellerRoute.delete("/:id", (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "Product ID is required" });
  }

  const sql = "DELETE FROM products WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("❌ Delete Error:", err);
      return res
        .status(500)
        .json({ message: "Failed to delete product", error: err.message });
    }
    res.json({ message: "✅ Product deleted successfully" });
  });
});
