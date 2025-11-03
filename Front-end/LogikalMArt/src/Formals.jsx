import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { AddToCart, IncCart, DecCart } from "./store"; 
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Formals.css";

const Formals = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart);
  const [formals, setFormals] = useState([]);
  const [filteredFormals, setFilteredFormals] = useState([]);

  const [filters, setFilters] = useState({
    brand: "",
    color: "",
    size: "",
  });

  useEffect(() => {
    axios
      .get("http://localhost:8081/api/products")
      .then((response) => {
        const formalData = response.data.filter(
          (product) => product.catagory === "shirts"
        );
        const updatedFormals = formalData.map((item) => {
          let imagePath = "/Images/default.jpg";
          if (item.name.toLowerCase().includes("formals"))
            imagePath = "/Mens/formals.webp";
          else if (item.name.toLowerCase().includes("formal p&b"))
            imagePath = "/Mens/formal p&b.jpg";
          else if (item.name.toLowerCase().includes("formal sys"))
            imagePath = "/Mens/formal sys.webp";
          else if (item.name.toLowerCase().includes("formalsg"))
            imagePath = "/Mens/formalsG.jpeg";
             else if (item.name.toLowerCase().includes("cyan"))
            imagePath = "/Mens/cyan.jpg";
             else if (item.name.toLowerCase().includes("finequo"))
            imagePath = "/Mens/finequo.jpg";
             else if (item.name.toLowerCase().includes("blend"))
            imagePath = "/Mens/blend.jpg";
             else if (item.name.toLowerCase().includes("squirrel"))
            imagePath = "/Mens/squirrel.jpg";



          return { ...item, image: imagePath };
        });
        setFormals(updatedFormals);
        setFilteredFormals(updatedFormals);
      })
      .catch((error) => console.error("Error fetching formals:", error));
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  useEffect(() => {
    let filtered = formals;
    if (filters.brand) {
      filtered = filtered.filter((f) =>
        f.name.toLowerCase().includes(filters.brand.toLowerCase())
      );
    }
    if (filters.color) {
      filtered = filtered.filter(
        (f) => f.color && f.color.toLowerCase() === filters.color.toLowerCase()
      );
    }
    if (filters.size) {
      filtered = filtered.filter(
        (f) => f.size && f.size.toLowerCase() === filters.size.toLowerCase()
      );
    }
    setFilteredFormals(filtered);
  }, [filters, formals]);

  const getQuantity = (item) => {
    const cartItem = cartItems.find((i) => i.name === item.name);
    return cartItem ? cartItem.quantity : 0;
  };

  const handleIncrement = (item) => {
    if (item.availability <= 0) {
      toast.error(`${item.name} is out of stock!`, { position: "bottom-right", autoClose: 2000 });
      return;
    }
    setFormals((prev) =>
      prev.map((f) =>
        f.id === item.id && f.availability > 0 ? { ...f, availability: f.availability - 1 } : f
      )
    );
    const quantity = getQuantity(item);
    if (quantity === 0) {
      dispatch(AddToCart(item));
      toast.success(`${item.name} added to cart!`, { position: "bottom-right", autoClose: 2000 });
    } else {
      dispatch(IncCart(item));
    }
  };

  const handleDecrement = (item) => {
    const quantity = getQuantity(item);
    if (quantity > 0) {
      dispatch(DecCart(item));
      setFormals((prev) =>
        prev.map((f) =>
          f.id === item.id ? { ...f, availability: f.availability + 1 } : f
        )
      );
    }
  };

  return (
    <div className="formals-main">
      {/* Sidebar */}
      <aside className="sidebar">
        <h3>Filters</h3>
        <div className="filter-group">
          <label>Brand</label>
          <select name="brand" onChange={handleFilterChange}>
            <option value="">All</option>
            <option value="Formals">Formals</option>
            <option value="Formal P&B">Formal P&B</option>
            <option value="Formal SYS">Formal SYS</option>
            <option value="FormalsG">FormalsG</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Color</label>
          <select name="color" onChange={handleFilterChange}>
            <option value="">All</option>
            <option value="Black">Black</option>
            <option value="White">White</option>
            <option value="Blue">Blue</option>
            <option value="Gray">Gray</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Size</label>
          <select name="size" onChange={handleFilterChange}>
            <option value="">All</option>
            <option value="S">S</option>
            <option value="M">M</option>
            <option value="L">L</option>
            <option value="XL">XL</option>
          </select>
        </div>
      </aside>

      {/* Main Content */}
      <div className="formals-container">
        <h2 className="formals-title">👔 Formals</h2>
        <div className="formals-grid">
          {filteredFormals.map((item) => (
            <div
              key={item.id}
              className={`formal-card${item.availability === 0 ? " out-of-stock" : ""}`}
            >
              <div className="formal-image-wrapper">
                <img
                  src={item.image}
                  alt={item.name}
                  className="formal-image"
                  onError={(e) => (e.target.src = "/Images/default.jpg")}
                />
              </div>
              <div className="formal-details">
                <h4 className="formal-name">{item.name}</h4>
                <p className="formal-price">₹{item.price.toLocaleString()}</p>
                {item.availability > 0 ? (
                  <p className="formal-stock">🟢 In Stock: {item.availability}</p>
                ) : (
                  <p className="formal-stock out">🔴 Out of Stock</p>
                )}
                <div className="quantity-controller">
                  <button className="quantity-btn" onClick={() => handleDecrement(item)}>-</button>
                  <span className="quantity-value">{getQuantity(item)}</span>
                  <button
                    className="quantity-btn"
                    onClick={() => handleIncrement(item)}
                    disabled={item.availability === 0}
                    style={{
                      backgroundColor: item.availability === 0 ? "#ccc" : "#4CAF50",
                      cursor: item.availability === 0 ? "not-allowed" : "pointer",
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <ToastContainer />
      </div>
    </div>
  );
};

export default Formals;
