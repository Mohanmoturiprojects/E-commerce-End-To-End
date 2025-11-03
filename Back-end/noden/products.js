import express from "express";
import mysql from "mysql2";

const router = express.Router();

// ✅ MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Mohan@234",
  database: "logikal",
});

db.connect((err) => {
  if (err) console.error("❌ MySQL connection failed:", err);
  else console.log("✅ Connected to MySQL for products");
});


// ✅ GET all products (with optional search)
router.get("/", (req, res) => {
  const search = req.query.q;
  let sql = search
    ? "SELECT * FROM products WHERE name LIKE ?"
    : "SELECT * FROM products";

  db.query(sql, search ? [`%${search}%`] : [], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});


// ✅ GET single product by ID
router.get("/:id", (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM products WHERE id = ?";

  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    if (results.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(results[0]);
  });
});

export const productsRoute = router;
