import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { AddToCart, IncCart, DecCart } from "./store";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Cloths.css";

const Cloths = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart);
  const [cloths, setCloths] = useState([]);
  const [filteredCloths, setFilteredCloths] = useState([]);

  const [filters, setFilters] = useState({
    color: "",
    size: "",
    brand: "",
  });

  // Fetch products from backend
  useEffect(() => {
    axios
      .get("http://localhost:8081/api/products")
      .then((response) => {
        const babyData = response.data.filter(
          (product) => product.catagory === "BabyCloths"
        );

        const updatedCloths = babyData.map((item) => {
          let imagePath = "/Images/default-baby.jpg";

          if (item.name.toLowerCase().includes("dress")) imagePath = "/Kids/dress.jpg";
          else if (item.name.toLowerCase().includes("trend")) imagePath = "/Kids/trend.jpg";
          else if (item.name.toLowerCase().includes("fancy")) imagePath = "/Kids/fancy.jpg";
          else if (item.name.toLowerCase().includes("frocks")) imagePath = "/Kids/frocks.jpg";
          else if (item.name.toLowerCase().includes("kurtas")) imagePath = "/Kids/kurtas.webp";
          else if (item.name.toLowerCase().includes("partys")) imagePath = "/Kids/partys.webp";
          else if (item.name.toLowerCase().includes("clothingset")) imagePath = "/Kids/clothingset.jpg";
          else if (item.name.toLowerCase().includes("tshirt"))  imagePath = "/Kids/tshirt.jpg";

          return { ...item, image: imagePath };
        });

        setCloths(updatedCloths);
        setFilteredCloths(updatedCloths);
      })
      .catch((error) => {
        console.error("Error fetching baby clothes:", error);
      });
  }, []);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  // Apply filters
  useEffect(() => {
    let filtered = cloths;

    if (filters.color) {
      filtered = filtered.filter(
        (c) => c.color && c.color.toLowerCase() === filters.color.toLowerCase()
      );
    }

    if (filters.size) {
      filtered = filtered.filter(
        (c) => c.size && c.size.toLowerCase() === filters.size.toLowerCase()
      );
    }

    if (filters.brand) {
      filtered = filtered.filter((c) =>
        c.name.toLowerCase().includes(filters.brand.toLowerCase())
      );
    }

    if (filters.type) {
      filtered = filtered.filter((c) =>
        c.type && c.type.toLowerCase() === filters.type.toLowerCase()
      );
    }

    setFilteredCloths(filtered);
  }, [filters, cloths]);

  // Cart quantity
  const getQuantity = (cloth) => {
    const item = cartItems.find((i) => i.name === cloth.name);
    return item ? item.quantity : 0;
  };

  const handleIncrement = (cloth) => {
    setCloths((prev) =>
      prev.map((c) => {
        if (c.id === cloth.id && c.availability > 0) {
          return { ...c, availability: c.availability - 1 };
        }
        return c;
      })
    );

    if (cloth.availability <= 0) {
      toast.error(`${cloth.name} is out of stock!`, {
        position: "bottom-right",
        autoClose: 2000,
      });
      return;
    }

    const quantity = getQuantity(cloth);
    if (quantity === 0) {
      dispatch(AddToCart(cloth));
      toast.success(`${cloth.name} added to cart!`, {
        position: "bottom-right",
        autoClose: 2000,
      });
    } else {
      dispatch(IncCart(cloth));
    }
  };

  const handleDecrement = (cloth) => {
    const quantity = getQuantity(cloth);
    if (quantity > 0) {
      dispatch(DecCart(cloth));

      setCloths((prev) =>
        prev.map((c) => {
          if (c.id === cloth.id) {
            return { ...c, availability: c.availability + 1 };
          }
          return c;
        })
      );
    }
  };

  return (
    <div className="cloths-main">
      {/* Sidebar Filters */}
      <aside className="sidebar">
        <h3>Filters</h3>
         
            <div className="filter-group">
          <label>Name</label>
          <select name="brand" onChange={handleFilterChange}>
            <option value="">All</option>
            <option value="Dress">Dress</option>
            <option value="Frocks">Frocks</option>
            <option value="Tshirt">Tshirt</option>
            <option value="Kurtas">Kurtas</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Color</label>
          <select name="color" onChange={handleFilterChange}>
            <option value="">All</option>
            <option value="Pink">Pink</option>
            <option value="Blue">Blue</option>
            <option value="White">White</option>
            <option value="Yellow">Yellow</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Size</label>
          <select name="size" onChange={handleFilterChange}>
            <option value="">All</option>
            <option value="0-3M">0-3M</option>
            <option value="3-6M">3-6M</option>
            <option value="6-12M">6-12M</option>
            <option value="1-2Y">1-2Y</option>
          </select>
        </div>

     
      </aside>

      {/* Main Product Section */}
      <div className="cloths-container">
        <h2 className="cloths-title">👶 Baby Clothing Collection</h2>

        <div className="cloths-grid">
          {filteredCloths.map((cloth) => (
            <div key={cloth.id} className="cloth-card">
              <div className="cloth-image-wrapper">
                <img
                  src={cloth.image}
                  alt={cloth.name}
                  className="cloth-image"
                />
              </div>
              <div className="cloth-details">
                <h4 className="cloth-name">{cloth.name}</h4>
                <p className="cloth-price">₹{cloth.price.toLocaleString()}</p>

                {cloth.availability > 0 ? (
                  <p className="cloth-stock">
                    🟢 In Stock: {cloth.availability}
                  </p>
                ) : (
                  <p className="cloth-stock out">🔴 Out of Stock</p>
                )}

                <div className="quantity-controller">
                  <button
                    className="quantity-btn"
                    onClick={() => handleDecrement(cloth)}
                  >
                    -
                  </button>
                  <span className="quantity-value">{getQuantity(cloth)}</span>
                  <button
                    className="quantity-btn"
                    onClick={() => handleIncrement(cloth)}
                    disabled={cloth.availability === 0}
                    style={{
                      backgroundColor:
                        cloth.availability === 0 ? "#ccc" : "#4CAF50",
                      cursor:
                        cloth.availability === 0 ? "not-allowed" : "pointer",
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

export default Cloths;
