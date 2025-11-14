import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { AddToCart, IncCart, DecCart } from "./store";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Chocolates.css";

const Chocolates = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart);
  const [chocolates, setChocolates] = useState([]);
  const [filteredChocolates, setFilteredChocolates] = useState([]);

  const [filters, setFilters] = useState({
    flavor: "",
    brand: "",
    type: "",
  });

  // Fetch chocolates
  useEffect(() => {
    axios
      .get("http://localhost:8081/api/products")
      .then((response) => {
        const chocolateData = response.data.filter(
          (product) => product.catagory === "Chocolates"
        );

        const updatedChocolates = chocolateData.map((item) => {
          let imagePath = "/Images/default-choco.jpg";

          if (item.name.toLowerCase().includes("joys")) imagePath = "/Kids/joys.webp";
          else if (item.name.toLowerCase().includes("milkey")) imagePath = "/Kids/milkey.webp";
          else if (item.name.toLowerCase().includes("snickers")) imagePath = "/Kids/snickers.webp";
          else if (item.name.toLowerCase().includes("bang")) imagePath = "/Kids/bang.webp";
          else if (item.name.toLowerCase().includes("Cookeis")) imagePath = "/Kids/Cookeis.webp";
         else if (item.name.toLowerCase().includes("choco")) imagePath = "/Kids/choco.webp";
         else if (item.name.toLowerCase().includes("kinder")) imagePath = "/Kids/kinder.webp";

          return { ...item, image: imagePath };
        });

        setChocolates(updatedChocolates);
        setFilteredChocolates(updatedChocolates);
      })
      .catch((error) => console.error(error));
  }, []);

  // Filter handler
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  // Apply filters
  useEffect(() => {
    let filtered = chocolates;

    if (filters.flavor) {
      filtered = filtered.filter(
        (c) => c.flavor?.toLowerCase() === filters.flavor.toLowerCase()
      );
    }

    if (filters.brand) {
      filtered = filtered.filter((c) =>
        c.name.toLowerCase().includes(filters.brand.toLowerCase())
      );
    }

    if (filters.type) {
      filtered = filtered.filter(
        (c) => c.type?.toLowerCase() === filters.type.toLowerCase()
      );
    }

    setFilteredChocolates(filtered);
  }, [filters, chocolates]);

  const getQuantity = (choco) => {
    const item = cartItems.find((i) => i.name === choco.name);
    return item ? item.quantity : 0;
  };

  const handleIncrement = (choco) => {
    setChocolates((prev) =>
      prev.map((c) => (c.id === choco.id && c.availability > 0 ? { ...c, availability: c.availability - 1 } : c))
    );

    if (choco.availability <= 0) {
      toast.error(`${choco.name} is out of stock!`, { position: "bottom-right", autoClose: 2000 });
      return;
    }

    const quantity = getQuantity(choco);
    if (quantity === 0) dispatch(AddToCart(choco));
    else dispatch(IncCart(choco));
  };

  const handleDecrement = (choco) => {
    const quantity = getQuantity(choco);
    if (quantity > 0) {
      dispatch(DecCart(choco));
      setChocolates((prev) =>
        prev.map((c) => (c.id === choco.id ? { ...c, availability: c.availability + 1 } : c))
      );
    }
  };

  return (
    <div className="chocolates-main">
      {/* Sidebar */}
      <aside className="sidebar">
        <h3>Filters</h3>

         <div className="filter-group">
          <label>Name</label>
          <select name="brand" onChange={handleFilterChange}>
            <option value="">All</option>
            <option value="joys">Joys</option>
            <option value="milkey">Milkey</option>
            <option value="snickers">Snickers</option>
            <option value="bang">Bang</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Flavor</label>
          <select name="flavor" onChange={handleFilterChange}>
            <option value="">All</option>
            <option value="Dark">Dark</option>
            <option value="Milk">Milk</option>
            <option value="White">White</option>
            <option value="Nuts">Nuts</option>
          </select>
        </div>

       

        <div className="filter-group">
          <label>Type</label>
          <select name="type" onChange={handleFilterChange}>
            <option value="">All</option>
            <option value="Bar">Bar</option>
            <option value="Box">Box</option>
            <option value="Truffle">Truffle</option>
          </select>
        </div>
      </aside>

      {/* Main Grid */}
      <div className="chocolates-container">
        <h2 className="chocolates-title">🍫 Chocolates Collection</h2>

        <div className="chocolates-grid">
          {filteredChocolates.map((choco) => (
            <div key={choco.id} className="choco-card">
              <img src={choco.image} alt={choco.name} className="choco-image" />
              <div className="choco-details">
                <h4 className="choco-name">{choco.name}</h4>
                <p className="choco-price">₹{choco.price.toLocaleString()}</p>
                {choco.availability > 0 ? (
                  <p className="choco-stock">🟢 In Stock: {choco.availability}</p>
                ) : (
                  <p className="choco-stock out">🔴 Out of Stock</p>
                )}
                <div className="quantity-controller">
                  <button className="quantity-btn" onClick={() => handleDecrement(choco)}>-</button>
                  <span className="quantity-value">{getQuantity(choco)}</span>
                  <button
                    className="quantity-btn"
                    onClick={() => handleIncrement(choco)}
                    disabled={choco.availability === 0}
                    style={{ backgroundColor: choco.availability === 0 ? "#ccc" : "#4CAF50", cursor: choco.availability === 0 ? "not-allowed" : "pointer" }}
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
    </div>
  );
};

export default Chocolates;
