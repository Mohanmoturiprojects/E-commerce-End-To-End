import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { AddToCart, IncCart, DecCart } from "./Store";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Bedroom.css";

const Bedroom = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart);
  const [bedroom, setBedroom] = useState([]);
  const [filteredBedroom, setFilteredBedroom] = useState([]);

  const [filters, setFilters] = useState({
    brand: "",
    type: "",
    material: "",
  });

  // ✅ Fetch bedroom data
  useEffect(() => {
    axios
      .get("http://localhost:8081/api/products")
      .then((response) => {
        const bedroomData = response.data.filter(
          (product) => product.catagory === "Bedroom"
        );

        const updatedBedroom = bedroomData.map((item) => {
          let imagePath = "/Images/default.jpg";
          const name = item.name.toLowerCase();

          if (name.includes("bed sheet")) imagePath = "/Home/bed sheet.jpg";
          else if (name.includes("pillows")) imagePath = "/Home/pillows.jpg";
          else if (name.includes("blanket")) imagePath = "/Home/blanket.jpg";
          else if (name.includes("curtains")) imagePath = "/Home/curtains.jpg";
          else if (name.includes("ddecor")) imagePath = "/Images/ddecor curtain.webp";
          else if (name.includes("bombay dyeing")) imagePath = "/Images/bombay bedsheet.webp";

          return { ...item, image: imagePath };
        });

        setBedroom(updatedBedroom);
        setFilteredBedroom(updatedBedroom);
      })
      .catch((error) => {
        console.error("Error fetching bedroom data:", error);
      });
  }, []);

  // ✅ Filter change handler
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  // ✅ Apply filters dynamically
  useEffect(() => {
    let filtered = bedroom;

    if (filters.brand) {
      filtered = filtered.filter((b) =>
        b.name.toLowerCase().includes(filters.brand.toLowerCase())
      );
    }

    if (filters.type) {
      filtered = filtered.filter(
        (b) => b.type && b.type.toLowerCase() === filters.type.toLowerCase()
      );
    }

    if (filters.material) {
      filtered = filtered.filter(
        (b) =>
          b.material && b.material.toLowerCase() === filters.material.toLowerCase()
      );
    }

    setFilteredBedroom(filtered);
  }, [filters, bedroom]);

  // ✅ Get quantity in cart
  const getQuantity = (item) => {
    const found = cartItems.find((i) => i.name === item.name);
    return found ? found.quantity : 0;
  };

  // ✅ Increment
  const handleIncrement = (item) => {
    setBedroom((prev) =>
      prev.map((b) => {
        if (b.id === item.id && b.availability > 0) {
          return { ...b, availability: b.availability - 1 };
        }
        return b;
      })
    );

    if (item.availability <= 0) {
      toast.error(`${item.name} is out of stock!`, {
        position: "bottom-right",
        autoClose: 2000,
      });
      return;
    }

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

      setBedroom((prev) =>
        prev.map((b) => {
          if (b.id === item.id) {
            return { ...b, availability: b.availability + 1 };
          }
          return b;
        })
      );
    }
  };

  return (
    <div className="bedroom-main">
      {/* Sidebar */}
      <aside className="sidebar">
        <h3>Filters</h3>

        <div className="filter-group">
          <label>Brand</label>
          <select name="brand" onChange={handleFilterChange}>
            <option value="">All</option>
            <option value="Sleepwell">Sleepwell</option>
            <option value="Kurlon">Kurlon</option>
            <option value="Springfit">Springfit</option>
            <option value="Recron">Recron</option>
            <option value="Bombay Dyeing">Bombay Dyeing</option>
            <option value="Ddecor">D’Decor</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Type</label>
          <select name="type" onChange={handleFilterChange}>
            <option value="">All</option>
            <option value="Bedsheet">Bedsheet</option>
            <option value="Pillow">Pillow</option>
            <option value="Curtain">Curtain</option>
            <option value="Mattress">Mattress</option>
            <option value="Blanket">Blanket</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Material</label>
          <select name="material" onChange={handleFilterChange}>
            <option value="">All</option>
            <option value="Cotton">Cotton</option>
            <option value="Polyester">Polyester</option>
            <option value="Foam">Foam</option>
            <option value="Silk">Silk</option>
            <option value="Velvet">Velvet</option>
          </select>
        </div>
      </aside>

      {/* Main content */}
      <div className="bedroom-container">
        <h2 className="bedroom-title">🛏️ Bedroom Essentials</h2>
        <div className="bedroom-grid">
          {filteredBedroom.map((item) => (
            <div key={item.id} className="bedroom-card">
              <div className="bedroom-image-wrapper">
                <img src={item.image} alt={item.name} className="bedroom-image" />
              </div>

              <div className="bedroom-details">
                <h4 className="bedroom-name">{item.name}</h4>
                <p className="bedroom-price">₹{item.price.toLocaleString()}</p>

                {item.availability > 0 ? (
                  <p className="bedroom-stock">🟢 In Stock: {item.availability}</p>
                ) : (
                  <p className="bedroom-stock out">🔴 Out of Stock</p>
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
          ))}
        </div>
        <ToastContainer />
      </div>
    </div>
  );
};

export default Bedroom;
