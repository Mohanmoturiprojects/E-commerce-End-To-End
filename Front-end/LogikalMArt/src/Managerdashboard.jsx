import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Manager.css";

const Managerdashboard = () => {
  const [view, setView] = useState("products");
  const [data, setData] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    catagory: "",
    price: "",
    description: "",
    availability: "",
  });
  const [editId, setEditId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData(view);
  }, [view]);

  const fetchData = async (type) => {
    let endpoint = "";
    if (type === "products") endpoint = "/api/manager/products";
    else if (type === "users") endpoint = "/api/manager/users";
    else if (type === "orders") endpoint = "/api/manager/orders";

    try {
      const res = await axios.get(`http://localhost:8081${endpoint}`);
      setData(res.data || []);
    } catch (err) {
      console.error("❌ Error fetching:", err);
      setData([]);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAdd = async () => {
    try {
      await axios.post("http://localhost:8081/api/manager/products", formData);
      alert("✅ Product added successfully!");
      resetForm();
      fetchData("products");
    } catch (err) {
      console.error(err);
      alert("❌ Error adding product");
    }
  };

  const handleEdit = (id) => {
    const item = data.find((d) => d.id === id);
    if (item) {
      setFormData(item);
      setEditId(id);
    }
  };

  const handleUpdate = async () => {
    try {
      await axios.put(
        `http://localhost:8081/api/manager/products/${editId}`,
        formData
      );
      alert("✅ Product updated successfully!");
      resetForm();
      fetchData("products");
    } catch (err) {
      console.error(err);
      alert("❌ Error updating product");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await axios.delete(`http://localhost:8081/api/manager/products/${id}`);
      alert("🗑️ Product deleted successfully!");
      fetchData("products");
    } catch (err) {
      console.error(err);
      alert("❌ Error deleting product");
    }
  };

  const handleAddUser = () => {
    navigate("/register");
  };

  const handleRemoveUser = async (id) => {
    if (!window.confirm("Remove this user?")) return;
    try {
      await axios.delete(`http://localhost:8081/api/manager/users/${id}`);
      alert("✅ User removed successfully!");
      fetchData("users");
    } catch (err) {
      console.error(err);
      alert("❌ Error removing user");
    }
  };

  // ✅ FIXED: Update Role logic
  const handleUpdateRole = async (userId) => {
    const newRole = prompt("Enter new role ");
    if (!newRole) return;

    try {
      const response = await axios.put(
        `http://localhost:8081/api/manager/users/${userId}/role`,
        { newRole }
      );

      console.log("✅ Role Update Response:", response.data);
      alert("✅ Role updated successfully!");
      fetchData("users");
    } catch (err) {
      console.error("❌ Error updating role:", err);
      alert("❌ Error updating role");
    }
  };

  const handleUpdateOrder = async (id) => {
    const newStatus = prompt("Enter new status (Pending, Shipped, Delivered):");
    if (!newStatus) return;

    try {
      await axios.put(`http://localhost:8081/api/manager/orders/${id}`, {
        status: newStatus,
        delivered_at:
          newStatus.toLowerCase() === "delivered"
            ? new Date().toISOString()
            : null,
      });
      alert("✅ Order status updated!");
      fetchData("orders");
    } catch (err) {
      console.error(err);
      alert("❌ Error updating order status");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      catagory: "",
      price: "",
      description: "",
      availability: "",
    });
    setEditId(null);
  };

  return (
    <div className="manager-container">
      <h2>🧑‍💼 Manager Dashboard</h2>

      <select
        className="dropdown"
        value={view}
        onChange={(e) => setView(e.target.value)}
      >
        <option value="products">Products</option>
        <option value="orders">Orders</option>
        <option value="users">Users</option>
      </select>

      {view === "products" && (
        <div className="product-form">
          <input
            type="text"
            name="name"
            placeholder="Product Name"
            value={formData.name}
            onChange={handleChange}
          />
          <input
            type="text"
            name="catagory"
            placeholder="Category"
            value={formData.catagory}
            onChange={handleChange}
          />
          <input
            type="number"
            name="price"
            placeholder="Price"
            value={formData.price}
            onChange={handleChange}
          />
          <input
            type="text"
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
          />
          <input
            type="text"
            name="availability"
            placeholder="Availability"
            value={formData.availability}
            onChange={handleChange}
          />

          {editId ? (
            <button className="update-btn" onClick={handleUpdate}>
              🔄 Update Product
            </button>
          ) : (
            <button className="add-btn" onClick={handleAdd}>
              ➕ Add Product
            </button>
          )}
        </div>
      )}

      {view === "users" && (
        <div className="user-controls">
          <button className="add-btn" onClick={handleAddUser}>
            ➕ Add User
          </button>
        </div>
      )}

      <div className="manager-table">
        {data.length > 0 ? (
          <table>
            <thead>
              <tr>
                {Object.keys(data[0]).map((key) => (
                  <th key={key}>{key}</th>
                ))}
                {(view === "products" ||
                  view === "orders" ||
                  view === "users") && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.id}>
                  {Object.values(item).map((val, i) => (
                    <td key={i}>
                      {typeof val === "object" && val !== null
                        ? JSON.stringify(val)
                        : val}
                    </td>
                  ))}

                  {view === "products" && (
                    <td>
                      <button
                        className="edit-btn"
                        onClick={() => handleEdit(item.id)}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(item.id)}
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  )}

                  {view === "orders" && (
                    <td>
                      <button
                        className="update-btn"
                        onClick={() => handleUpdateOrder(item.id)}
                      >
                        🔄 Update Status
                      </button>
                    </td>
                  )}

                  {view === "users" && (
                    <td>
                      <button
                        className="update-btn"
                        onClick={() => handleUpdateRole(item.id)}
                      >
                        🧩 Update Role
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleRemoveUser(item.id)}
                      >
                        ❌ Remove
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No records found</p>
        )}
      </div>
    </div>
  );
};

export default Managerdashboard;
