import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch } from "react-redux";
import { AddToCart } from "./store";
import { toast } from "react-toastify";
import "./ProductDetails.css";

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState({});
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`http://localhost:8081/api/products/${id}`)
      .then((res) => setProduct(res.data))
      .catch((err) => console.error(err));
  }, [id]);

  // Handle selecting options (RAM, Color, Size, etc.)
  const handleOptionChange = (category, value) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [category]: value,
    }));
  };

  const handleAddToCart = () => {
    const item = { ...product, quantity, selectedOptions };
    dispatch(AddToCart(item));
    toast.success(`${product.name} added to cart 🛒`, {
      position: "bottom-right",
    });
  };

  const increaseQuantity = () => setQuantity((q) => q + 1);
  const decreaseQuantity = () => setQuantity((q) => (q > 1 ? q - 1 : 1));

  if (!product) return <p>Loading product details...</p>;

  // Parse JSON string from backend (if stored as text)
  const options =
    typeof product.options === "string"
      ? JSON.parse(product.options)
      : product.options;

  return (
    <div className="product-details">
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="details-container">
        <img
          src={product.image}
          alt={product.name}
          onError={(e) => (e.target.src = "/images/default.jpg")}
        />

        <div className="info">
          <h2>{product.name}</h2>
          <p>{product.description}</p>
          <h3>Price: ₹{product.price}</h3>

          <p
            className={`availability ${
              product.availability === "In Stock" ? "in-stock" : "out-stock"
            }`}
          >
            {product.availability}
          </p>

          {/* ✅ Dynamic Options */}
          {options && (
            <div className="product-options">
              {Object.entries(options).map(([category, values]) => (
                <div key={category} className="option-group">
                  <h4>{category}</h4>
                  <div className="checkbox-group">
                    {values.map((value) => (
                      <label key={value} className="checkbox-label">
                        <input
                          type="checkbox"
                          name={category}
                          value={value}
                          checked={selectedOptions[category] === value}
                          onChange={() => handleOptionChange(category, value)}
                        />
                        {value}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 🔢 Quantity Counter */}
          <div className="quantity-control">
            <button onClick={decreaseQuantity}>−</button>
            <span>{quantity}</span>
            <button onClick={increaseQuantity}>+</button>
          </div>

          {/* 🛒 Add to Cart */}
          <button
            onClick={handleAddToCart}
            disabled={product.availability !== "In Stock"}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
