// SearchResults.jsx
import React from "react";
import { useLocation } from "react-router-dom";
import ProductCard from "./ProductCard";
import "./SearchResults.css";

const SearchResults = () => {
  const location = useLocation();
  const results = location.state?.results || [];
  const query = new URLSearchParams(location.search).get("q");

  return (
    <div className="products-section">
      <h2 className="section-title">
        Search Results {query ? `for "${query}"` : ""}
      </h2>

      <div className="products-grid">
        {results.length > 0 ? (
          results.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        ) : (
          <p className="no-products">No products found.</p>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
