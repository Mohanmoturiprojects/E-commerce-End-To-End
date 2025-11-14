import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";
import axios from "axios";

function Login({ setUser }) {
  const [username, setUsername] = useState(""); // username = email
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:8081/api/login", {
        username,
        password,
      });

      if (res.data.message === "Login successful") {
        const loggedUser = res.data.user;

        // Store user info in localStorage
        localStorage.setItem("user", JSON.stringify(loggedUser));

        // Update app state
        setUser(loggedUser);

        const role = loggedUser?.role?.toLowerCase();
        const messageState = { message: "✅ Login successful!" };

        // Navigate based on role with alert message
        switch (role) {
          case "seller":
            navigate("/sellerdashboard", { state: messageState });
            break;
          case "delivery":
            navigate("/deliverydashboard", { state: messageState });
            break;
          case "manager":
            navigate("/managerdashboard", { state: messageState });
            break;
          default:
            navigate("/home", { state: messageState });
        }
      } else {
        // Alert only on failure
        alert(res.data.message || "Invalid username or password ❌");
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      alert(error.response?.data?.message || "Login failed ❌");
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2 className="login-title">Login</h2>

        <input
          className="login-input"
          type="email"
          placeholder="Enter your email"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <input
          className="login-input"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button className="login-btn" type="submit">
          Login
        </button>

        <div className="login-links">
          <p className="register-text">
            New user? <Link to="/register">Register here</Link>
          </p>
          <p className="forgot-text">
            <Link to="/forgotPassword">Forgot Password?</Link>
          </p>
        </div>
      </form>
    </div>
  );
}

export default Login;
