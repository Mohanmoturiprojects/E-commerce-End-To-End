import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { FiShoppingCart } from "react-icons/fi";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import "./App.css";
import { SetCart, ClearCart } from "./store";

/* Components */
import Home from "./Home";
import Mobiles from "./Mobiles";
import Laptop from "./Laptop";
import SmartTV from "./Smarttv";
import Electronics from "./Electronics";
import Mens from "./Mens";
import Formals from "./Formals";
import Jeanes from "./Jeanes";
import Tracks from "./Tracks";
import Womens from "./Womens";
import Sarees from "./Sarees";
import Kurtas from "./Kurtas";
import Dresses from "./Dresses";
import Kids from "./Kids";
import Cloths from "./Cloths";
import Chocolates from "./Chocolates";
import Toys from "./Toys";
import Footwear from "./Footwear";
import Sportshoes from "./Sportshoes";
import Formalshoes from "./Formalshoes";
import Loafers from "./Loafers";
import HomeFurniture from "./HomeFurniture";
import Kitchens from "./Kitchens";
import TableDinner from "./TableDinner";
import Bedroom from "./Bedroom";
import ProductCard from "./ProductCard";

import Login from "./Login";
import Register from "./Register";
import Cart from "./Cart";
import Orders from "./Orders";
import Sellerdashboard from "./sellerdashboard";
import Managerdashboard from "./Managerdashboard";
import Deliverydashboard from "./Deliverydashboard";
import ProductDetails from "./ProductDetails";

/* Categories */
const categories = [
  { name: "Home" },
  { name: "Electronics", sub: ["Mobiles", "Laptop", "SmartTV"] },
  { name: "Mens", sub: ["Formals", "Jeans", "Tracks"] },
  { name: "Womens", sub: ["Sarees", "Kurtas", "Dresses"] },
  { name: "Kids", sub: ["Clothings", "Chocolates", "Toys"] },
  { name: "Footwear", sub: ["Sportshoes", "FormalShoes", "Loafers"] },
  { name: "HomeFurniture", sub: ["Kitchens", "TableDinner", "Bedroom"] },
  { name: "Orders" },
];

