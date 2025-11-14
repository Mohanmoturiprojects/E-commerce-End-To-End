import React, { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Delivery.css";

const DeliveryDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const baseURL = "http://localhost:8081/api/delivery";

  // ✅ Fetch all orders
  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${baseURL}/orders`);
      setOrders(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to fetch orders");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // ✅ Accept Order (status → Shipped)
  const handleAccept = async (id) => {
    try {
      await axios.patch(`${baseURL}/orders/${id}/accept`);
      toast.success("✅ Order marked as Shipped");
      fetchOrders();
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to update status");
    }
  };

  // ✅ Deliver Order with confirmation
  const handleDeliver = async (id) => {
    const confirmDeliver = window.confirm("Are you sure you want to deliver this order?");
    if (!confirmDeliver) return;

    try {
      await axios.patch(`${baseURL}/orders/${id}/deliver`);
      toast.success("✅ Order marked as Delivered");
      fetchOrders();
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to deliver order");
    }
  };

  return (
    <div className="delivery-dashboard">
      <h2 className="title">📦 Delivery Dashboard</h2>

      {loading ? (
        <p className="loading">Loading orders...</p>
      ) : (
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Placed At</th>
              <th>Customer Name</th>
              <th>Address</th>
              <th>Product</th>
              <th>Quantity</th>
              <th>Total Price</th>
              <th>Status</th>
              <th>Delivered At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td>{new Date(o.created_at).toLocaleString()}</td>

                {/* ✅ Customer Details */}
                <td>{o.orderUser?.firstName || "N/A"}</td>
                <td>{o.orderUser?.address || "N/A"}</td>

                {/* ✅ Product */}
                <td>{o.orderProduct?.name || "N/A"}</td>

                <td>{o.quantity}</td>
                <td>₹{o.total_price}</td>

                <td
                  className={`status ${
                    o.status === "Pending"
                      ? "pending"
                      : o.status === "Shipped"
                      ? "shipped"
                      : "delivered"
                  }`}
                >
                  {o.status}
                </td>

                <td>
                  {o.delivered_at
                    ? new Date(o.delivered_at).toLocaleString()
                    : "-"}
                </td>

                <td>
                  {o.status === "Pending" && (
                    <button
                      className="btn accept"
                      onClick={() => handleAccept(o.id)}
                    >
                      Accept
                    </button>
                  )}
                  {o.status === "Shipped" && (
                    <button
                      className="btn deliver"
                      onClick={() => handleDeliver(o.id)}
                    >
                      Deliver
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <ToastContainer position="bottom-right" autoClose={2000} />
    </div>
  );
};

export default DeliveryDashboard;
