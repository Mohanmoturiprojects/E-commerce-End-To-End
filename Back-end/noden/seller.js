// seller.js
import express from "express";
import { Product } from "./models/product.js";

export const sellerRoute = express.Router();

// ✅ Create (Insert product)
sellerRoute.post("/", async (req, res) => {
  try {
    const { name, catagory, price, description, availability } = req.body;
    if (!name || !catagory || !price) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const product = await Product.create({
      name,
      catagory,
      price,
      description: description || "",
      availability: availability ?? true,
    });

    res.json({ message: "✅ Product added successfully", product });
  } catch (err) {
    res.status(500).json({ message: "Failed to add product", error: err.message });
  }
});

// ✅ Read (Get all products)
sellerRoute.get("/", async (req, res) => {
  try {
    const products = await Product.findAll();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch products", error: err.message });
  }
});

// ✅ Update 
sellerRoute.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, catagory, price, description, availability } = req.body;
    const product = await Product.findByPk(id);

    if (!product) return res.status(404).json({ message: "Product not found" });

    await product.update({ name, catagory, price, description, availability });
    res.json({ message: "✅ Product updated successfully", product });
  } catch (err) {
    res.status(500).json({ message: "Update failed", error: err.message });
  }
});

// ✅ Patch (Partial update)
sellerRoute.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { price, availability } = req.body;
    const product = await Product.findByPk(id);

    if (!product) return res.status(404).json({ message: "Product not found" });

    await product.update({
      ...(price !== undefined && { price }),
      ...(availability !== undefined && { availability }),
    });

    res.json({ message: "✅ Product updated partially", product });
  } catch (err) {
    res.status(500).json({ message: "Patch failed", error: err.message });
  }
});

// ✅ Delete
sellerRoute.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Product.destroy({ where: { id } });

    if (!deleted) return res.status(404).json({ message: "Product not found" });

    res.json({ message: "✅ Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed", error: err.message });
  }
});
