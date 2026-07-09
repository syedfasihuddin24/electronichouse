import { useState } from "react";

function generateOrderId() {
  return "EH" + Date.now().toString().slice(-8).toUpperCase();
}

// ─── CHECKOUT PAGE ──────────────────────────────────────
export function CheckoutPage({ cart, onBack, onOrderPlaced }) {
  const [form, setForm] = useState({
    name: "", phone: "", email: "",
    address: "", city: "", pincode: "", state: ""
  });
  const [payment, setPayment] = useState("cod");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const formatPrice = (p) => "₹" + p.toLocaleString("en-IN");
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const delivery = subtotal > 30000 ? 0 : 499;
  const total = subtotal + delivery;

  const validate = () => {
    const e = {};
    if (!form.name) e.name = "Name is required";
    if (!form.phone || form.phone.length < 10) e.phone = "Valid phone required";
    if (!form.address) e.address = "Address is required";
    if (!form.city) e.city = "City is required";
    if (!form.pincode || form.pincode.length < 6) e.pincode = "Valid pincode required";
    if (!form.state) e.state = "State is required";
    return e;
  };

  const handlePlaceOrder = () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setLoading(true);
    setTimeout(() => {
      const order = {
        id: generateOrderId(),
        items: cart,
        address: form,
        payment,
        subtotal,
        delivery,
        total,
        date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }),
        status: "placed"
      };
      onOrderPlaced(order);
      setLoading(false);
    }, 1500);
  };

  const paymentMethods = [
    { id: "cod", icon: "💵", label: "Cash on Delivery", desc: "Pay when your order arrives" },
    { id: "upi", icon: "📱", label: "UPI Payment", desc: "GPay, PhonePe, Paytm, BHIM" },
    { id: "card", icon: "💳", label: "Credit / Debit Card", desc: "Visa, Mastercard, RuPay" },
    { id: "netbanking", icon: "🏦", label: "Net Banking", desc: "All major banks supported" },
  ];

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <button className="checkout-back-btn" onClick={onBack}>← Back to Cart</button>
        <div className="checkout-grid">

          {/* LEFT — Forms */}
          <div>
            {/* Delivery Address */}
            <div className="checkout-card">
              <div className="checkout-card-header">📍 Delivery Address</div>
              <div className="checkout-card-body">
                <div className="checkout-form-grid">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Your full name" style={{ borderColor: errors.name ? "var(--danger)" : "" }} />
                    {errors.name && <small style={{ color: "var(--danger)" }}>{errors.name}</small>}
                  </div>
                  <div className="form-group">
                    <label>Phone Number *</label>
                    <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="10-digit mobile number" style={{ borderColor: errors.phone ? "var(--danger)" : "" }} />
                    {errors.phone && <small style={{ color: "var(--danger)" }}>{errors.phone}</small>}
                  </div>
                  <div className="form-group full">
                    <label>Email (optional)</label>
                    <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="your@email.com" type="email" />
                  </div>
                  <div className="form-group full">
                    <label>Full Address *</label>
                    <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
                      placeholder="House/Flat No., Street, Area, Landmark"
                      style={{ minHeight: "80px", borderColor: errors.address ? "var(--danger)" : "" }} />
                    {errors.address && <small style={{ color: "var(--danger)" }}>{errors.address}</small>}
                  </div>
                  <div className="form-group">
                    <label>City *</label>
                    <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
                      placeholder="City" style={{ borderColor: errors.city ? "var(--danger)" : "" }} />
                    {errors.city && <small style={{ color: "var(--danger)" }}>{errors.city}</small>}
                  </div>
                  <div className="form-group">
                    <label>Pincode *</label>
                    <input value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                      placeholder="6-digit pincode" maxLength={6}
                      style={{ borderColor: errors.pincode ? "var(--danger)" : "" }} />
                    {errors.pincode && <small style={{ color: "var(--danger)" }}>{errors.pincode}</small>}
                  </div>
                  <div className="form-group full">
                    <label>State *</label>
                    <select className="sort-select" style={{ width: "100%", borderRadius: "8px" }}
                      value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })}
                      style={{ borderColor: errors.state ? "var(--danger)" : "" }}>
                      <option value="">Select State</option>
                      {["Andhra Pradesh","Telangana","Karnataka","Tamil Nadu","Kerala","Maharashtra","Gujarat","Rajasthan","Delhi","Uttar Pradesh","Madhya Pradesh","Bihar","West Bengal","Punjab","Haryana","Other"].map(s => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                    {errors.state && <small style={{ color: "var(--danger)" }}>{errors.state}</small>}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="checkout-card">
              <div className="checkout-card-header">💳 Payment Method</div>
              <div className="checkout-card-body">
                <div className="payment-options">
                  {paymentMethods.map((m) => (
                    <div key={m.id}
                      className={`payment-option ${payment === m.id ? "selected" : ""}`}
                      onClick={() => setPayment(m.id)}>
                      <input type="radio" checked={payment === m.id} onChange={() => setPayment(m.id)} />
                      <div className="payment-icon">{m.icon}</div>
                      <div className="payment-option-info">
                        <h4>{m.label}</h4>
                        <p>{m.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT — Order Summary */}
          <div>
            <div className="order-summary-card">
              <div className="order-summary-header">🛒 Order Summary ({cart.length} items)</div>
              <div className="order-summary-items">
                {cart.map((item) => (
                  <div className="order-summary-item" key={item.id}>
                    <img src={item.image} alt={item.name}
                      onError={(e) => (e.target.src = "https://placehold.co/45?text=img")} />
                    <div className="order-summary-item-info">
                      <div className="order-summary-item-name">{item.name}</div>
                      <div className="order-summary-item-qty">Qty: {item.qty}</div>
                    </div>
                    <div className="order-summary-item-price">
                      {formatPrice(item.price * item.qty)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="order-totals">
                <div className="order-total-row">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="order-total-row">
                  <span>Delivery</span>
                  <span style={{ color: delivery === 0 ? "var(--success)" : "" }}>
                    {delivery === 0 ? "FREE" : formatPrice(delivery)}
                  </span>
                </div>
                {delivery === 0 && (
                  <div style={{ fontSize: "0.78rem", color: "var(--success)", marginBottom: "0.5rem" }}>
                    🎉 You saved ₹499 on delivery!
                  </div>
                )}
                <div className="order-total-row grand">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
              <button className="place-order-btn" onClick={handlePlaceOrder} disabled={loading}>
                {loading ? "Placing Order..." : `Place Order — ${formatPrice(total)}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ORDER CONFIRMATION PAGE ─────────────────────────────
export function OrderConfirmation({ order, onContinue, onViewOrders }) {
  const formatPrice = (p) => "₹" + p.toLocaleString("en-IN");

  const trackingSteps = [
    { icon: "✅", label: "Order Placed", desc: `Your order was placed on ${order.date}`, status: "done" },
    { icon: "🏪", label: "Order Confirmed", desc: "Store has confirmed your order", status: "done" },
    { icon: "📦", label: "Preparing to Ship", desc: "Your items are being packed", status: "active" },
    { icon: "🚚", label: "Out for Delivery", desc: "Estimated delivery in 2-3 days", status: "pending" },
    { icon: "🏠", label: "Delivered", desc: "Package delivered to your address", status: "pending" },
  ];

  const paymentLabels = {
    cod: "💵 Cash on Delivery",
    upi: "📱 UPI Payment",
    card: "💳 Credit / Debit Card",
    netbanking: "🏦 Net Banking"
  };

  return (
    <div className="confirmation-page">
      <div className="confirmation-container">

        {/* Success Hero */}
        <div className="confirmation-hero">
          <span className="confirmation-icon">🎉</span>
          <h2>Order Placed Successfully!</h2>
          <p>Thank you for shopping at Electronic House. Your order is confirmed!</p>
          <div className="order-id-badge">Order ID: #{order.id}</div>
        </div>

        {/* Order Tracking */}
        <div className="tracking-card">
          <div className="tracking-card-header">📦 Order Tracking</div>
          <div className="tracking-timeline">
            {trackingSteps.map((step, i) => (
              <div key={i} className={`tracking-step ${step.status}`}>
                <div className="tracking-dot">{step.icon}</div>
                <div className="tracking-step-info">
                  <h4>{step.label}</h4>
                  <p>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Details */}
        <div className="tracking-card">
          <div className="tracking-card-header">🧾 Order Details</div>
          <div style={{ padding: "1.5rem" }}>
            {/* Items */}
            {order.items.map((item) => (
              <div className="order-summary-item" key={item.id} style={{ padding: "0.8rem 0" }}>
                <img src={item.image} alt={item.name}
                  onError={(e) => (e.target.src = "https://placehold.co/45?text=img")} />
                <div className="order-summary-item-info">
                  <div className="order-summary-item-name">{item.name}</div>
                  <div className="order-summary-item-qty">{item.brand} · Qty: {item.qty}</div>
                </div>
                <div className="order-summary-item-price">{formatPrice(item.price * item.qty)}</div>
              </div>
            ))}

            <div style={{ borderTop: "1px solid var(--light-grey)", marginTop: "1rem", paddingTop: "1rem" }}>
              <div className="order-total-row"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
              <div className="order-total-row">
                <span>Delivery</span>
                <span>{order.delivery === 0 ? "FREE" : formatPrice(order.delivery)}</span>
              </div>
              <div className="order-total-row grand"><span>Total Paid</span><span>{formatPrice(order.total)}</span></div>
            </div>
          </div>
        </div>

        {/* Delivery & Payment Info */}
        <div className="tracking-card">
          <div className="tracking-card-header">📍 Delivery & Payment Info</div>
          <div style={{ padding: "1.5rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
            <div>
              <h4 style={{ fontWeight: "700", marginBottom: "0.5rem", color: "var(--dark)" }}>Delivery Address</h4>
              <p style={{ fontSize: "0.88rem", color: "var(--grey)", lineHeight: "1.6" }}>
                {order.address.name}<br />
                {order.address.address}<br />
                {order.address.city}, {order.address.state} - {order.address.pincode}<br />
                📞 {order.address.phone}
              </p>
            </div>
            <div>
              <h4 style={{ fontWeight: "700", marginBottom: "0.5rem", color: "var(--dark)" }}>Payment Method</h4>
              <p style={{ fontSize: "0.88rem", color: "var(--grey)" }}>{paymentLabels[order.payment]}</p>
              <br />
              <h4 style={{ fontWeight: "700", marginBottom: "0.5rem", color: "var(--dark)" }}>Estimated Delivery</h4>
              <p style={{ fontSize: "0.88rem", color: "var(--success)", fontWeight: "600" }}>2-3 Business Days</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="confirmation-actions">
          <button className="conf-btn-primary" onClick={onContinue}>🛍️ Continue Shopping</button>
          <button className="conf-btn-secondary" onClick={onViewOrders}>📦 View My Orders</button>
        </div>
      </div>
    </div>
  );
}