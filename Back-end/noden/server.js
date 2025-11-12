import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { productsRoute } from "./products.js";
import { sellerRoute } from "./seller.js";
import { ordersRoute } from "./orders.js";
import { managerRoute } from "./manager.js";
import { deliveryRoute } from "./delivery.js";
import { sequelize } from "./db.js";
import { User } from "./models/user.js";
import { forgotPasswordRoute } from "./forgotPassword.js";
import "./models/associations.js";

dotenv.config();

const app = express();
const PORT = 8081;

// ✅ Middleware   
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// ✅ Connect to MySQL using Sequelize ORM
try {
  await sequelize.authenticate();
  console.log("✅ Connected to MySQL using Sequelize");
  await sequelize.sync();
} catch (error) {
  console.error("❌ Sequelize connection error:", error);
}

// ✅ Routes
app.use("/api/products", productsRoute);
app.use("/api/seller", sellerRoute);
app.use("/api/orders", ordersRoute);
app.use("/api/manager", managerRoute);
app.use("/api/delivery", deliveryRoute);
app.use("/api", forgotPasswordRoute);



// ✅ User Registration
  app.post("/api/register", async (req, res) => {
  try {
    const { firstName, lastName, username, password, mobile, address, gender, role } = req.body;

    if (!firstName || !lastName) {
      return res.status(400).json({ message: "First name and last name are required" });
    }

    const hashed = await bcrypt.hash(password, 10);

    await User.create({
      firstName,
      lastName,
      username,
      password: hashed,
      mobile,
      address,
      gender: gender || "Other",
      role: role || "USER",
    });

    res.json({ message: "Registration successful" });
  } catch (error) {
    console.error("❌ Registration error:", error);
    res.status(500).json({ message: "Error saving user", error: error.message });
  }
});


// ✅ Login Route
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password)
      return res
        .status(400)
        .json({ message: "Username and password are required" });

    const user = await User.findOne({ where: { username } });

    if (!user)
      return res.status(404).json({ message: "User not found" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(401).json({ message: "Invalid password" });

    
    let redirect = "/";
    let dashboardName = "Home";

    switch (user.role?.toLowerCase()) {
      case "seller":
        redirect = "/Sellerdashboard";
        dashboardName = "Seller Dashboard";
        break;
      case "manager":
        redirect = "/Managerdashboard";
        dashboardName = "Manager Dashboard";
        break;
      case "delivery":
        redirect = "/Deliverydashboard";
        dashboardName = "Delivery Dashboard";
        break;
      default:
        redirect = "/home";
        dashboardName = "User Home";
    }

    // 4️⃣ Send response
    return res.json({
      message: "Login successful",
      role: user.role?.toLowerCase(),
      redirect,
      dashboard: dashboardName,
      user: {
        id: user.id,
        username: user.username,
        mobile: user.mobile,
        address: user.address,
        gender: user.gender,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ message: "Login failed", error: error.message });
  }
});


// ✅ Get user profile by email
   app.get("/api/profile/:username", async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({
      where: { username },
      attributes: ["id", "firstName", "lastName", "username", "mobile", "address", "role"],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error("❌ Error fetching profile:", err);
    res.status(500).json({ message: "Server error fetching profile" });
  }
});
   app.put("/api/change-password/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const { oldPassword, newPassword } = req.body;

    const user = await User.findOne({ where: { username } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Old password is incorrect" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.update({ password: hashedPassword }, { where: { username } });

    res.json({ message: "Password updated successfully ✅" });
  } catch (err) {
    console.error("Error updating password:", err);
    res.status(500).json({ message: "Server error while updating password" });
  }
});


// ✅ Start Server
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
