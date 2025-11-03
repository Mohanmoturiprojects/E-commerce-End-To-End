import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { AddToCart, IncCart, DecCart } from "./store";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Mobiles.css";

const Mobiles = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart);
  const [mobiles, setMobiles] = useState([]);
  const [filteredMobiles, setFilteredMobiles] = useState([]);
  const [filters, setFilters] = useState({
    color: "",
    network: "",
    brand: "",
  });

  useEffect(() => {
    axios
      .get("http://localhost:8081/api/products")
      .then((response) => {
        const mobileData = response.data.filter(
          (product) => product.catagory === "Mobiles"
        );

        const updatedMobiles = mobileData.map((item) => {
          // 🧩 Normalize availability
          let availableQty = 0;
          if (!isNaN(item.availability)) {
            availableQty = parseInt(item.availability);
          } else if (
            typeof item.availability === "string" &&
            item.availability.toLowerCase().includes("in stock")
          ) {
            availableQty = 10; // default if "In Stock"
          }

          // 🖼️ Set image based on name
          let imagePath = "/Images/default.jpg";
          if (item.name.toLowerCase().includes("iphone"))
            imagePath = "/Images/iphone 13.webp";
          else if (item.name.toLowerCase().includes("iqoo"))
            imagePath = "/Images/iQOO Z9X 23.webp";
          else if (item.name.toLowerCase().includes("narzo"))
            imagePath = "/Images/narzo 10.webp";
          else if (item.name.toLowerCase().includes("samsung"))
            imagePath = "/Images/samsung r.jpg";
          else if (item.name.toLowerCase().includes("galaxy"))
            imagePath = "/Images/galaxy.jpg";
          else if (item.name.toLowerCase().includes("jio"))
            imagePath = "/Images/jio.webp";
          else if (item.name.toLowerCase().includes("redmi"))
            imagePath = "/Images/redmi r.jpg";
          else if (item.name.toLowerCase().includes("carbon"))
            imagePath = "/Images/carbon.jpg";

          return { ...item, image: imagePath, availability: availableQty };
        });

        setMobiles(updatedMobiles);
        setFilteredMobiles(updatedMobiles);
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
      });
  }, []);

  // ✅ Update filters dynamically
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  // ✅ Apply filters whenever filters change
  useEffect(() => {
    let filtered = mobiles;

    if (filters.color) {
      filtered = filtered.filter(
        (m) => m.color && m.color.toLowerCase() === filters.color.toLowerCase()
      );
    }

    if (filters.network) {
      filtered = filtered.filter(
        (m) =>
          m.network &&
          m.network.toLowerCase() === filters.network.toLowerCase()
      );
    }

    if (filters.brand) {
      filtered = filtered.filter((m) =>
        m.name.toLowerCase().includes(filters.brand.toLowerCase())
      );
    }

    setFilteredMobiles(filtered);
  }, [filters, mobiles]);

  const getQuantity = (mobile) => {
    const item = cartItems.find((i) => i.name === mobile.name);
    return item ? item.quantity : 0;
  };

  const handleIncrement = (mobile) => {
    if (mobile.availability <= 0) {
      toast.error(`${mobile.name} is out of stock!`, {
        position: "bottom-right",
        autoClose: 2000,
      });
      return;
    }

    setMobiles((prev) =>
      prev.map((m) =>
        m.id === mobile.id ? { ...m, availability: m.availability - 1 } : m
      )
    );

    const quantity = getQuantity(mobile);
    if (quantity === 0) {
      dispatch(AddToCart(mobile));
      toast.success(`${mobile.name} added to cart!`, {
        position: "bottom-right",
        autoClose: 2000,
      });
    } else {
      dispatch(IncCart(mobile));
    }
  };

  const handleDecrement = (mobile) => {
    const quantity = getQuantity(mobile);
    if (quantity > 0) {
      dispatch(DecCart(mobile));
      setMobiles((prev) =>
        prev.map((m) =>
          m.id === mobile.id
            ? { ...m, availability: m.availability + 1 }
            : m
        )
      );
    }
  };

  return (
    <div className="mobiles-main">
      {/* Sidebar */}
      <aside className="sidebar">
        <h3>Filters</h3>

        <div className="filter-group">
          <label>Network</label>
          <select name="network" onChange={handleFilterChange}>
            <option value="">All</option>
            <option value="3G">3G</option>
            <option value="4G">4G</option>
            <option value="5G">5G</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Brand</label>
          <select name="brand" onChange={handleFilterChange}>
            <option value="">All</option>
            <option value="iPhone">iPhone</option>
            <option value="Samsung">Samsung</option>
            <option value="Redmi">Redmi</option>
            <option value="Vivo">Vivo</option>
            <option value="OnePlus">OnePlus</option>
          </select>
        </div>
      </aside>

      {/* Main content */}
      <div className="mobiles-container">
        <h2 className="mobiles-title">📱 Mobiles</h2>
        <div className="mobiles-grid">
          {filteredMobiles.map((mobile) => (
            <div key={mobile.id} className="mobile-card">
              <div className="mobile-image-wrapper">
                <img
                  src={mobile.image}
                  alt={mobile.name}
                  className="mobile-image"
                />
              </div>
              <div className="mobile-details">
                <h4 className="mobile-name">{mobile.name}</h4>
                <p className="mobile-price">
                  ₹{mobile.price.toLocaleString()}
                </p>

                {mobile.availability > 0 ? (
                  <p className="mobile-stock">
                    🟢 In Stock: {mobile.availability}
                  </p>
                ) : (
                  <p className="mobile-stock out">🔴 Out of Stock</p>
                )}

                <div className="quantity-controller">
                  <button
                    className="quantity-btn"
                    onClick={() => handleDecrement(mobile)}
                  >
                    -
                  </button>
                  <span className="quantity-value">{getQuantity(mobile)}</span>
                  <button
                    className="quantity-btn"
                    onClick={() => handleIncrement(mobile)}
                    disabled={mobile.availability === 0}
                    style={{
                      backgroundColor:
                        mobile.availability === 0 ? "#ccc" : "#4CAF50",
                      cursor:
                        mobile.availability === 0 ? "not-allowed" : "pointer",
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

export default Mobiles;
