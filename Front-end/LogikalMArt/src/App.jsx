import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate, useLocation,} from "react-router-dom";
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
import ProductDetails from "./ProductDetails";
import Login from "./Login";
import Register from "./Register";
import Cart from "./Cart";
import Orders from "./Orders";
import Sellerdashboard from "./sellerdashboard";
import Managerdashboard from "./Managerdashboard";
import Deliverydashboard from "./Deliverydashboard";
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";
import Profile from "./Profile";
import SearchResults from "./SearchResults";


const categories = [
  { name: "Home" },
  { name: "Electronics", sub: ["Mobiles", "Laptop", "SmartTV"] },
  { name: "Mens", sub: ["Formals", "Jeans", "Tracks"] },
  { name: "Womens", sub: ["Sarees", "Kurtas", "Dresses"] },
  { name: "Kids", sub: ["Clothings", "Chocolates", "Toys"] },
  { name: "Footwear", sub: ["Sportshoes", "FormalShoes", "Loafers"] },
  { name: "HomeFurniture", sub: ["Kitchens", "TableDinner", "Bedroom"] },
];

const Dropdown = ({ title, items, active }) => {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={`dropdown ${active ? "active-dropdown" : ""}`}
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
  const location = useLocation();
  const dropdownRef = useRef(null);

  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const cartItems = useSelector((state) => state.cart);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // ✅ Restore user session
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);

      const role = parsedUser.role?.toLowerCase();
      if (
        ["/", "/login", "/register", "/forgotPassword", "/reset-password"].includes(
          window.location.pathname
        )
      ) {
        if (role === "seller") navigate("/sellerdashboard");
        else if (role === "manager") navigate("/managerdashboard");
        else if (role === "delivery") navigate("/deliverydashboard");
        else navigate("/home");
      }
    } else {
      const publicRoutes = [
        "/login",
        "/register",
        "/forgotPassword",
        "/reset-password",
        "/home",
      ];
      if (!publicRoutes.some((p) => window.location.pathname.startsWith(p))) {
        navigate("/login");
      }
    }
  }, [navigate]);

  // ✅ Load cart from localStorage
  useEffect(() => {
    const key = user?.username
      ? user.username.toLowerCase().replace(/[^a-z0-9]/g, "_")
      : "guest";
    const saved = JSON.parse(localStorage.getItem(`cart_${key}`)) || [];
    dispatch(SetCart(saved));
  }, [user, dispatch]);

  // ✅ Save cart when updated
  useEffect(() => {
    const key = user?.username
      ? user.username.toLowerCase().replace(/[^a-z0-9]/g, "_")
      : "guest";
    localStorage.setItem(`cart_${key}`, JSON.stringify(cartItems));
  }, [cartItems, user]);

  // ✅ Search handler
  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    try {
      const res = await axios.get(
        `http://localhost:8081/api/products?q=${searchTerm}`
      );
      navigate("/search", { state: { results: res.data } });
    } catch (err) {
      console.error("Error searching products:", err);
    }
  };

  const handleLogout = () => {
    if (user?.username) {
      const key = user.username.toLowerCase().replace(/[^a-z0-9]/g, "_");
      localStorage.setItem(`cart_${key}`, JSON.stringify(cartItems));
    }
    localStorage.removeItem("user");
    setUser(null);
    dispatch(ClearCart());
    setDropdownOpen(false);
    navigate("/login");
  };

  // ✅ Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeCategory = categories.find((cat) => {
    if (cat.sub) {
      return cat.sub.some(
        (sub) =>
          location.pathname.toLowerCase() ===
          `/${cat.name.toLowerCase()}/${sub.toLowerCase()}`
      );
    }
    return location.pathname.toLowerCase() === `/${cat.name.toLowerCase()}`;
  })?.name;

  const isUserRole = !["seller", "manager", "delivery"].includes(
    user?.role?.toLowerCase()
  );

  return (
    <div className="page-container">
      {/* HEADER */}
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
              <div className="user-avatar-wrapper" ref={dropdownRef}>
                <div
                  className="user-avatar"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  {user?.username
                    ? user.username.charAt(0).toUpperCase()
                    : user?.role?.charAt(0) || "?"}
                </div>
                {dropdownOpen && (
                  <div className="user-dropdown">
                    <p className="user-email">{user.username || user.role}</p>

                    {isUserRole && (
                      <>
                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            navigate("/profile");
                          }}
                          className="profile-btn"
                        >
                          View Profile
                        </button>
                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            navigate("/orders");
                          }}
                          className="profile-btn"
                        >
                          Orders
                        </button>
                      </>
                    )}

                    <button onClick={handleLogout} className="logout-btn">
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Navbar only for normal users */}
        {isUserRole && (
          <div className="header-bottom">
            {categories.map((cat) => (
              <Dropdown
                key={cat.name}
                title={cat.name}
                items={cat.sub || []}
                active={cat.name === activeCategory}
              />
            ))}
          </div>
        )}
      </header>

      {/* ROUTES */}
      <main className="content">
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Home />} />
          <Route path="/search" element={<SearchResults />} /> {/* ✅ Added */}

          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgotPassword" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/orders" element={<Orders />} />

          {/* Categories */}
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

          {/* Dashboards */}
          <Route
            path="/sellerdashboard"
            element={
              user?.role?.toLowerCase() === "seller" ? (
                <Sellerdashboard />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/managerdashboard"
            element={
              user?.role?.toLowerCase() === "manager" ? (
                <Managerdashboard />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/deliverydashboard"
            element={
              user?.role?.toLowerCase() === "delivery" ? (
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
