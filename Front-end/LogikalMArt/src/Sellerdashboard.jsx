import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Seller.css";

const Sellerdashboard = () => {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    name: "",
    catagory: "",
    price: "",
    description: "",
    availability: "",
  });
  const [editingId, setEditingId] = useState(null);

  // ✅ Fetch all products
  const fetchProducts = async () => {
    const res = await axios.get("http://localhost:8081/api/seller");
    setProducts(res.data);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ✅ Handle input changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ Submit form (Add or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`http://localhost:8081/api/seller/${editingId}`, form);
        alert("✅ Product updated");
        setEditingId(null);
      } else {
        await axios.post("http://localhost:8081/api/seller", form);
        alert("✅ Product added");
      }
      setForm({
        name: "",
        catagory: "",
        price: "",
        description: "",
        availability: "",
      });
      fetchProducts();
    } catch (err) {
      console.error("❌ Error submitting product:", err);
      alert("Error while saving product");
    }
  };

  // ✅ Edit product
  const handleEdit = (product) => {
    setForm(product);
    setEditingId(product.id);
  };

  // ✅ Delete product
  const handleDelete = async (id) => {
    if (window.confirm("Delete this product?")) {
      await axios.delete(`http://localhost:8081/api/seller/${id}`);
      alert("🗑️ Product deleted");
      fetchProducts();
    }
  };

  // ✅ Patch price or availability
  const handlePatch = async (id, field) => {
    const value = prompt(`Enter new ${field}:`);
    if (value) {
      await axios.patch(`http://localhost:8081/api/seller/${id}`, {
        [field]: value,
      });
      alert(`✅ ${field} updated`);
      fetchProducts();
    }
  };

  return (
    <div className="seller-container">
      <h2>🛍️ Seller Dashboard</h2>

      {/* Product Form */}
      <form onSubmit={handleSubmit} className="seller-form">
        <input
          type="text"
          name="name"
          placeholder="Product Name"
          value={form.name}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="catagory"
          placeholder="Catagory"
          value={form.catagory}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="price"
          placeholder="Price"
          value={form.price}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="availability"
          placeholder="Availability"
          value={form.availability}
          onChange={handleChange}
        />
        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
        ></textarea>
        <button type="submit" className="save-btn">
          {editingId ? "Update Product" : "Add Product"}
        </button>
      </form>

      {/* Product Table */}
      <table className="seller-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Catagory</th>
            <th>Price</th>
            <th>Availability</th>
            <th>Actions</th>
            <th>Patch</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.name}</td>
              <td>{p.catagory}</td>
              <td>{p.price}</td>
              <td>{p.availability}</td>
              <td>
                <button onClick={() => handleEdit(p)} className="edit-btn">
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="delete-btn"
                >
                  Delete
                </button>
              </td>
              <td>
                <button
                  onClick={() => handlePatch(p.id, "price")}
                  className="patch-btn"
                >
                  Change Price
                </button>
                <button
                  onClick={() => handlePatch(p.id, "availability")}
                  className="patch-btn"
                >
                  Change Availability
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Sellerdashboard;
