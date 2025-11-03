import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { AddToCart, IncCart, DecCart } from "./Store";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Mobiles.css"; // ✅ Reuse same styling

const Laptop = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart);
  const [laptops, setLaptops] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:8081/api/products")
      .then((response) => {
        // ✅ Filter products by category = "Laptop"
        const laptopData = response.data.filter(
          (product) => product.catagory === "Laptop"
        );

        // ✅ Assign correct image path from public folder
        const updatedLaptops = laptopData.map((item) => {
          let imagePath = "/Images/default.jpg";

          
           if (item.name.toLowerCase().includes("dell"))
            imagePath = "/Images/Dell 13.webp";
          else if (item.name.toLowerCase().includes("hp"))
            imagePath = "/Images/Hp 15.webp";
          else if (item.name.toLowerCase().includes("MacBook Air M2"))
            imagePath = "/Images/MacBook Air M2.jpg";
          else if (item.name.toLowerCase().includes("acer"))
            imagePath = "/Images/Acer.webp";
           else if (item.name.toLowerCase().includes("asus"))
            imagePath = "/Images/asus.webp";
           else if (item.name.toLowerCase().includes("amd"))
            imagePath = "/Images/amd.jpg";
           else if (item.name.toLowerCase().includes("surfacae"))
            imagePath = "/Images/surfacae.avif";


          return { ...item, image: imagePath };
        });

        setLaptops(updatedLaptops);
      })
      .catch((error) => {
        console.error("Error fetching laptops:", error);
      });
  }, []);

  // ✅ Get quantity from Redux cart
  const getQuantity = (laptop) => {
    const item = cartItems.find((i) => i.name === laptop.name);
    return item ? item.quantity : 0;
  };

  // ✅ Add or increment product
  const handleIncrement = (laptop) => {
    const quantity = getQuantity(laptop);

    if (laptop.availability <= 0) {
      toast.error(`${laptop.name} is out of stock!`, {
        position: "bottom-right",
        autoClose: 2000,
      });
      return;
    }

    // Update local availability
    const updatedLaptops = laptops.map((l) => {
      if (l.id === laptop.id && l.availability > 0) {
        return { ...l, availability: l.availability - 1 };
      }
      return l;
    });
    setLaptops(updatedLaptops);

    if (quantity === 0) {
      dispatch(AddToCart(laptop));
      toast.success(`${laptop.name} added to cart!`, {
        position: "bottom-right",
        autoClose: 2000,
      });
    } else {
      dispatch(IncCart(laptop));
    }
  };

  // ✅ Decrement product
  const handleDecrement = (laptop) => {
    const quantity = getQuantity(laptop);
    if (quantity > 0) {
      dispatch(DecCart(laptop));

      // Increase availability locally
      const updatedLaptops = laptops.map((l) => {
        if (l.id === laptop.id) {
          return { ...l, availability: l.availability + 1 };
        }
        return l;
      });
      setLaptops(updatedLaptops);
    }
  };

  return (
    <div className="mobiles-container">
      <h2 className="mobiles-title">💻 Laptops</h2>
      <div className="mobiles-grid">
        {laptops.map((laptop) => (
          <div key={laptop.id} className="mobile-card">
            <div className="mobile-image-wrapper">
              <img
                src={laptop.image}
                alt={laptop.name}
                className="mobile-image"
                onError={(e) => (e.target.src = "/Images/default.jpg")}
              />
            </div>

            <div className="mobile-details">
              <h4 className="mobile-name">{laptop.name}</h4>
              <p className="mobile-price">₹{laptop.price.toLocaleString()}</p>

              {/* Availability Info */}
              {laptop.availability > 0 ? (
                <p className="mobile-stock">🟢 In Stock: {laptop.availability}</p>
              ) : (
                <p className="mobile-stock out">🔴 Out of Stock</p>
              )}

              {/* Quantity Control Buttons */}
              <div className="quantity-controller">
                <button
                  className="quantity-btn"
                  onClick={() => handleDecrement(laptop)}
                >
                  -
                </button>
                <span className="quantity-value">{getQuantity(laptop)}</span>
                <button
                  className="quantity-btn"
                  onClick={() => handleIncrement(laptop)}
                  disabled={laptop.availability === 0}
                  style={{
                    backgroundColor:
                      laptop.availability === 0 ? "#ccc" : "#4CAF50",
                    cursor:
                      laptop.availability === 0 ? "not-allowed" : "pointer",
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
  );
};

export default Laptop;
