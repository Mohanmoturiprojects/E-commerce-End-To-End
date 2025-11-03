import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { AddToCart, IncCart, DecCart } from "./Store";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./TableDinner.css";

const TableDinner = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart);
  const [tableDinner, setTableDinner] = useState([]);
  const [filteredTableDinner, setFilteredTableDinner] = useState([]);

  const [filters, setFilters] = useState({
    type: "",
    material: "",
  });

  // ✅ Fetch products
  useEffect(() => {
    axios
      .get("http://localhost:8081/api/products")
      .then((response) => {
        const dinnerData = response.data.filter(
          (product) => product.catagory === "TableDinner"
        );

        const updatedDinner = dinnerData.map((item) => {
          let imagePath = "/Images/default.jpg";
          const name = item.name.toLowerCase();
          let type = "Other";

          // ✅ Detect image and type from product name
          if (name.includes("dinner set")) {
            imagePath = "/Home/dinner set.avif";
            type = "Dinner Set";
          } else if (name.includes("chair")) {
            imagePath = "/Home/chairs.jpg";
            type = "Chair";
          } else if (name.includes("plate")) {
            imagePath = "/Home/plates.jpg";
            type = "Plate";
          } else if (name.includes("glass")) {
            imagePath = "/Home/glasses.jpg";
            type = "Glass";
          } else if (name.includes("cup") || name.includes("mug")) {
            imagePath = "/Home/cups.jpg";
            type = "Cup";
          } else if (name.includes("spoon")) {
            imagePath = "/Home/spoones.jpg";
            type = "Spoon";
          } else if (name.includes("bowl")) {
            imagePath = "/Home/bowles.webp";
            type = "Bowl";
          }

          // ✅ Return updated product with derived type
          return { ...item, image: imagePath, type };
        });

        setTableDinner(updatedDinner);
        setFilteredTableDinner(updatedDinner);
      })
      .catch((error) => {
        console.error("Error fetching table dinner items:", error);
      });
  }, []);

  // ✅ Handle filter input changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  // ✅ Apply filters dynamically (based on Type and Material)
  useEffect(() => {
    let filtered = tableDinner;

    if (filters.type) {
      filtered = filtered.filter(
        (t) => t.type && t.type.toLowerCase() === filters.type.toLowerCase()
      );
    }

    if (filters.material) {
      filtered = filtered.filter(
        (t) =>
          t.material && t.material.toLowerCase() === filters.material.toLowerCase()
      );
    }

    setFilteredTableDinner(filtered);
  }, [filters, tableDinner]);

  // ✅ Get quantity
  const getQuantity = (item) => {
    const found = cartItems.find((i) => i.name === item.name);
    return found ? found.quantity : 0;
  };

  // ✅ Increment
  const handleIncrement = (item) => {
    if (item.availability <= 0) {
      toast.error(`${item.name} is out of stock!`, {
        position: "bottom-right",
        autoClose: 2000,
      });
      return;
    }

    setTableDinner((prev) =>
      prev.map((t) =>
        t.id === item.id ? { ...t, availability: t.availability - 1 } : t
      )
    );

    const quantity = getQuantity(item);
    if (quantity === 0) {
      dispatch(AddToCart(item));
      toast.success(`${item.name} added to cart!`, {
        position: "bottom-right",
        autoClose: 2000,
      });
    } else {
      dispatch(IncCart(item));
    }
  };

  // ✅ Decrement
  const handleDecrement = (item) => {
    const quantity = getQuantity(item);
    if (quantity > 0) {
      dispatch(DecCart(item));
      setTableDinner((prev) =>
        prev.map((t) =>
          t.id === item.id ? { ...t, availability: t.availability + 1 } : t
        )
      );
    }
  };

  return (
    <div className="dinner-main">
      {/* Sidebar */}
      <aside className="sidebar">
        <h3>Filters</h3>

        <div className="filter-group">
          <label>Type</label>
          <select name="type" onChange={handleFilterChange}>
            <option value="">All</option>
            <option value="Dinner Set">Dinner Set</option>
            <option value="Chair">Chair</option>
            <option value="Plate">Plate</option>
            <option value="Bowl">Bowl</option>
            <option value="Cup">Cup</option>
            <option value="Glass">Glass</option>
            <option value="Spoon">Spoon</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Material</label>
          <select name="material" onChange={handleFilterChange}>
            <option value="">All</option>
            <option value="Glass">Glass</option>
            <option value="Plastic">Plastic</option>
            <option value="Steel">Steel</option>
            <option value="Ceramic">Ceramic</option>
            <option value="Melamine">Melamine</option>
          </select>
        </div>
      </aside>

      {/* Main content */}
      <div className="dinner-container">
        <h2 className="dinner-title">🍽️ Table & Dinnerware</h2>

        <div className="dinner-grid">
          {filteredTableDinner.length === 0 ? (
            <p className="no-products">No products found.</p>
          ) : (
            filteredTableDinner.map((item) => (
              <div key={item.id} className="dinner-card">
                <div className="dinner-image-wrapper">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="dinner-image"
                  />
                </div>

                <div className="dinner-details">
                  <h4 className="dinner-name">{item.name}</h4>
                  <p className="dinner-price">
                    ₹{item.price.toLocaleString()}
                  </p>

                  {item.availability > 0 ? (
                    <p className="dinner-stock">
                      🟢 In Stock: {item.availability}
                    </p>
                  ) : (
                    <p className="dinner-stock out">🔴 Out of Stock</p>
                  )}

                  <div className="quantity-controller">
                    <button
                      className="quantity-btn"
                      onClick={() => handleDecrement(item)}
                    >
                      -
                    </button>
                    <span className="quantity-value">{getQuantity(item)}</span>
                    <button
                      className="quantity-btn"
                      onClick={() => handleIncrement(item)}
                      disabled={item.availability === 0}
                      style={{
                        backgroundColor:
                          item.availability === 0 ? "#ccc" : "#4CAF50",
                        cursor:
                          item.availability === 0 ? "not-allowed" : "pointer",
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <ToastContainer />
      </div>
    </div>
  );
};

export default TableDinner;
