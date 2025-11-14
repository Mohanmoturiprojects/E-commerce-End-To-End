import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { AddToCart, IncCart, DecCart } from "./store";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Toys.css";

const Toys = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart);
  const [toys, setToys] = useState([]);
  const [filteredToys, setFilteredToys] = useState([]);

  const [filters, setFilters] = useState({
    brand: "",
    ageGroup: "",
    type: "",
  });

  // ✅ Fetch toys from backend
  useEffect(() => {
    axios
      .get("http://localhost:8081/api/products")
      .then((response) => {
        const toyData = response.data.filter(
          (product) => product.catagory === "Toys"
        );

        // Assign toy images dynamically
        const updatedToys = toyData.map((item) => {
          let imagePath = "/Images/default-toy.jpg";

          const lowerName = item.name.toLowerCase();
          if (lowerName.includes("baby")) imagePath = "/Kids/baby.jpg";
          else if (lowerName.includes("horse")) imagePath = "/Kids/horse.jpg";
          else if (lowerName.includes("train")) imagePath = "/Kids/train.jpg";
          else if (lowerName.includes("cars")) imagePath = "/Kids/cars.jpg";
          else if (lowerName.includes("music")) imagePath = "/Kids/music.jpg";
           else if (lowerName.includes("ball")) imagePath = "/Kids/ball.jpg";
            else if (lowerName.includes("ship")) imagePath = "/Kids/ship.jpg";

          return { ...item, image: imagePath };
        });

        setToys(updatedToys);
        setFilteredToys(updatedToys);
      })
      .catch((error) => {
        console.error("Error fetching toys:", error);
      });
  }, []);

  // ✅ Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  // ✅ Apply filters
  useEffect(() => {
    let filtered = toys;

    if (filters.brand) {
      filtered = filtered.filter((t) =>
        t.name.toLowerCase().includes(filters.brand.toLowerCase())
      );
    }

    if (filters.ageGroup) {
      filtered = filtered.filter(
        (t) =>
          t.ageGroup &&
          t.ageGroup.toLowerCase() === filters.ageGroup.toLowerCase()
      );
    }

    if (filters.type) {
      filtered = filtered.filter(
        (t) => t.type && t.type.toLowerCase() === filters.type.toLowerCase()
      );
    }

    setFilteredToys(filtered);
  }, [filters, toys]);

  // ✅ Cart Functions
  const getQuantity = (toy) => {
    const item = cartItems.find((i) => i.name === toy.name);
    return item ? item.quantity : 0;
  };

  const handleIncrement = (toy) => {
    setToys((prev) =>
      prev.map((t) => {
        if (t.id === toy.id && t.availability > 0) {
          return { ...t, availability: t.availability - 1 };
        }
        return t;
      })
    );

    if (toy.availability <= 0) {
      toast.error(`${toy.name} is out of stock!`, {
        position: "bottom-right",
        autoClose: 2000,
      });
      return;
    }

    const quantity = getQuantity(toy);
    if (quantity === 0) {
      dispatch(AddToCart(toy));
      toast.success(`${toy.name} added to cart!`, {
        position: "bottom-right",
        autoClose: 2000,
      });
    } else {
      dispatch(IncCart(toy));
    }
  };

  const handleDecrement = (toy) => {
    const quantity = getQuantity(toy);
    if (quantity > 0) {
      dispatch(DecCart(toy));

      setToys((prev) =>
        prev.map((t) => {
          if (t.id === toy.id) {
            return { ...t, availability: t.availability + 1 };
          }
          return t;
        })
      );
    }
  };

  return (
    <div className="toys-main">
      {/* Sidebar Filters */}
      <aside className="sidebar">
        <h3>Filters</h3>

        <div className="filter-group">
          <label>Name</label>
          <select name="brand" onChange={handleFilterChange}>
            <option value="">All</option>
            <option value="horse">Horse</option>
            <option value="train"> Train</option>
            <option value="music">Music</option>
            <option value="ship">Ship</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Age Group</label>
          <select name="ageGroup" onChange={handleFilterChange}>
            <option value="">All</option>
            <option value="1-3">1-3 years</option>
            <option value="4-6">4-6 years</option>
            <option value="7-10">7-10 years</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Type</label>
          <select name="type" onChange={handleFilterChange}>
            <option value="">All</option>
            <option value="Educational">Educational</option>
            <option value="Soft Toy">Soft Toy</option>
            <option value="Action Figure">Action Figure</option>
            <option value="Building Set">Building Set</option>
          </select>
        </div>
      </aside>

      {/* Main Toys Grid */}
      <div className="toys-container">
        <h2 className="toys-title">🧸 Toys Collection</h2>

        <div className="toys-grid">
          {filteredToys.map((toy) => (
            <div key={toy.id} className="toy-card">
              <div className="toy-image-wrapper">
                <img src={toy.image} alt={toy.name} className="toy-image" />
              </div>
              <div className="toy-details">
                <h4 className="toy-name">{toy.name}</h4>
                <p className="toy-price">₹{toy.price.toLocaleString()}</p>

                {toy.availability > 0 ? (
                  <p className="toy-stock">🟢 In Stock: {toy.availability}</p>
                ) : (
                  <p className="toy-stock out">🔴 Out of Stock</p>
                )}

                <div className="quantity-controller">
                  <button
                    className="quantity-btn"
                    onClick={() => handleDecrement(toy)}
                  >
                    -
                  </button>
                  <span className="quantity-value">{getQuantity(toy)}</span>
                  <button
                    className="quantity-btn"
                    onClick={() => handleIncrement(toy)}
                    disabled={toy.availability === 0}
                    style={{
                      backgroundColor:
                        toy.availability === 0 ? "#ccc" : "#4CAF50",
                      cursor:
                        toy.availability === 0 ? "not-allowed" : "pointer",
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

export default Toys;
