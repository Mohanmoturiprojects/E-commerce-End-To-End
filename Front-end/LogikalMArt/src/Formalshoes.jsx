import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { AddToCart, IncCart, DecCart } from "./Store";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Formalshoes.css";

const Formalshoes = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart);
  const [shoes, setShoes] = useState([]);
  const [filteredShoes, setFilteredShoes] = useState([]);

  const [filters, setFilters] = useState({
    color: "",
    brand: "",
    type: "",
  });

  // ✅ Fetch formal shoes from backend
  useEffect(() => {
    axios
      .get("http://localhost:8081/api/products")
      .then((response) => {
        const shoeData = response.data.filter(
          (product) => product.catagory === "FormalShoes"
        );

        // ✅ Dynamically assign image paths
        const updatedShoes = shoeData.map((item) => {
          let imagePath = "/Images/default.jpg";
          const name = item.name.toLowerCase();

          if (name.includes("bata")) imagePath = "/Shoes/bata.jpg";
          else if (name.includes("bata")) imagePath = "/Shoes/bata.jpg";
          else if (name.includes("red tape")) imagePath = "/Shoes/red tape.webp";
          else if (name.includes("clarks")) imagePath = "/Shoes/clarks.webp";
          else if (name.includes("woodland")) imagePath = "/Shoes/woodland.webp";
          else if (name.includes("hush puppies")) imagePath = "/Shoes/hush puppies.webp";
          else if (name.includes("lee coppeer")) imagePath = "/Shoes/lee coppeer.webp";
          else if (name.includes("oxford")) imagePath = "/Shoes/oxford.webp";
         else if (name.includes("corbett")) imagePath = "/Shoes/corbett.webp";
             

          return { ...item, image: imagePath };
        });

        setShoes(updatedShoes);
        setFilteredShoes(updatedShoes);
      })
      .catch((error) => {
        console.error("Error fetching formal shoes:", error);
      });
  }, []);

  // ✅ Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  // ✅ Apply filters dynamically
  useEffect(() => {
    let filtered = shoes;

    if (filters.color) {
      filtered = filtered.filter(
        (s) =>
          s.color && s.color.toLowerCase() === filters.color.toLowerCase()
      );
    }

    if (filters.brand) {
      filtered = filtered.filter((s) =>
        s.name.toLowerCase().includes(filters.brand.toLowerCase())
      );
    }

    if (filters.type) {
      filtered = filtered.filter(
        (s) => s.type && s.type.toLowerCase() === filters.type.toLowerCase()
      );
    }

    setFilteredShoes(filtered);
  }, [filters, shoes]);

  // ✅ Get cart quantity
  const getQuantity = (shoe) => {
    const item = cartItems.find((i) => i.name === shoe.name);
    return item ? item.quantity : 0;
  };

  // ✅ Increment cart item
  const handleIncrement = (shoe) => {
    setShoes((prev) =>
      prev.map((s) => {
        if (s.id === shoe.id && s.availability > 0) {
          return { ...s, availability: s.availability - 1 };
        }
        return s;
      })
    );

    if (shoe.availability <= 0) {
      toast.error(`${shoe.name} is out of stock!`, {
        position: "bottom-right",
        autoClose: 2000,
      });
      return;
    }

    const quantity = getQuantity(shoe);
    if (quantity === 0) {
      dispatch(AddToCart(shoe));
      toast.success(`${shoe.name} added to cart!`, {
        position: "bottom-right",
        autoClose: 2000,
      });
    } else {
      dispatch(IncCart(shoe));
    }
  };

  // ✅ Decrement cart item
  const handleDecrement = (shoe) => {
    const quantity = getQuantity(shoe);
    if (quantity > 0) {
      dispatch(DecCart(shoe));

      setShoes((prev) =>
        prev.map((s) => {
          if (s.id === shoe.id) {
            return { ...s, availability: s.availability + 1 };
          }
          return s;
        })
      );
    }
  };

  return (
    <div className="formal-main">
      {/* Sidebar */}
      <aside className="sidebar">
        <h3>Filters</h3>

        <div className="filter-group">
          <label>Color</label>
          <select name="color" onChange={handleFilterChange}>
            <option value="">All</option>
            <option value="Black">Black</option>
            <option value="Brown">Brown</option>
            <option value="Tan">Tan</option>
            <option value="Gray">Gray</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Brand</label>
          <select name="brand" onChange={handleFilterChange}>
            <option value="">All</option>
            <option value="Bata">Bata</option>
            <option value="Red Tape">Red Tape</option>
            <option value="Hush Puppies">Hush Puppies</option>
            <option value="Clarks">Clarks</option>
            <option value="Lee Cooper">Lee Cooper</option>
            <option value="Woodland">Woodland</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Type</label>
          <select name="type" onChange={handleFilterChange}>
            <option value="">All</option>
            <option value="Lace-up">Lace-up</option>
            <option value="Slip-on">Slip-on</option>
            <option value="Loafers">Loafers</option>
            <option value="Derby">Derby</option>
            <option value="Oxford">Oxford</option>
          </select>
        </div>
      </aside>

      {/* Main Content */}
      <div className="formal-container">
        <h2 className="formal-title">👞 Formal Shoes</h2>
        <div className="formal-grid">
          {filteredShoes.map((shoe) => (
            <div key={shoe.id} className="formal-card">
              <div className="formal-image-wrapper">
                <img
                  src={shoe.image}
                  alt={shoe.name}
                  className="formal-image"
                />
              </div>
              <div className="formal-details">
                <h4 className="formal-name">{shoe.name}</h4>
                <p className="formal-price">₹{shoe.price.toLocaleString()}</p>

                {shoe.availability > 0 ? (
                  <p className="formal-stock">
                    🟢 In Stock: {shoe.availability}
                  </p>
                ) : (
                  <p className="formal-stock out">🔴 Out of Stock</p>
                )}

                <div className="quantity-controller">
                  <button
                    className="quantity-btn"
                    onClick={() => handleDecrement(shoe)}
                  >
                    -
                  </button>
                  <span className="quantity-value">{getQuantity(shoe)}</span>
                  <button
                    className="quantity-btn"
                    onClick={() => handleIncrement(shoe)}
                    disabled={shoe.availability === 0}
                    style={{
                      backgroundColor:
                        shoe.availability === 0 ? "#ccc" : "#4CAF50",
                      cursor:
                        shoe.availability === 0 ? "not-allowed" : "pointer",
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
    </div>
  );
};

export default Formalshoes;
