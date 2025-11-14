import React, { useRef, useState, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AddOrder, ClearCart, DecCart, IncCart, RemoveFromCart, SetCart,} from "./store";
import "./Cart.css";
import QRCode from "react-qr-code";
import emailjs from "emailjs-com";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ReactCanvasConfetti from "react-canvas-confetti";

function Cart() {
  const cartItems = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [redirectMessage, setRedirectMessage] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [manualDiscount, setManualDiscount] = useState(0);
  const [couponDiscount, setCouponDiscount] = useState(0);

  const couponCodeRef = useRef();
  const confettiInstance = useRef(null);

  // ✅ Get logged-in user from localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  const username = user?.username || "guest";
  const userEmail = user?.username || user?.email; // use username/email automatically

  /* ------------------ 🧩 Load user-specific cart ------------------ */
  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem(`cart_${username}`)) || [];
    if (storedCart.length > 0) {
      dispatch(SetCart(storedCart));
    }
  }, [dispatch, username]);

  /* ------------------ 💾 Save user-specific cart ------------------ */
  useEffect(() => {
    localStorage.setItem(`cart_${username}`, JSON.stringify(cartItems));
  }, [cartItems, username]);

  /* ------------------ 🎉 Confetti ------------------ */
  const getConfettiInstance = useCallback((instance) => {
    confettiInstance.current = instance;
  }, []);

  const fireConfetti = useCallback(() => {
    if (!confettiInstance.current) return;
    confettiInstance.current({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
    });
  }, []);

  /* ------------------ 🎟️ Coupon Handling ------------------ */
  const handleApplyCoupon = () => {
    const enteredCode = couponCodeRef.current.value.trim().toUpperCase();
    switch (enteredCode) {
      case "MOHAN10":
        setCouponDiscount(10);
        break;
      case "MOHAN20":
        setCouponDiscount(20);
        break;
      case "MOHAN30":
        setCouponDiscount(30);
        break;
      default:
        alert("INVALID COUPON CODE");
        setCouponDiscount(0);
    }
  };

  /* ------------------ 🧾 Totals ------------------ */
  const calculateTotals = () => {
    const total = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const totalDiscountPercent = manualDiscount + couponDiscount;
    const discountAmount = (total * totalDiscountPercent) / 100;
    const discountedPrice = total - discountAmount;
    const tax = (discountedPrice * 5) / 100;
    const finalAmount = discountedPrice + tax;
    return { total, discountAmount, tax, finalAmount };
  };

  const { total, discountAmount, tax, finalAmount } = calculateTotals();

  /* ------------------ 💰 Payment + Email + Save Order ------------------ */
  const handleCompletePurchase = async () => {
    if (!user) {
      toast.error("❌ Please login first to place your order.");
      navigate("/login");
      return;
    }

    try {
      const order_id = "ORD" + new Date().getTime();

      // 💌 Send confirmation email automatically to logged-in user
      const templateParams = {
        order_id: order_id,
        orders: cartItems.map((item) => ({
          name: item.name,
          price: (item.price * item.quantity).toFixed(2),
          units: item.quantity,
          item: `<img src="${item.image}" alt="${item.name}" width="50" />`,
        })),
        cost: {
          shipping: 50,
          tax: tax.toFixed(2),
          total: finalAmount.toFixed(2),
        },
        email: userEmail,
      };

      const response = await emailjs.send(
        "service_u213ou9",
        "template_p97gy27",
        templateParams,
        "1M9nFDQPFQ8gHJrkc"
      );

      if (response.status === 200)
        toast.success("✅ Order confirmation email sent!");
      else toast.error("❌ Failed to send confirmation email");

      // ✅ Build Order Payload
      const orderPayload = {
        username: username,
        items: cartItems.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
          total_price: (item.price * item.quantity).toFixed(2),
        })),
      };

      console.log("📦 Sending order payload:", JSON.stringify(orderPayload, null, 2));

      const res = await axios.post(
        "http://localhost:8081/api/orders/add",
        orderPayload,
        { headers: { "Content-Type": "application/json" } }
      );

      if (res.status === 200 || res.status === 201) {
        toast.success("✅ Order saved to database!");
      } else {
        toast.error("❌ Failed to save order to database!");
      }

      // 🎉 Local actions after successful order
      const purchaseDetails = {
        id: order_id,
        user: username,
        items: cartItems,
        date: new Date().toLocaleString(),
        totalAmount: finalAmount,
        email: userEmail,
      };

      dispatch(AddOrder(purchaseDetails));
      toast.success("✅ Order placed successfully!");

      // Confetti celebration
      const duration = 3000;
      const end = Date.now() + duration;
      const interval = setInterval(() => {
        if (Date.now() > end) clearInterval(interval);
        else fireConfetti();
      }, 250);

      // Clear cart and redirect
      setTimeout(() => {
        dispatch(ClearCart());
        localStorage.removeItem(`cart_${username}`);
        setRedirectMessage("🔄 Redirecting to Orders...");
        setTimeout(() => navigate("/orders"), 2000);
      }, 1000);
    } catch (err) {
      toast.error("❌ Error saving order!");
      console.error("❌ Order Error:", err);
    }
  };

  const confirmPayment = () => {
    if (!paymentMethod) {
      alert("Please select a payment method.");
      return;
    }
    if (!paymentConfirmed) {
      alert("Please confirm payment before proceeding.");
      return;
    }
    handleCompletePurchase();
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
    setPaymentConfirmed(false);
  };

  /* ------------------ 🛒 JSX ------------------ */
  return (
    <div className="cart-container">
      <ReactCanvasConfetti
        refConfetti={getConfettiInstance}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      />

      <h1 className="cart-title" style={{ color: "orange" }}>
        🛒 {username}'s Shopping Cart
      </h1>

      {cartItems.length === 0 ? (
        <p className="empty-message" style={{ color: "red" }}>
          Your cart is empty.
        </p>
      ) : (
        <>
          <ul className="cart-list">
            {cartItems.map((item) => (
              <li key={item.id} className="cart-item">
                <img src={item.image} alt={item.name} className="cart-image" />
                <div className="cart-details">
                  <h3 className="item-name">{item.name}</h3>
                  <p className="item-price">
                    ₹{item.price} × {item.quantity} = ₹
                    {item.price * item.quantity}
                  </p>
                  <div className="cart-actions">
                    <button onClick={() => dispatch(IncCart(item))}>+</button>
                    <button onClick={() => dispatch(DecCart(item))}>-</button>
                    <button onClick={() => dispatch(RemoveFromCart(item))}>
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* 💸 Summary Section */}
          <div className="summary">
            <h3>Total Price: ₹{total.toFixed(2)}</h3>

            <div className="discount-section">
              <h4>Manual Discount:</h4>
              <div className="discount-buttons">
                <button onClick={() => setManualDiscount(10)}>APPLY10%</button>
                <button onClick={() => setManualDiscount(20)}>APPLY20%</button>
                <button onClick={() => setManualDiscount(30)}>APPLY30%</button>
              </div>

              <h4>Apply Coupon Code:</h4>
              <div className="coupon-row">
                <input
                  type="text"
                  ref={couponCodeRef}
                  placeholder="Enter Coupon Code"
                />
                <button onClick={handleApplyCoupon}>Apply Coupon</button>
              </div>

              {couponDiscount > 0 && (
                <p style={{ textAlign: "center", color: "#2ecc71" }}>
                  {couponDiscount}% coupon discount applied
                </p>
              )}
            </div>

            <h4>Discount: ₹{discountAmount.toFixed(2)}</h4>
            <h4>Tax (5%): ₹{tax.toFixed(2)}</h4>
            <h2 className="final-amount">
              Final Amount: ₹{finalAmount.toFixed(2)}
            </h2>

            {/* 💳 Payment Options */}
            <div className="payment-methods">
              <h3>Choose Payment Method</h3>
              <button onClick={() => handlePaymentMethodChange("UPI")}>
                UPI Payment
              </button>
              <button onClick={() => handlePaymentMethodChange("Card")}>
                Credit/Debit Card
              </button>
              <button onClick={() => handlePaymentMethodChange("Wallet")}>
                Wallet
              </button>
            </div>

            {paymentMethod === "UPI" && (
            < div className="upi-scanner-container">
                <h3>Scan to Pay via UPI</h3>
                <QRCode
                  value={`upi://pay?pa=8247858885@ybl&pn=Lohith%20Cart%20Craze&am=${finalAmount.toFixed(
                    2
                  )}&cu=INR`}
                />
                <label>
                  <input
                    type="checkbox"
                    checked={paymentConfirmed}
                    onChange={(e) => setPaymentConfirmed(e.target.checked)}
                  />{" "}
                  Payment Confirmed
                </label>
                <button onClick={confirmPayment}>Complete Purchase</button>
              </div>
            )}

            {paymentMethod === "Card" && (
              <div className="card-payment">
                <h3>Enter Card Details</h3>
                <input type="text" placeholder="Card Number" />
                <input type="text" placeholder="Expiry MM/YY" />
                <input type="text" placeholder="CVV" />
                <label>
                  <input
                    type="checkbox"
                    checked={paymentConfirmed}
                    onChange={(e) => setPaymentConfirmed(e.target.checked)}
                  />{" "}
                  Payment Confirmed
                </label>
                <button onClick={confirmPayment}>Complete Purchase</button>
              </div>
            )}

            {paymentMethod === "Wallet" && (
              <div className="wallet-payment">
                <h3>Wallet Payment</h3>
                <p>Pay via Paytm / Google Pay / PhonePe</p>
                <label>
                  <input
                    type="checkbox"
                    checked={paymentConfirmed}
                    onChange={(e) => setPaymentConfirmed(e.target.checked)}
                  />{" "}
                  Payment Confirmed
                </label>
                <button onClick={confirmPayment}>Complete Purchase</button>
              </div>
            )}
          </div>
          {redirectMessage && <p>{redirectMessage}</p>}
        </>
      )}
    </div>
  );
}

export default Cart;
