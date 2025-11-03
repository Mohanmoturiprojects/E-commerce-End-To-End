import React, { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Delivery.css";

const DeliveryDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pinInput, setPinInput] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [showPinModal, setShowPinModal] = useState(false);

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

  // ✅ Open PIN modal for delivery
  const handleDeliverClick = (id) => {
    setSelectedOrderId(id);
    setShowPinModal(true);
  };

  // ✅ Confirm Delivery with PIN
  const handleDeliverConfirm = async () => {
    if (!pinInput.trim()) {
      toast.warn("⚠️ Enter PIN");
      return;
    }

    try {
      await axios.patch(`${baseURL}/orders/${selectedOrderId}/deliver`, {
        pin: pinInput,
      });

      toast.success("✅ Order marked as Delivered");
      setShowPinModal(false);
      setPinInput("");
      fetchOrders();
    } catch (err) {
      console.error(err);
      if (err.response?.status === 403) {
        toast.error("❌ Invalid PIN");
      } else {
        toast.error("❌ Failed to deliver order");
      }
    }
  };

  // ✅ Close PIN modal
  const closeModal = () => {
    setShowPinModal(false);
    setPinInput("");
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
              <th>Customer</th>
              <th>Product</th>
              <th>Quantity</th>
              <th>Total Price</th>
              <th>Status</th>
              <th>Delivered At</th> {/* ✅ Column label updated */}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td>{o.customer}</td>
                <td>{o.product}</td>
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
                      onClick={() => handleDeliverClick(o.id)}
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

      {/* ✅ PIN Modal */}
      {showPinModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Enter Delivery PIN</h3>
            <input
              type="password"
              placeholder="Enter PIN (LOGIKAL)"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
            />
            <div className="modal-actions">
              <button className="btn confirm" onClick={handleDeliverConfirm}>
                Confirm
              </button>
              <button className="btn cancel" onClick={closeModal}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="bottom-right" autoClose={2000} />
    </div>
  );
};

export default DeliveryDashboard;
