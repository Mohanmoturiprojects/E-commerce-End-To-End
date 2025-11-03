import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { AddToCart, IncCart, DecCart } from "./Store";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Jeanes.css";

const Jeanes = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart);
  const [jeanes, setJeanes] = useState([]);
  const [filteredJeanes, setFilteredJeanes] = useState([]);

  const [filters, setFilters] = useState({
    color: "",
    size: "",
    brand: "",
  });

  useEffect(() => {
    axios
      .get("http://localhost:8081/api/products") // update backend URL
      .then((response) => {
        // Filter only jeans category
        const jeanData = response.data.filter(
          (product) => product.catagory === "Jeans"
        );

        // Assign dynamic image paths based on name
        const updatedJeans = jeanData.map((item) => {
          let imagePath = "/Images/default-jeans.jpg";

           if (item.name.toLowerCase().includes("denim"))
            imagePath = "/Mens/denim.webp";
          else if (item.name.toLowerCase().includes("bootcut"))
            imagePath = "/Mens/bootcut.webp";
          else if (item.name.toLowerCase().includes("crop fit"))
            imagePath = "/Mens/crop fit.webp";
           else if (item.name.toLowerCase().includes("torn"))
            imagePath = "/Mens/torn.webp";

          return { ...item, image: imagePath };
        });

        setJeanes(updatedJeans);
        setFilteredJeanes(updatedJeans);
      })
      .catch((error) => {
        console.error("Error fetching jeans:", error);
      });
  }, []);

  // ✅ Update filters dynamically
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  // ✅ Apply filters whenever filters change
  useEffect(() => {
    let filtered = jeanes;

    if (filters.color) {
      filtered = filtered.filter(
        (j) => j.color && j.color.toLowerCase() === filters.color.toLowerCase()
      );
    }

    if (filters.size) {
      filtered = filtered.filter(
        (j) => j.size && j.size.toLowerCase() === filters.size.toLowerCase()
      );
    }

    if (filters.brand) {
      filtered = filtered.filter((j) =>
        j.name.toLowerCase().includes(filters.brand.toLowerCase())
      );
    }

    setFilteredJeanes(filtered);
  }, [filters, jeanes]);

  const getQuantity = (jean) => {
    const item = cartItems.find((i) => i.name === jean.name);
    return item ? item.quantity : 0;
  };

  const handleIncrement = (jean) => {
    setJeanes((prev) =>
      prev.map((j) => {
        if (j.id === jean.id && j.availability > 0) {
          return { ...j, availability: j.availability - 1 };
        }
        return j;
      })
    );

    if (jean.availability <= 0) {
      toast.error(`${jean.name} is out of stock!`, {
        position: "bottom-right",
        autoClose: 2000,
      });
      return;
    }

    const quantity = getQuantity(jean);
    if (quantity === 0) {
      dispatch(AddToCart(jean));
      toast.success(`${jean.name} added to cart!`, {
        position: "bottom-right",
        autoClose: 2000,
      });
    } else {
      dispatch(IncCart(jean));
    }
  };

  const handleDecrement = (jean) => {
    const quantity = getQuantity(jean);
    if (quantity > 0) {
      dispatch(DecCart(jean));
      setJeanes((prev) =>
        prev.map((j) => {
          if (j.id === jean.id) {
            return { ...j, availability: j.availability + 1 };
          }
          return j;
        })
      );
    }
  };

  return (
    <div className="jeanes-main">
      {/* Sidebar */}
      <aside className="sidebar">
        <h3>Filters</h3>

        <div className="filter-group">
          <label>Color</label>
          <select name="color" onChange={handleFilterChange}>
            <option value="">All</option>
            <option value="Blue">Blue</option>
            <option value="Black">Black</option>
            <option value="White">White</option>
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

        <div className="filter-group">
          <label>Brand</label>
          <select name="brand" onChange={handleFilterChange}>
            <option value="">All</option>
            <option value="Levis">Levis</option>
            <option value="Pepe">Pepe</option>
            <option value="Denim">Denim</option>
            <option value="Zara">Zara</option>
          </select>
        </div>
      </aside>

      {/* Main content */}
      <div className="jeanes-container">
        <h2 className="jeanes-title">👖 Jeans Collection</h2>
        <div className="jeanes-grid">
          {filteredJeanes.map((jean) => (
            <div key={jean.id} className="jean-card">
              <div className="jean-image-wrapper">
                <img src={jean.image} alt={jean.name} className="jean-image" />
              </div>
              <div className="jean-details">
                <h4 className="jean-name">{jean.name}</h4>
                <p className="jean-price">₹{jean.price.toLocaleString()}</p>

                {jean.availability > 0 ? (
                  <p className="jean-stock">
                    🟢 In Stock: {jean.availability}
                  </p>
                ) : (
                  <p className="jean-stock out">🔴 Out of Stock</p>
                )}

                <div className="quantity-controller">
                  <button
                    className="quantity-btn"
                    onClick={() => handleDecrement(jean)}
                  >
                    -
                  </button>
                  <span className="quantity-value">{getQuantity(jean)}</span>
                  <button
                    className="quantity-btn"
                    onClick={() => handleIncrement(jean)}
                    disabled={jean.availability === 0}
                    style={{
                      backgroundColor:
                        jean.availability === 0 ? "#ccc" : "#4CAF50",
                      cursor:
                        jean.availability === 0 ? "not-allowed" : "pointer",
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

export default Jeanes;
