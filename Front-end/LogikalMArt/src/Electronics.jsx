import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import ProductCard from "./ProductCard";
import { useInView } from "react-intersection-observer";
import "./Electronics.css";

const Electronics = () => {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [delaying, setDelaying] = useState(false);

  const limit = 10;
  const timerRef = useRef(null);
  const { ref, inView } = useInView({ threshold: 0 });

  const fetchElectronics = async () => {
    if (loading || !hasMore) return;

    setLoading(true);

    try {
      const res = await axios.get(
        `http://localhost:8081/products/categoryparent/Electronics?page=${page}&limit=${limit}`
      );

      const data = res.data;

      // ✔ Case 1: Backend sends plain array (no pagination)
      if (Array.isArray(data)) {
        setProducts(data);
        setHasMore(false);
        return;
      }

      // ✔ Case 2: Backend sends paginated result
      if (!data.products || !Array.isArray(data.products)) {
        console.error("Invalid API response:", data);
        return;
      }

      setProducts((prev) => {
        const uniqueNewProducts = data.products.filter(
          (p) => !prev.some((ex) => ex.id === p.id)
        );

        if (prev.length + uniqueNewProducts.length >= data.total) {
          setHasMore(false);
        }

        return [...prev, ...uniqueNewProducts];
      });

      setPage((prev) => prev + 1);
    } catch (err) {
      console.log("Error fetching electronics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchElectronics();
  }, []);

  useEffect(() => {
    if (inView && hasMore && !loading && !timerRef.current) {
      setDelaying(true);

      timerRef.current = setTimeout(() => {
        fetchElectronics();
        timerRef.current = null;
        setDelaying(false);
      }, 1500);
    }

    if ((!inView || loading) && timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
      setDelaying(false);
    }
  }, [inView, hasMore, loading]);

  return (
    <div className="electronics-page">
      <h2 className="title">Electronics</h2>

      <div className="products-grid">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      {(loading || delaying) && <p className="loading-text">Loading...</p>}

      <div ref={ref} className="scroll-trigger" />

      {!hasMore && products.length > 0 && (
        <p className="no-more-text">No more products</p>
      )}
    </div>
  );
};

export default Electronics;
