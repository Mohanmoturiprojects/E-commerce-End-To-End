import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { useInView } from "react-intersection-observer";
import "./Home.css";
import ProductCard from "./ProductCard";

const Home = () => {
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [delaying, setDelaying] = useState(false); // 👈 to show loading text during delay

  const limit = 10; // products per fetch
  const timerRef = useRef(null);
  const { ref, inView } = useInView({ threshold: 0 });

  // ✅ Fetch function
  const fetchProducts = async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    try {
      const res = await axios.get(
        `http://localhost:8081/api/products/paginated?page=${page}&limit=${limit}`
      );
      const data = res.data;

      setProducts((prev) => {
        const uniqueNewProducts = data.products.filter(
          (p) => !prev.some((existing) => existing.id === p.id)
        );

        if (prev.length + uniqueNewProducts.length >= data.total) {
          setHasMore(false);
        }

        return [...prev, ...uniqueNewProducts];
      });

      setPage((prev) => prev + 1);
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Initial load
  useEffect(() => {
    fetchProducts();
  }, []);

  // ✅ Infinite scroll with delay
  useEffect(() => {
    if (inView && hasMore && !loading && !timerRef.current) {
      setDelaying(true);
      timerRef.current = setTimeout(() => {
        fetchProducts();
        timerRef.current = null;
        setDelaying(false);
      }, 1500); // delay before loading next 10
    }

    // Cleanup timer if user scrolls away
    if ((!inView || loading) && timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
      setDelaying(false);
    }
  }, [inView, hasMore, loading]);

  // ✅ Message display from redirect
  useEffect(() => {
    if (location.state?.message) {
      setMessage(location.state.message);
      window.history.replaceState({}, document.title);
      setTimeout(() => setMessage(""), 3000);
    }
  }, [location.state]);

  return (
    <div className="home-container">
      {message && <div className="success-banner">{message}</div>}

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

        {/* ✅ Show loading during delay or actual fetch */}
        {(loading || delaying) && (
          <p className="loading-text">Loading...</p>
        )}

        {/* Trigger next fetch */}
        <div ref={ref} className="scroll-trigger" />

        {/* ✅ Show when all products are fetched */}
        {!hasMore && products.length > 0 && (
          <p className="no-more-text">No more products</p>
        )}
      </div>
    </div>
  );
};

export default Home;
