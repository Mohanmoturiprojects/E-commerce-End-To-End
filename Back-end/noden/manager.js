// manager.js
import express from "express";
import { Product } from "./models/product.js";
import { Order } from "./models/orders.js";
import { User } from "./models/user.js";
import { Role } from "./models/roles.js";
import bcrypt from "bcryptjs";

export const managerRoute = express.Router();


   // Get all products

managerRoute.get("/products", async (req, res) => {
  try {
    const products = await Product.findAll();
    res.json(products);
  } catch (err) {
    console.error("❌ Error fetching products:", err);
    res.status(500).json({ message: "Error fetching products", error: err.message });
  }
});


   // Get all users

managerRoute.get("/users", async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "username", "mobile", "address", "gender", "role"],
    });
    res.json(users);
  } catch (err) {
    console.error("❌ Error fetching users:", err);
    res.status(500).json({ message: "Error fetching users", error: err.message });
  }
});


   // Delete user by ID (handles foreign key safely)

managerRoute.delete("/users/:id", async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await Order.destroy({ where: { user_id: user.id } });
    await user.destroy();

    res.json({ message: "✅ User and related orders deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting user:", err);
    res.status(500).json({ message: "Error deleting user", error: err.message });
  }
});


   // Get all orders (joined with user + product info)

managerRoute.get("/orders", async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        { model: User, attributes: ["username"] },
        { model: Product, attributes: ["name"] },
      ],
      order: [["created_at", "DESC"]],
    });
    res.json(orders);
  } catch (err) {
    console.error("❌ Error fetching orders:", err);
    res.status(500).json({ message: "Error fetching orders", error: err.message });
  }
});


   // Add new product

managerRoute.post("/products", async (req, res) => {
  try {
    const { name, catagory, price, description, availability } = req.body;
    if (!name || !catagory || !price)
      return res.status(400).json({ message: "Missing required fields" });

    const product = await Product.create({
      name,
      catagory,
      price,
      description,
      availability: availability ?? true,
    });

    res.json({ message: "✅ Product added successfully", product });
  } catch (err) {
    console.error("❌ Error adding product:", err);
    res.status(500).json({ message: "Error adding product", error: err.message });
  }
});


   // Update product by ID

managerRoute.put("/products/:id", async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    await product.update(req.body);
    res.json({ message: "✅ Product updated successfully", product });
  } catch (err) {
    console.error("❌ Error updating product:", err);
    res.status(500).json({ message: "Error updating product", error: err.message });
  }
});

   // Delete product by ID

managerRoute.delete("/products/:id", async (req, res) => {
  try {
    const deleted = await Product.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ message: "Product not found" });

    res.json({ message: "✅ Product deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting product:", err);
    res.status(500).json({ message: "Error deleting product", error: err.message });
  }
});

   // Update order (PATCH or PUT)

managerRoute.patch("/orders/:id", async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    await order.update(req.body);
    res.json({ message: "✅ Order updated successfully", order });
  } catch (err) {
    console.error("❌ Error updating order:", err);
    res.status(500).json({ message: "Error updating order", error: err.message });
  }
});

managerRoute.put("/orders/:id", async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    await order.update(req.body);
    res.json({ message: "✅ Order updated successfully (PUT)", order });
  } catch (err) {
    console.error("❌ Error updating order:", err);
    res.status(500).json({ message: "Error updating order", error: err.message });
  }
});


   // Update user role by Admin/Manager

 managerRoute.put("/users/:id/role", async (req, res) => {
  const { id } = req.params;
  const { newRole } = req.body;

  if (!newRole) {
    return res.status(400).json({ message: "newRole is required in request body" });
  }

  console.log("🟦 Incoming Role Update → ID:", id, " New Role:", newRole);

  try {
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.role = newRole.toUpperCase();
    await user.save();

    const existingRole = await Role.findOne({
      where: { role_name: newRole.toUpperCase() },
    });

    if (!existingRole) {
      await Role.create({
        role_name: newRole.toUpperCase(),
        password: user.password,
      });
    }

    res.json({
      message: `✅ Role updated successfully to ${newRole} for user ${user.username}`,
    });
  } catch (err) {
    console.error("❌ Error updating user role:", err);
    res.status(500).json({ message: "Error updating user role", error: err.message });
  }
});
