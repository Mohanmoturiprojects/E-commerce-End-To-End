// server.js
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import mysql from "mysql2";
import dotenv from "dotenv";
import { productsRoute } from "./products.js";
import { sendOTP } from "./sms.js";
import { sellerRoute } from "./seller.js";
import { ordersRoute } from "./orders.js";
import { managerRoute } from "./manager.js";
import { deliveryRoute } from "./delivery.js"; 

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

// ✅ MySQL Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Mohan@234",
  database: "logikal",
});

db.connect((err) => {
  if (err) console.error("❌ MySQL connection error:", err);
  else console.log("✅ Connected to MySQL");
});

// ✅ Routes
app.use("/api/products", productsRoute);
app.use("/api/seller", sellerRoute);
app.use("/api/orders", ordersRoute);
app.use("/api/manager", managerRoute);
app.use("/api/delivery", deliveryRoute); // ✅ FIXED — this must be outside the OTP route!

// ✅ Send OTP route
app.post("/api/send-otp", async (req, res) => {
  const { mobile } = req.body;

  if (!mobile)
    return res
      .status(400)
      .json({ success: false, message: "Mobile number required" });

  const otp = Math.floor(100000 + Math.random() * 900000);

  try {
    const response = await sendOTP(mobile, otp);
    res.json({ success: true, message: "OTP sent successfully", otp, response });
  } catch (error) {
    console.error("❌ Error sending OTP:", error);
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
});

// ✅ User Registration
app.post("/api/register", async (req, res) => {
  const { username, password, mobile, address, gender } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    const sql = `
      INSERT INTO usercredentials (username, password, mobile, address, gender)
      VALUES (?, ?, ?, ?, ?)
    `;
    db.query(sql, [username, hashed, mobile, address, gender || "Other"], (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Error saving user" });
      }
      res.json({ message: "Registration successful" });
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Registration error" });
  }
});

// ✅ Login: Checks both usercredentials and roles
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ message: "Username and password required" });

  // 1️⃣ Check usercredentials table
  const userSql = "SELECT * FROM usercredentials WHERE username = ?";
  db.query(userSql, [username], async (err, userResults) => {
    if (err) {
      console.error("DB error (user lookup):", err);
      return res.status(500).json({ message: "DB error" });
    }

    if (userResults.length > 0) {
      const user = userResults[0];
      try {
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({ message: "Invalid password" });
        return res.json({ message: "Login successful", user });
      } catch (e) {
        console.error("bcrypt error:", e);
        return res.status(500).json({ message: "Auth error" });
      }
    }

    // 2️⃣ Not a normal user → check roles
    const roleName = username.toUpperCase();
    const roleSql = "SELECT * FROM roles WHERE role_name = ?";
    db.query(roleSql, [roleName], async (err2, roleResults) => {
      if (err2) {
        console.error("DB error (role lookup):", err2);
        return res.status(500).json({ message: "DB error" });
      }

      if (!roleResults.length)
        return res.status(404).json({ message: "User or Role not found" });

      const role = roleResults[0];
      try {
        let passwordMatches = false;
        if (role.password.startsWith("$2")) {
          passwordMatches = await bcrypt.compare(password, role.password);
        } else {
          passwordMatches = password === role.password;
        }

        if (!passwordMatches)
          return res.status(401).json({ message: "Invalid password" });

        // ✅ Successful role login
        let redirect = "/";
        if (role.role_name === "SELLER") redirect = "/Sellerdashboard";
        else if (role.role_name === "MANAGER") redirect = "/Managerdashboard";
        else if (role.role_name === "DELIVERY") redirect = "/Deliverydashboard";

        return res.json({
          message: "Login successful",
          type: "role",
          role: role.role_name,
          redirect,
        });
      } catch (e) {
        console.error("Auth error (role):", e);
        return res.status(500).json({ message: "Auth error" });
      }
    });
  });
});

// ✅ Start Server
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
