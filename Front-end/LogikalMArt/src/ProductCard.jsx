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
    e.stopPropagation(); // Prevent navigation to product details

    if (product.availability !== "In Stock") {
      toast.error("Product out of stock ❌", { position: "bottom-right" });
      return;
    }

    // ✅ Include all important product details
    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      description: product.description,
      category: product.category,
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
        src={product.image}
        alt={product.name}
        className="product-img"
        onError={(e) => (e.target.src = "/images/default.jpg")}
      />

      <h3 className="product-name">{product.name}</h3>
      <p className="product-price">₹{product.price}</p>

      <p
        className={`availability ${
          product.availability === "In Stock" ? "in-stock" : "out-stock"
        }`}
      >
        {product.availability}
      </p>

      {/* 🛒 Add to Cart Button */}
      <button
        className="add-btn"
        onClick={handleAddToCart}
        disabled={product.availability !== "In Stock"}
      >
        Add to Cart
      </button>
    </div>
  );
};

export default ProductCard;
