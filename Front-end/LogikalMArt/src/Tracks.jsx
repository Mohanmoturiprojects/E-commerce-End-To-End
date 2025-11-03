import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { AddToCart, IncCart, DecCart } from "./Store";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Tracks.css";

const Tracks = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart);
  const [tracks, setTracks] = useState([]);
  const [filteredTracks, setFilteredTracks] = useState([]);

  const [filters, setFilters] = useState({
    color: "",
    size: "",
    brand: "",
  });

  useEffect(() => {
    axios
      .get("http://localhost:8081/api/products") // backend URL
      .then((response) => {
        const trackData = response.data.filter(
          (product) => product.catagory === "tracks"
        );

        const updatedTracks = trackData.map((item) => {
          let imagePath = "/Images/default-track.jpg";

          if (item.name.toLowerCase().includes("neck"))
            imagePath = "/Mens/neck.webp";
          else if (item.name.toLowerCase().includes("sports"))
            imagePath = "/Mens/sports.webp";
          
          else if (item.name.toLowerCase().includes("adidas"))
            imagePath ="/Mens/adidas.webp";
           else if (item.name.toLowerCase().includes("reebok"))
            imagePath = "/Mens/reebok.webp";

          return { ...item, image: imagePath };
        });

        setTracks(updatedTracks);
        setFilteredTracks(updatedTracks);
      })
      .catch((error) => {
        console.error("Error fetching tracks:", error);
      });
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  useEffect(() => {
    let filtered = tracks;

    if (filters.color) {
      filtered = filtered.filter(
        (t) => t.color && t.color.toLowerCase() === filters.color.toLowerCase()
      );
    }

    if (filters.size) {
      filtered = filtered.filter(
        (t) => t.size && t.size.toLowerCase() === filters.size.toLowerCase()
      );
    }

    if (filters.brand) {
      filtered = filtered.filter((t) =>
        t.name.toLowerCase().includes(filters.brand.toLowerCase())
      );
    }

    setFilteredTracks(filtered);
  }, [filters, tracks]);

  const getQuantity = (track) => {
    const item = cartItems.find((i) => i.name === track.name);
    return item ? item.quantity : 0;
  };

  const handleIncrement = (track) => {
    setTracks((prev) =>
      prev.map((t) => {
        if (t.id === track.id && t.availability > 0) {
          return { ...t, availability: t.availability - 1 };
        }
        return t;
      })
    );

    if (track.availability <= 0) {
      toast.error(`${track.name} is out of stock!`, {
        position: "bottom-right",
        autoClose: 2000,
      });
      return;
    }

    const quantity = getQuantity(track);
    if (quantity === 0) {
      dispatch(AddToCart(track));
      toast.success(`${track.name} added to cart!`, {
        position: "bottom-right",
        autoClose: 2000,
      });
    } else {
      dispatch(IncCart(track));
    }
  };

  const handleDecrement = (track) => {
    const quantity = getQuantity(track);
    if (quantity > 0) {
      dispatch(DecCart(track));
      setTracks((prev) =>
        prev.map((t) => {
          if (t.id === track.id) {
            return { ...t, availability: t.availability + 1 };
          }
          return t;
        })
      );
    }
  };

  return (
    <div className="tracks-main">
      {/* Sidebar */}
      <aside className="sidebar">
        <h3>Filters</h3>

        <div className="filter-group">
          <label>Color</label>
          <select name="color" onChange={handleFilterChange}>
            <option value="">All</option>
            <option value="Black">Black</option>
            <option value="Gray">Gray</option>
            <option value="Blue">Blue</option>
            <option value="Red">Red</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Size</label>
          <select name="size" onChange={handleFilterChange}>
            <option value="">All</option>
            <option value="S">S</option>
            <option value="M">M</option>
            <option value="L">L</option>
            <option value="XL">XL</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Brand</label>
          <select name="brand" onChange={handleFilterChange}>
            <option value="">All</option>
            <option value="Nike">Nike</option>
            <option value="Adidas">Adidas</option>
            <option value="Puma">Puma</option>
            <option value="Reebok">Reebok</option>
          </select>
        </div>
      </aside>

      {/* Main content */}
      <div className="tracks-container">
        <h2 className="tracks-title">👖 Track Pants Collection</h2>
        <div className="tracks-grid">
          {filteredTracks.map((track) => (
            <div key={track.id} className="track-card">
              <div className="track-image-wrapper">
                <img src={track.image} alt={track.name} className="track-image" />
              </div>
              <div className="track-details">
                <h4 className="track-name">{track.name}</h4>
                <p className="track-price">₹{track.price.toLocaleString()}</p>

                {track.availability > 0 ? (
                  <p className="track-stock">🟢 In Stock: {track.availability}</p>
                ) : (
                  <p className="track-stock out">🔴 Out of Stock</p>
                )}

                <div className="quantity-controller">
                  <button
                    className="quantity-btn"
                    onClick={() => handleDecrement(track)}
                  >
                    -
                  </button>
                  <span className="quantity-value">{getQuantity(track)}</span>
                  <button
                    className="quantity-btn"
                    onClick={() => handleIncrement(track)}
                    disabled={track.availability === 0}
                    style={{
                      backgroundColor:
                        track.availability === 0 ? "#ccc" : "#4CAF50",
                      cursor:
                        track.availability === 0 ? "not-allowed" : "pointer",
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

export default Tracks;
