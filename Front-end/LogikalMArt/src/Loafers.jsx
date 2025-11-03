import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { AddToCart, IncCart, DecCart } from "./Store";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Loafers.css";

const Loafers = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart);
  const [loafers, setLoafers] = useState([]);
  const [filteredLoafers, setFilteredLoafers] = useState([]);

  const [filters, setFilters] = useState({
    color: "",
    brand: "",
    type: "",
  });

  // ✅ Fetch loafers data from backend
  useEffect(() => {
    axios
      .get("http://localhost:8081/api/products")
      .then((response) => {
        const loaferData = response.data.filter(
          (product) => product.catagory === "Loafers"
        );

        const updatedLoafers = loaferData.map((item) => {
          let imagePath = "/Images/default.jpg";
          const name = item.name.toLowerCase();

          if (name.includes("royale")) imagePath = "/Shoes/royale.jpg";
          else if (name.includes("nizam")) imagePath = "/Shoes/nizam.jpg";
          else if (name.includes("fausto")) imagePath = "/Shoes/fausto.jpg";
          else if (name.includes("harbour")) imagePath = "/Shoes/harbour.jpg";
          else if (name.includes("wooden")) imagePath = "/Shoes/wooden.jpg";
          else if (name.includes("leather")) imagePath = "/Shoes/leather.jpg";
          else if (name.includes("hitz")) imagePath = "/Shoes/hitz.jpg";

          return { ...item, image: imagePath };
        });

        setLoafers(updatedLoafers);
        setFilteredLoafers(updatedLoafers);
      })
      .catch((error) => {
        console.error("Error fetching loafers:", error);
      });
  }, []);

  // ✅ Filter change handler
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  // ✅ Apply filters
  useEffect(() => {
    let filtered = loafers;

    if (filters.color) {
      filtered = filtered.filter(
        (l) => l.color && l.color.toLowerCase() === filters.color.toLowerCase()
      );
    }

    if (filters.brand) {
      filtered = filtered.filter((l) =>
        l.name.toLowerCase().includes(filters.brand.toLowerCase())
      );
    }

    if (filters.type) {
      filtered = filtered.filter(
        (l) => l.type && l.type.toLowerCase() === filters.type.toLowerCase()
      );
    }

    setFilteredLoafers(filtered);
  }, [filters, loafers]);

  // ✅ Get quantity from cart
  const getQuantity = (loafer) => {
    const item = cartItems.find((i) => i.name === loafer.name);
    return item ? item.quantity : 0;
  };

  // ✅ Increment cart and reduce stock
  const handleIncrement = (loafer) => {
    setLoafers((prev) =>
      prev.map((l) => {
        if (l.id === loafer.id && l.availability > 0) {
          return { ...l, availability: l.availability - 1 };
        }
        return l;
      })
    );

    if (loafer.availability <= 0) {
      toast.error(`${loafer.name} is out of stock!`, {
        position: "bottom-right",
        autoClose: 2000,
      });
      return;
    }

    const quantity = getQuantity(loafer);
    if (quantity === 0) {
      dispatch(AddToCart(loafer));
      toast.success(`${loafer.name} added to cart!`, {
        position: "bottom-right",
        autoClose: 2000,
      });
    } else {
      dispatch(IncCart(loafer));
    }
  };

  // ✅ Decrement cart and restore stock
  const handleDecrement = (loafer) => {
    const quantity = getQuantity(loafer);
    if (quantity > 0) {
      dispatch(DecCart(loafer));

      setLoafers((prev) =>
        prev.map((l) => {
          if (l.id === loafer.id) {
            return { ...l, availability: l.availability + 1 };
          }
          return l;
        })
      );
    }
  };

  return (
    <div className="loafer-main">
      {/* Sidebar */}
      <aside className="sidebar">
        <h3>Filters</h3>

        <div className="filter-group">
          <label>Color</label>
          <select name="color" onChange={handleFilterChange}>
            <option value="">All</option>
            <option value="Black">Black</option>
            <option value="Brown">Brown</option>
            <option value="Tan">Tan</option>
            <option value="Blue">Blue</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Brand</label>
          <select name="brand" onChange={handleFilterChange}>
            <option value="">All</option>
            <option value="Bata">Bata</option>
            <option value="Red Tape">Red Tape</option>
            <option value="Clarks">Clarks</option>
            <option value="Woodland">Woodland</option>
            <option value="Hush Puppies">Hush Puppies</option>
            <option value="Lee Cooper">Lee Cooper</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Type</label>
          <select name="type" onChange={handleFilterChange}>
            <option value="">All</option>
            <option value="Slip-on">Slip-on</option>
            <option value="Moccasin">Moccasin</option>
            <option value="Penny">Penny</option>
            <option value="Driving">Driving</option>
          </select>
        </div>
      </aside>

      {/* Main Content */}
      <div className="loafer-container">
        <h2 className="loafer-title">🥿 Loafers</h2>
        <div className="loafer-grid">
          {filteredLoafers.map((loafer) => (
            <div key={loafer.id} className="loafer-card">
              <div className="loafer-image-wrapper">
                <img
                  src={loafer.image}
                  alt={loafer.name}
                  className="loafer-image"
                />
              </div>
              <div className="loafer-details">
                <h4 className="loafer-name">{loafer.name}</h4>
                <p className="loafer-price">
                  ₹{loafer.price.toLocaleString()}
                </p>

                {loafer.availability > 0 ? (
                  <p className="loafer-stock">
                    🟢 In Stock: {loafer.availability}
                  </p>
                ) : (
                  <p className="loafer-stock out">🔴 Out of Stock</p>
                )}

                <div className="quantity-controller">
                  <button
                    className="quantity-btn"
                    onClick={() => handleDecrement(loafer)}
                  >
                    -
                  </button>
                  <span className="quantity-value">{getQuantity(loafer)}</span>
                  <button
                    className="quantity-btn"
                    onClick={() => handleIncrement(loafer)}
                    disabled={loafer.availability === 0}
                    style={{
                      backgroundColor:
                        loafer.availability === 0 ? "#ccc" : "#4CAF50",
                      cursor:
                        loafer.availability === 0 ? "not-allowed" : "pointer",
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

export default Loafers;
