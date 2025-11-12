// products.js
import express from "express";
import { Product } from "./models/product.js";
import { Op } from "sequelize";

export const productsRoute = express.Router();

// ✅ GET all products (optional search)

productsRoute.get("/", async (req, res) => {
  try {
    const search = req.query.q;
    let products;

    if (search) {
      products = await Product.findAll({
        where: {
          [Op.or]: [
            { name: { [Op.like]: `%${search}%` } },
            { catagory: { [Op.like]: `%${search}%` } },
            { description: { [Op.like]: `%${search}%` } },
          ],
        },
      });
    } else {
      products = await Product.findAll();
    }

    res.json(products);
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    res.status(500).json({
      message: "Error fetching products",
      error: error.message,
    });
  }
});


// ✅ GET product by ID (includes JSON options)
productsRoute.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    console.error("❌ Error fetching product:", error);
    res.status(500).json({
      message: "Error fetching product",
      error: error.message,
    });
  }
});
