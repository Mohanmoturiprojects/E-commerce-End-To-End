import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { AddToCart, IncCart, DecCart } from "./store";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Dresses.css";

const Dresses = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart);
  const [dresses, setDresses] = useState([]);
  const [filteredDresses, setFilteredDresses] = useState([]);

  const [filters, setFilters] = useState({
    color: "",
    size: "",
    brand: "",
  });

  // ✅ Fetch data from backend
  useEffect(() => {
    axios
      .get("http://localhost:8081/api/products")
      .then((response) => {
        const dressData = response.data.filter(
          (product) => product.catagory === "Dresses"
        );

        // ✅ Assign dynamic images based on name
        const updatedDresses = dressData.map((item) => {
          let imagePath = "/Images/default-dress.jpg";

          if (item.name.toLowerCase().includes("max")) imagePath = "/Womens/max.jpg";
          else if (item.name.toLowerCase().includes("aask")) imagePath = "/Womens/aask.jpg";
          else if (item.name.toLowerCase().includes("h & m"))  imagePath = "/Womens/h & m.jpg";
          else if (item.name.toLowerCase().includes("zara")) imagePath = "/Womens/zara.jpg";
          return { ...item, image: imagePath };
        });

        setDresses(updatedDresses);
        setFilteredDresses(updatedDresses);
      })
      .catch((error) => {
        console.error("Error fetching dresses:", error);
      });
  }, []);

  // ✅ Filter handler
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  // ✅ Apply filters
  useEffect(() => {
    let filtered = dresses;

    if (filters.color) {
      filtered = filtered.filter(
        (d) => d.color && d.color.toLowerCase() === filters.color.toLowerCase()
      );
    }

    if (filters.size) {
      filtered = filtered.filter(
        (d) => d.size && d.size.toLowerCase() === filters.size.toLowerCase()
      );
    }

    if (filters.brand) {
      filtered = filtered.filter((d) =>
        d.name.toLowerCase().includes(filters.brand.toLowerCase())
      );
    }

    setFilteredDresses(filtered);
  }, [filters, dresses]);

  // ✅ Get cart quantity
  const getQuantity = (dress) => {
    const item = cartItems.find((i) => i.name === dress.name);
    return item ? item.quantity : 0;
  };

  // ✅ Increment
  const handleIncrement = (dress) => {
    setDresses((prev) =>
      prev.map((d) => {
        if (d.id === dress.id && d.availability > 0) {
          return { ...d, availability: d.availability - 1 };
        }
        return d;
      })
    );

    if (dress.availability <= 0) {
      toast.error(`${dress.name} is out of stock!`, {
        position: "bottom-right",
        autoClose: 2000,
      });
      return;
    }

    const quantity = getQuantity(dress);
    if (quantity === 0) {
      dispatch(AddToCart(dress));
      toast.success(`${dress.name} added to cart!`, {
        position: "bottom-right",
        autoClose: 2000,
      });
    } else {
      dispatch(IncCart(dress));
    }
  };

  // ✅ Decrement
  const handleDecrement = (dress) => {
    const quantity = getQuantity(dress);
    if (quantity > 0) {
      dispatch(DecCart(dress));

      setDresses((prev) =>
        prev.map((d) => {
          if (d.id === dress.id) {
            return { ...d, availability: d.availability + 1 };
          }
          return d;
        })
      );
    }
  };

  return (
    <div className="dresses-main">
      {/* Sidebar Filters */}
      <aside className="sidebar">
        <h3>Filters</h3>
         
         
        <div className="filter-group">
          <label>Name</label>
          <select name="brand" onChange={handleFilterChange}>
            <option value="">All</option>
            <option value="zara">Zara</option>
            <option value="H&M">H&M</option>
            <option value="max">MAx</option>
            <option value="aask">Aask</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Color</label>
          <select name="color" onChange={handleFilterChange}>
            <option value="">All</option>
            <option value="Red">Red</option>
            <option value="Blue">Blue</option>
            <option value="Pink">Pink</option>
            <option value="Black">Black</option>
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

      {/* Main Products Section */}
      <div className="dresses-container">
        <div className="title-with-icon">
          <h2 className="sarees-title">👗 Dresses Collection</h2>
        </div>

        <div className="dresses-grid">
          {filteredDresses.map((dress) => (
            <div key={dress.id} className="dress-card">
              <div className="dress-image-wrapper">
                <img
                  src={dress.image}
                  alt={dress.name}
                  className="dress-image"
                />
              </div>
              <div className="dress-details">
                <h4 className="dress-name">{dress.name}</h4>
                <p className="dress-price">₹{dress.price.toLocaleString()}</p>

                {dress.availability > 0 ? (
                  <p className="dress-stock">🟢 In Stock: {dress.availability}</p>
                ) : (
                  <p className="dress-stock out">🔴 Out of Stock</p>
                )}

                <div className="quantity-controller">
                  <button
                    className="quantity-btn"
                    onClick={() => handleDecrement(dress)}
                  >
                    -
                  </button>
                  <span className="quantity-value">{getQuantity(dress)}</span>
                  <button
                    className="quantity-btn"
                    onClick={() => handleIncrement(dress)}
                    disabled={dress.availability === 0}
                    style={{
                      backgroundColor:
                        dress.availability === 0 ? "#ccc" : "#4CAF50",
                      cursor:
                        dress.availability === 0 ? "not-allowed" : "pointer",
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

export default Dresses;
