import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { AddToCart, IncCart, DecCart } from "./Store"; 
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Mobiles.css"; // Reuse same styling

const SmartTV = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart);
  const [tvs, setTVs] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:8081/api/products")
      .then((response) => {
        const tvData = response.data.filter(
          (product) => product.catagory && product.catagory.toLowerCase() === "smarttv"
        );

        const updatedTVs = tvData.map((item) => {
          let imagePath = "/Images/default.jpg";
          const name = item.name.toLowerCase();
          if (name.includes("samsung")) imagePath = "/Images/samsungtv.webp";
          else if (name.includes("sony")) imagePath = "/Images/sonytv.jpg";
          else if (name.includes("haves")) imagePath = "/Images/havestv.jpg";
          else if (name.includes("tcl")) imagePath = "/Images/tcltv.jpg";
          else if (name.includes("sharp")) imagePath = "/Images/sharp.webp";
          else if (name.includes("roku")) imagePath = "/Images/roku.jpg";
          else if (name.includes("ibell")) imagePath = "/Images/ibell.jpg";
          else if (name.includes("led")) imagePath = "/Images/led.jpg";

          return { ...item, image: imagePath };
        });

        setTVs(updatedTVs);
      })
      .catch((error) => {
        console.error("Error fetching Smart TVs:", error);
      });
  }, []);

  const getQuantity = (tv) => {
    const item = cartItems.find((i) => i.id === tv.id);
    return item ? item.quantity : 0;
  };

  const handleIncrement = (tv) => {
    const quantity = getQuantity(tv);

    if (tv.availability <= 0) {
      toast.error(`${tv.name} is out of stock!`, { position: "bottom-right", autoClose: 2000 });
      return;
    }

    const updatedTVs = tvs.map((t) =>
      t.id === tv.id ? { ...t, availability: t.availability - 1 } : t
    );
    setTVs(updatedTVs);

    if (quantity === 0) {
      dispatch(AddToCart(tv));
      toast.success(`${tv.name} added to cart!`, { position: "bottom-right", autoClose: 2000 });
    } else {
      dispatch(IncCart(tv));
    }
  };

  const handleDecrement = (tv) => {
    const quantity = getQuantity(tv);
    if (quantity > 0) {
      dispatch(DecCart(tv));

      const updatedTVs = tvs.map((t) =>
        t.id === tv.id ? { ...t, availability: t.availability + 1 } : t
      );
      setTVs(updatedTVs);
    }
  };

  return (
    <div className="mobiles-container">
      <h2 className="mobiles-title">📺 Smart TVs</h2>
      <div className="mobiles-grid">
        {tvs.map((tv) => (
          <div key={tv.id} className={`mobile-card ${tv.availability <= 0 ? "out-of-stock" : ""}`}>
            <div className="mobile-image-wrapper">
              <img
                src={tv.image}
                alt={tv.name}
                className="mobile-image"
                onError={(e) => (e.target.src = "/Images/default.jpg")}
              />
            </div>

            <div className="mobile-details">
              <h4 className="mobile-name">{tv.name}</h4>
              <p className="mobile-price">₹{tv.price.toLocaleString()}</p>

              {tv.availability > 0 ? (
                <p className="mobile-stock">🟢 In Stock: {tv.availability}</p>
              ) : (
                <p className="mobile-stock out">🔴 Out of Stock</p>
              )}

              <div className="quantity-controller">
                <button className="quantity-btn" onClick={() => handleDecrement(tv)}>-</button>
                <span className="quantity-value">{getQuantity(tv)}</span>
                <button
                  className="quantity-btn"
                  onClick={() => handleIncrement(tv)}
                  disabled={tv.availability === 0}
                  style={{
                    backgroundColor: tv.availability === 0 ? "#ccc" : "#4CAF50",
                    cursor: tv.availability === 0 ? "not-allowed" : "pointer",
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

export default SmartTV;
