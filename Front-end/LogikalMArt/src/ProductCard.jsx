import React from "react";
import { useDispatch } from "react-redux";
import { AddToCart } from "./store";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import "./ProductCard.css";

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // 🛒 Add to cart functionality
  const handleAddToCart = (e) => {
    e.stopPropagation(); // Prevent navigating to product details

    if (!product.availability) {
      toast.error("❌ Product out of stock", { position: "bottom-right" });
      return;
    }

    // ✅ Include all important product details
    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      description: product.description,
      category: product.catagory, 
      quantity: 1,
      availability: product.availability,
    };

    // ✅ Dispatch to Redux store
    dispatch(AddToCart(cartItem));

    // ✅ Toast confirmation
    toast.success(`${product.name} added to cart 🛒`, {
      position: "bottom-right",
    });
  };

  // 🔗 Navigate to product details page
  const handleCardClick = () => {
    navigate(`/product/${product.id}`);
  };

  return (
    <div className="product-card" onClick={handleCardClick}>
      <img
        src={ "/images/default.jpg"}
        alt={product.name}
        className="product-img"
      />

      <h3 className="product-name">{product.name}</h3>
      <p className="product-price">₹{product.price}</p>

      <p
        className={`availability ${
          product.availability ? "in-stock" : "out-stock"
        }`}
      >
        {product.availability ? "In Stock" : "Out of Stock"}
      </p>

      {/* 🛒 Add to Cart Button */}
      <button
        className="add-btn"
        onClick={handleAddToCart}
        disabled={!product.availability}
      >
        Add to Cart
      </button>
    </div>
  );
};

export default ProductCard;
