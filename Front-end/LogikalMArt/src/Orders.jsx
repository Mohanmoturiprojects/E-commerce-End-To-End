import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { SetOrders } from "./store";
import "./Orders.css";

function Orders() {
  const dispatch = useDispatch();
  const orders = useSelector((state) => state.orders);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Get logged-in username safely from localStorage (JSON user object)
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const username = storedUser?.username || storedUser?.email || null;

  useEffect(() => {
    if (!username) {
      console.warn("⚠️ No username found in localStorage");
      setLoading(false);
      return;
    }

    // ✅ Fetch orders for the specific logged-in user
    const fetchOrders = async () => {
      try {
        const res = await fetch(
          `http://localhost:8081/api/orders/user/${username}`
        );
        const data = await res.json();

        if (data.success) {
          // Group results by order_id so each order can have multiple items
          const groupedOrders = data.orders.reduce((acc, item) => {
            const order = acc.find((o) => o.id === item.order_id);
            if (order) {
              order.items.push(item);
            } else {
              acc.push({
                id: item.order_id,
                date: item.created_at,
                totalAmount: item.total_price,
                status: item.status,
                deliveredAt: item.delivered_at, // ✅ include delivery date
                items: [item],
              });
            }
            return acc;
          }, []);

          dispatch(SetOrders(groupedOrders));
        } else {
          dispatch(SetOrders([]));
        }
      } catch (error) {
        console.error("❌ Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [username, dispatch]);

  const toggleExpand = (index) => {
    setExpandedOrder((prev) => (prev === index ? null : index));
  };

  if (loading) {
    return <p className="loading">Loading your orders...</p>;
  }

  return (
    <div className="orders-container">
      <h2 className="orders-title">📜 My Orders</h2>

      {orders.length === 0 ? (
        <p className="empty-message">You haven't placed any orders yet.</p>
      ) : (
        <div className="order-cards">
          {orders.map((order, index) => (
            <div className="order-card" key={order.id || index}>
              <div className="order-header" onClick={() => toggleExpand(index)}>
                <div className="order-info">
                  <h4>Order #{order.id}</h4>
                  <span>{new Date(order.date).toLocaleString()}</span>
                </div>

                {/* ✅ Order status badge */}
                <span
                  className={`status-badge ${
                    order.status?.toLowerCase() || "pending"
                  }`}
                >
                  {order.status || "Pending"}
                </span>

                <button className="expand-btn">
                  {expandedOrder === index ? "▲ Hide" : "▼ Show"}
                </button>
              </div>

              {expandedOrder === index && (
                <div className="order-body">
                  {order.items.map((item, i) => (
                    <div className="order-item" key={i}>
                      <div className="item-info">
                        <p>
                          <strong>{item.product_name}</strong>
                        </p>
                        <p>Category: {item.catagory}</p>
                        <p>Price: ₹{item.product_price}</p>
                        <p>Quantity: {item.quantity}</p>
                        <p>Total: ₹{item.total_price}</p>
                      </div>
                    </div>
                  ))}

                  {/* ✅ Show Delivered At info */}
                  {order.deliveredAt && (
                    <p className="delivered-date">
                      📦 Delivered On:{" "}
                      <strong>
                        {new Date(order.deliveredAt).toLocaleString()}
                      </strong>
                    </p>
                  )}

                  <div className="order-footer">
                    <h4>Total Paid: ₹{order.totalAmount}</h4>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Orders;