/* Dropdown Component */
const Dropdown = ({ title, items }) => {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="dropdown"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Link to={`/${title.toLowerCase()}`} className="nav-link">
        {title}
      </Link>
      {open && items?.length > 0 && (
        <div className="dropdown-content">
          {items.map((sub, idx) => (
            <Link
              key={idx}
              to={`/${title.toLowerCase()}/${sub.toLowerCase()}`}
              className="dropdown-link"
            >
              {sub}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

const App = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const cartItems = useSelector((state) => state.cart);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // 🟢 Load user or role from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedRole = localStorage.getItem("role");

    if (storedUser) setUser(JSON.parse(storedUser));
    else if (storedRole) setUser(JSON.parse(storedRole));
  }, []);

  // 🟢 Load cart for user
  useEffect(() => {
    if (user && user.email) {
      const emailKey = user.email.toLowerCase().replace(/[^a-z0-9]/g, "_");
      const savedCart =
        JSON.parse(localStorage.getItem(`cart_${emailKey}`)) || [];
      dispatch(SetCart(savedCart));
    } else {
      const guestCart = JSON.parse(localStorage.getItem("cart_guest")) || [];
      dispatch(SetCart(guestCart));
    }
  }, [user, dispatch]);

  // 🟢 Save cart when updated
  useEffect(() => {
    if (user && user.email) {
      const emailKey = user.email.toLowerCase().replace(/[^a-z0-9]/g, "_");
      localStorage.setItem(`cart_${emailKey}`, JSON.stringify(cartItems));
    } else {
      localStorage.setItem("cart_guest", JSON.stringify(cartItems));
    }
  }, [cartItems, user]);

  // 🔍 Search handler
  const handleSearch = async () => {
    if (!searchTerm.trim()) return setSearchResults([]);
    try {
      const res = await axios.get(
        `http://localhost:8081/api/products?q=${searchTerm}`
      );
      setSearchResults(res.data);
      navigate("/search");
    } catch (err) {
      console.error(err);
    }
  };

  // 🚪 Logout
  const handleLogout = () => {
    if (user?.email) {
      const emailKey = user.email.toLowerCase().replace(/[^a-z0-9]/g, "_");
      localStorage.setItem(`cart_${emailKey}`, JSON.stringify(cartItems));
    }
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    setUser(null);
    dispatch(ClearCart());
    navigate("/login");
  };

  return (
    <div className="page-container">
      {/* ===== HEADER ===== */}
      <header className="header">
        <div className="header-top">
          <div className="logo">
            <h2>Logical Mart</h2>
          </div>

          <div className="search-bar">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <button onClick={handleSearch}>Search</button>
          </div>

          <div className="header-actions">
            <Link to="/cart" className="cart-link">
              <FiShoppingCart /> Cart{" "}
              {totalItems > 0 && (
                <span className="cart-count">{totalItems}</span>
              )}
            </Link>

            {!user ? (
              <Link to="/login" className="login-link">
                Login
              </Link>
            ) : (
              <div className="user-avatar-wrapper">
                <div
                  className="user-avatar"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  {user?.email
                    ? user.email.charAt(0).toUpperCase()
                    : user?.role?.charAt(0) || "?"}
                </div>

                {dropdownOpen && (
                  <div className="user-dropdown">
                    <p className="user-email">{user.email || user.role}</p>
                    <button onClick={handleLogout} className="logout-btn">
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

       {!["SELLER", "DELIVERY"].includes(user?.role) && (
  <div className="header-bottom">
    {categories.map((cat) => (
      <Dropdown key={cat.name} title={cat.name} items={cat.sub || []} />
    ))}
  </div>
)}
      </header>

      {/* ===== CONTENT ===== */}
      <main className="content">
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Home />} />

          {/* 🔍 Search Results Page */}
          <Route
            path="/search"
            element={
              <div>
                <h2>Search Results for "{searchTerm}"</h2>
                <div className="products-grid">
                  {searchResults.length > 0 ? (
                    searchResults.map((product) => (
                      <Link
                        key={product.id}
                        to={`/product/${product.id}`} // ✅ Click to view details
                        style={{ textDecoration: "none", color: "inherit" }}
                      >
                        <ProductCard product={product} />
                      </Link>
                    ))
                  ) : (
                    <p>No products found.</p>
                  )}
                </div>
              </div>
            }
          />

          {/* ✅ Product Details Route */}
          <Route path="/product/:id" element={<ProductDetails />} />

          {/* 🔑 Auth Routes */}
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/register" element={<Register />} />

          {/* 🛒 Normal user routes */}
          <Route path="/cart" element={<Cart />} />
          <Route path="/orders" element={<Orders />} />

          {/* 🧭 Category Routes */}
          <Route path="/electronics" element={<Electronics />} />
          <Route path="/electronics/mobiles" element={<Mobiles />} />
          <Route path="/electronics/laptop" element={<Laptop />} />
          <Route path="/electronics/smarttv" element={<SmartTV />} />
          <Route path="/mens" element={<Mens />} />
          <Route path="/mens/formals" element={<Formals />} />
          <Route path="/mens/jeans" element={<Jeanes />} />
          <Route path="/mens/tracks" element={<Tracks />} />
          <Route path="/womens" element={<Womens />} />
          <Route path="/womens/sarees" element={<Sarees />} />
          <Route path="/womens/kurtas" element={<Kurtas />} />
          <Route path="/womens/dresses" element={<Dresses />} />
          <Route path="/kids" element={<Kids />} />
          <Route path="/kids/clothings" element={<Cloths />} />
          <Route path="/kids/chocolates" element={<Chocolates />} />
          <Route path="/kids/toys" element={<Toys />} />
          <Route path="/footwear" element={<Footwear />} />
          <Route path="/footwear/sportshoes" element={<Sportshoes />} />
          <Route path="/footwear/formalshoes" element={<Formalshoes />} />
          <Route path="/footwear/loafers" element={<Loafers />} />
          <Route path="/homefurniture" element={<HomeFurniture />} />
          <Route path="/homefurniture/kitchens" element={<Kitchens />} />
          <Route path="/homefurniture/tabledinner" element={<TableDinner />} />
          <Route path="/homefurniture/bedroom" element={<Bedroom />} />

          {/* 🧑‍💼 Role-based routes */}
          <Route
            path="/sellerdashboard"
            element={
              user?.role === "SELLER" ? (
                <Sellerdashboard />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/managerdashboard"
            element={
              user?.role === "MANAGER" ? (
                <Managerdashboard />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/deliverydashboard"
            element={
              user?.role === "DELIVERY" ? (
                <Deliverydashboard />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
        </Routes>
      </main>
    </div>
  );
};

export default function WrappedApp() {
  return (
    <Router>
      <App />
    </Router>
  );
}
