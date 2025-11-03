import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Home.css";
import HomeCarousel from "./HomeCarousel ";
import ProductCard from "./ProductCard";



const Home = () => {
  const [products, setProducts] = useState([]);

  // ✅ Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("http://localhost:8081/api/products");
        setProducts(res.data);
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="home-container">
      {/* ====== Top Section: Carousel ====== */}

      {/* ====== Bottom Section: Products ====== */}
      <div className="products-section">
        <h2 className="section-title">All Products</h2>
        <div className="products-grid">
          {products.length > 0 ? (
            products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <p className="no-products">No products found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
