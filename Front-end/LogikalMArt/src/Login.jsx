import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";
import axios from "axios";

function Login({ setUser }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8081/api/login", {
        username,
        password,
      });

      if (res.data.message === "Login successful" || res.data.status === "success") {
        alert("✅ Login successful!");

        // ✅ If logged in as ROLE (SELLER, MANAGER, DELIVERY)
        if (res.data.type === "role") {
          const roleData = {
            role: res.data.role,
            redirect: res.data.redirect,
          };
          localStorage.setItem("role", JSON.stringify(roleData));
          setUser(roleData);
          navigate(res.data.redirect); // Navigate to seller/manager/delivery dashboard
        } 
        // ✅ Otherwise normal user login
        else {
          const userData = { email: username };
          localStorage.setItem("user", JSON.stringify(userData));
          setUser(userData);
          navigate("/home");
        }
      } else {
        alert(res.data.message || "Invalid username or password ❌");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert(error.response?.data?.message || "Login failed ❌");
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2 className="login-title">Login</h2>

        <input
          className="login-input"
          type="text"
          placeholder="Username or Role (e.g., seller, manager)"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <input
          className="login-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button className="login-btn" type="submit">
          Login
        </button>

        <p className="register-text">
          New user? <Link to="/register">Register here</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
