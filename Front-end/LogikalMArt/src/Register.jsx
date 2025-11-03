import React, { useState } from "react";
import axios from "axios";
import "./Register.css";

function Register() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    mobile: "",
    address: "",
    gender:"",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8081/api/register", formData);
      alert("Registration successful!");
      window.location.href = "/login";
    } catch (error) {
      alert("Error registering user!");
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2 className="register-title">Create Your Account</h2>
        <form onSubmit={handleSubmit} className="register-form">
          <input
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <input
            name="mobile"
            placeholder="Mobile Number"
            value={formData.mobile}
            onChange={handleChange}
          />
             <input
            name="gender"
            placeholder="Gender"
            value={formData.gender}
            onChange={handleChange}
          />
          <input
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleChange}
          />
          <button type="submit" className="register-btn">
            Register
          </button>
        </form>
      </div>
    </div>
  );
}

export default Register;
