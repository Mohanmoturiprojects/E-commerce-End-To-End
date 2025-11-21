import React, { useEffect, useState } from "react";
import axios from "axios";
import ProductCard from "./ProductCard";
import "./Electronics.css";

const Womens = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:8081/products/categoryparent/Womens")
      .then(res => setProducts(res.data))
      .catch(err => console.log(err));
  }, []);

  return (
    <div className="electronics-page">
      <h2 className="title">Womens</h2>

      <div className="products-grid">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
};

export default Womens;
