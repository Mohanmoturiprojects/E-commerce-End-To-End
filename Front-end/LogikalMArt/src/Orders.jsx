import React, { useState, useEffect } from "react";
import "./Orders.css";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Get logged-in user
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const username = storedUser?.username || storedUser?.email || null;

  useEffect(() => {
    if (!username) {
      console.warn("⚠️ No username found in localStorage");
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await fetch(`http://localhost:8081/api/orders/user/${username}`);
        const data = await res.json();

        if (data.success) {
          setOrders(data.orders);
        } else {
          setOrders([]);
        }
      } catch (error) {
        console.error("❌ Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [username]);

  if (loading) {
    return <p className="loading">Loading your orders...</p>;
  }

  return (
    <div className="orders-container">
      <h2 className="orders-title">📦 My Orders</h2>

      {orders.length === 0 ? (
        <p className="empty-message">You haven’t placed any orders yet.</p>
      ) : (
        <>
          <p className="order-count">Total Orders: {orders.length}</p>

          <table className="orders-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Product</th>
                <th>Category</th>
                <th>Qty</th>
                <th>Unit Price (₹)</th>
                <th>Total (₹)</th>
                <th>Status</th>
                <th>Ordered On</th>
              </tr>
            </thead>
<tbody>
  {orders.map((order) => (
    <tr key={order.id}>
      <td>{order.id}</td>
      <td>{order.product?.name || "N/A"}</td>
      <td>{order.product?.catagory || "N/A"}</td>
      <td>{order.quantity}</td>
      <td>{order.product?.price || "N/A"}</td>
      <td>{order.total_price}</td>
      <td>
        <span className={`status-badge ${order.status?.toLowerCase()}`}>
          {order.status}
        </span>
      </td>
      <td>{new Date(order.created_at).toLocaleString()}</td>
    </tr>
  ))}
</tbody>

          </table>
        </>
      )}
    </div>
  );
}

export default Orders;
