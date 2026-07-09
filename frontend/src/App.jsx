import { useState, useEffect, useRef } from "react";
import "./index.css";
import AdminPanel from "./AdminPanel";
import { CheckoutPage, OrderConfirmation } from "./Checkout";
import logo from "./assets/logo.png";

// ─── DATA ───────────────────────────────────────────────
const CATEGORIES = [
  { icon: "📺", name: "Televisions" },
  { icon: "🧊", name: "Refrigerators" },
  { icon: "🫧", name: "Washing Machines" },
  { icon: "💨", name: "Air Coolers" },
  { icon: "🍳", name: "Kitchen Appliances" },
  { icon: "📱", name: "Mobile Phones" },
  { icon: "💻", name: "Laptops" },
];

// ─── HOOKS ──────────────────────────────────────────────
function useFadeIn() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

// ─── AUTH MODAL ─────────────────────────────────────────
function AuthModal({ onClose, onLogin }) {
  const [tab, setTab] = useState("login");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const url =
        tab === "login"
          ? "http://localhost:8080/api/auth/login"
          : "http://localhost:8080/api/auth/register";
      const body =
        tab === "login" ? { email: form.email, password: form.password } : form;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.status === "success") {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userName", data.name);
        localStorage.setItem("userEmail", data.email);
        localStorage.setItem("userPhone", data.phone || "");
        onLogin({
          name: data.name,
          email: data.email,
          phone: data.phone || "",
        });
        setSuccess(tab === "login" ? "Welcome back!" : "Account created!");
        setTimeout(() => onClose(), 800);
      } else {
        setError(data.message || "Something went wrong!");
      }
    } catch {
      setError("Cannot connect to server!");
    }
    setLoading(false);
  };

  return (
    <div className="auth-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <div className="auth-header">
          <h3>{tab === "login" ? "🔐 Login" : "📝 Create Account"}</h3>
          <button className="auth-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="auth-body">
          <div className="auth-tabs">
            <button
              className={`auth-tab ${tab === "login" ? "active" : ""}`}
              onClick={() => {
                setTab("login");
                setError("");
              }}
            >
              Login
            </button>
            <button
              className={`auth-tab ${tab === "register" ? "active" : ""}`}
              onClick={() => {
                setTab("register");
                setError("");
              }}
            >
              Register
            </button>
          </div>
          {error && <div className="auth-error">❌ {error}</div>}
          {success && <div className="auth-success">✅ {success}</div>}
          {tab === "register" && (
            <div className="form-group">
              <label>Full Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your name"
              />
            </div>
          )}
          <div className="form-group">
            <label>Email</label>
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter your email"
              type="email"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              type="password"
            />
          </div>
          {tab === "register" && (
            <div className="form-group">
              <label>Phone</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Enter your phone"
              />
            </div>
          )}
          <button
            className="auth-submit-btn"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : tab === "login"
                ? "Login →"
                : "Create Account →"}
          </button>
          <div className="auth-switch">
            {tab === "login" ? (
              <>
                <span>Don't have an account? </span>
                <a onClick={() => setTab("register")}>Register</a>
              </>
            ) : (
              <>
                <span>Already have an account? </span>
                <a onClick={() => setTab("login")}>Login</a>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PROFILE PAGE ───────────────────────────────────────
function ProfilePage({
  user,
  onBack,
  cart,
  wishlist,
  onLogout,
  onUpdateUser,
  orders,
}) {
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [form, setForm] = useState({
    name: user.name,
    phone: user.phone || "",
  });
  const [passForm, setPassForm] = useState({
    current: "",
    newPass: "",
    confirm: "",
  });
  const [msg, setMsg] = useState("");
  const [passMsg, setPassMsg] = useState("");

  const handleSaveProfile = () => {
    localStorage.setItem("userName", form.name);
    localStorage.setItem("userPhone", form.phone);
    onUpdateUser({ ...user, name: form.name, phone: form.phone });
    setEditing(false);
    setMsg("✅ Profile updated!");
    setTimeout(() => setMsg(""), 2000);
  };

  const handleChangePassword = () => {
    if (passForm.newPass !== passForm.confirm) {
      setPassMsg("❌ Passwords do not match!");
      return;
    }
    if (passForm.newPass.length < 6) {
      setPassMsg("❌ Password must be at least 6 characters!");
      return;
    }
    setPassMsg("✅ Password changed successfully!");
    setPassForm({ current: "", newPass: "", confirm: "" });
    setChangingPassword(false);
    setTimeout(() => setPassMsg(""), 2000);
  };

  const cartTotal = cart.reduce((sum, p) => sum + p.price * p.qty, 0);
  const formatPrice = (p) => "₹" + p.toLocaleString("en-IN");

  return (
    <div className="profile-page">
      <div className="profile-container">
        <button className="profile-back-btn" onClick={onBack}>
          ← Back to Home
        </button>
        <div className="profile-header-card">
          <div className="profile-avatar">👤</div>
          <div className="profile-header-info">
            <h2>{user.name}</h2>
            <p>{user.email}</p>
            <span className="profile-member-badge">⭐ Member</span>
          </div>
        </div>
        <div className="profile-stats-grid">
          <div className="profile-stat-card">
            <div className="profile-stat-icon">🛒</div>
            <h3>{cart.length}</h3>
            <p>Items in Cart</p>
          </div>
          <div className="profile-stat-card">
            <div className="profile-stat-icon">❤️</div>
            <h3>{wishlist.length}</h3>
            <p>Wishlist Items</p>
          </div>
          <div className="profile-stat-card">
            <div className="profile-stat-icon">📦</div>
            <h3>{orders.length}</h3>
            <p>Total Orders</p>
          </div>
        </div>
        {msg && (
          <div className="auth-success" style={{ marginBottom: "1rem" }}>
            {msg}
          </div>
        )}
        {passMsg && (
          <div
            className={passMsg.includes("❌") ? "auth-error" : "auth-success"}
            style={{ marginBottom: "1rem" }}
          >
            {passMsg}
          </div>
        )}
        <div className="profile-grid">
          <div className="profile-card">
            <div className="profile-card-header">
              <h3>👤 Personal Information</h3>
              {!editing && (
                <button
                  className="profile-edit-btn"
                  onClick={() => setEditing(true)}
                >
                  ✏️ Edit
                </button>
              )}
            </div>
            <div className="profile-card-body">
              {editing ? (
                <>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      placeholder="Your name"
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input
                      value={form.phone}
                      onChange={(e) =>
                        setForm({ ...form, phone: e.target.value })
                      }
                      placeholder="Your phone"
                    />
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      className="profile-save-btn"
                      onClick={handleSaveProfile}
                    >
                      Save Changes
                    </button>
                    <button
                      className="profile-save-btn"
                      style={{ background: "var(--grey)" }}
                      onClick={() => setEditing(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="profile-info-row">
                    <span className="profile-info-label">Full Name</span>
                    <span className="profile-info-value">{user.name}</span>
                  </div>
                  <div className="profile-info-row">
                    <span className="profile-info-label">Email</span>
                    <span className="profile-info-value">{user.email}</span>
                  </div>
                  <div className="profile-info-row">
                    <span className="profile-info-label">Phone</span>
                    <span className="profile-info-value">
                      {user.phone || "Not set"}
                    </span>
                  </div>
                  <div className="profile-info-row">
                    <span className="profile-info-label">Role</span>
                    <span className="profile-info-value">⭐ Member</span>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="profile-card">
            <div className="profile-card-header">
              <h3>🔐 Security</h3>
              {!changingPassword && (
                <button
                  className="profile-edit-btn"
                  onClick={() => setChangingPassword(true)}
                >
                  Change Password
                </button>
              )}
            </div>
            <div className="profile-card-body">
              {changingPassword ? (
                <>
                  <div className="form-group">
                    <label>Current Password</label>
                    <input
                      type="password"
                      value={passForm.current}
                      onChange={(e) =>
                        setPassForm({ ...passForm, current: e.target.value })
                      }
                      placeholder="Current password"
                    />
                  </div>
                  <div className="form-group">
                    <label>New Password</label>
                    <input
                      type="password"
                      value={passForm.newPass}
                      onChange={(e) =>
                        setPassForm({ ...passForm, newPass: e.target.value })
                      }
                      placeholder="New password"
                    />
                  </div>
                  <div className="form-group">
                    <label>Confirm Password</label>
                    <input
                      type="password"
                      value={passForm.confirm}
                      onChange={(e) =>
                        setPassForm({ ...passForm, confirm: e.target.value })
                      }
                      placeholder="Confirm new password"
                    />
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      className="profile-save-btn"
                      onClick={handleChangePassword}
                    >
                      Update Password
                    </button>
                    <button
                      className="profile-save-btn"
                      style={{ background: "var(--grey)" }}
                      onClick={() => setChangingPassword(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="profile-info-row">
                    <span className="profile-info-label">Password</span>
                    <span className="profile-info-value">••••••••</span>
                  </div>
                  <div className="profile-info-row">
                    <span className="profile-info-label">Last Login</span>
                    <span className="profile-info-value">Today</span>
                  </div>
                  <div className="profile-info-row">
                    <span className="profile-info-label">Account Status</span>
                    <span
                      className="profile-info-value"
                      style={{ color: "var(--success)" }}
                    >
                      ✅ Active
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Order History */}
          <div className="profile-card" style={{ gridColumn: "1 / -1" }}>
            <div className="profile-card-header">
              <h3>📦 Order History</h3>
            </div>
            <div className="profile-card-body">
              {orders.length === 0 ? (
                <div className="orders-empty">
                  <span>📦</span>
                  <p>No orders yet. Start shopping!</p>
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                  }}
                >
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      style={{
                        background: "var(--bg)",
                        borderRadius: "var(--radius)",
                        padding: "1rem",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "0.8rem",
                        }}
                      >
                        <div>
                          <span
                            style={{ fontWeight: "700", color: "var(--dark)" }}
                          >
                            #{order.id}
                          </span>
                          <span
                            style={{
                              marginLeft: "1rem",
                              fontSize: "0.85rem",
                              color: "var(--grey)",
                            }}
                          >
                            {order.date}
                          </span>
                        </div>
                        <span className="badge badge-success">
                          ✅ Confirmed
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: "0.85rem",
                          color: "var(--grey)",
                          marginBottom: "0.5rem",
                        }}
                      >
                        {order.items.map((i) => i.name).join(", ")}
                      </div>
                      <div
                        style={{ fontWeight: "800", color: "var(--primary)" }}
                      >
                        Total: {formatPrice(order.total)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div style={{ textAlign: "center", marginTop: "2rem" }}>
          <button
            onClick={onLogout}
            style={{
              background: "var(--danger)",
              color: "var(--white)",
              border: "none",
              padding: "0.8rem 2rem",
              borderRadius: "50px",
              fontWeight: "700",
              fontSize: "0.95rem",
              cursor: "pointer",
            }}
          >
            🚪 Logout
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── WISHLIST DRAWER ────────────────────────────────────
function WishlistDrawer({ wishlist, onClose, onRemove, onMoveToCart }) {
  const formatPrice = (p) => "₹" + p.toLocaleString("en-IN");
  return (
    <>
      <div className="cart-overlay" onClick={onClose} />
      <div className="wishlist-drawer">
        <div className="wishlist-header">
          <h3>❤️ My Wishlist ({wishlist.length} items)</h3>
          <button className="wishlist-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="wishlist-items">
          {wishlist.length === 0 ? (
            <div className="wishlist-empty">
              <span>💔</span>
              <p>Your wishlist is empty!</p>
            </div>
          ) : (
            wishlist.map((item) => (
              <div className="wishlist-item" key={item.id}>
                <img
                  className="wishlist-item-img"
                  src={item.image}
                  alt={item.name}
                  onError={(e) =>
                    (e.target.src = "https://placehold.co/70?text=img")
                  }
                />
                <div className="wishlist-item-info">
                  <div className="wishlist-item-name">{item.name}</div>
                  <div className="wishlist-item-brand">{item.brand}</div>
                  <div className="wishlist-item-price">
                    {formatPrice(item.price)}
                  </div>
                </div>
                <div className="wishlist-item-actions">
                  <button
                    className="move-to-cart-btn"
                    onClick={() => onMoveToCart(item)}
                    disabled={!item.inStock}
                  >
                    🛒 Add to Cart
                  </button>
                  <button
                    className="wishlist-remove-btn"
                    onClick={() => onRemove(item.id)}
                  >
                    🗑 Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

// ─── CART DRAWER ────────────────────────────────────────
function CartDrawer({ cart, onClose, onRemove, onQty, onCheckout }) {
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const formatPrice = (p) => "₹" + p.toLocaleString("en-IN");
  return (
    <>
      <div className="cart-overlay" onClick={onClose} />
      <div className="cart-drawer">
        <div className="cart-header">
          <h3>🛒 Your Cart ({cart.length} items)</h3>
          <button className="cart-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="cart-items">
          {cart.length === 0 ? (
            <div className="cart-empty">
              <span>🛒</span>
              <p>Your cart is empty!</p>
            </div>
          ) : (
            cart.map((item) => (
              <div className="cart-item" key={item.id}>
                <img
                  className="cart-item-img"
                  src={item.image}
                  alt={item.name}
                  onError={(e) =>
                    (e.target.src = "https://placehold.co/70?text=img")
                  }
                />
                <div className="cart-item-info">
                  <div className="cart-item-name">{item.name}</div>
                  <div className="cart-item-brand">{item.brand}</div>
                  <div className="cart-item-price">
                    {formatPrice(item.price * item.qty)}
                  </div>
                </div>
                <div className="cart-item-controls">
                  <div className="qty-controls">
                    <button
                      className="qty-btn"
                      onClick={() => onQty(item.id, -1)}
                    >
                      −
                    </button>
                    <span className="qty-num">{item.qty}</span>
                    <button
                      className="qty-btn"
                      onClick={() => onQty(item.id, 1)}
                    >
                      +
                    </button>
                  </div>
                  <button
                    className="remove-btn"
                    onClick={() => onRemove(item.id)}
                  >
                    🗑 Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total-row">
              <span>Total Amount</span>
              <span className="cart-total-amount">{formatPrice(total)}</span>
            </div>
            <button
              className="cart-checkout-btn"
              onClick={() => {
                onClose();
                onCheckout();
              }}
            >
              Proceed to Checkout →
            </button>
          </div>
        )}
      </div>
    </>
  );
}

// ─── NAVBAR ─────────────────────────────────────────────
function Navbar({
  cartCount,
  wishlistCount,
  onCartOpen,
  onWishlistOpen,
  onHome,
  user,
  onAuthOpen,
  onLogout,
  onProfileOpen,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [cartBounce, setCartBounce] = useState(false);
  const [wishBounce, setWishBounce] = useState(false);
  const prevCartCount = useRef(cartCount);
  const prevWishCount = useRef(wishlistCount);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (cartCount > prevCartCount.current) {
      setCartBounce(true);
      const t = setTimeout(() => setCartBounce(false), 450);
      return () => clearTimeout(t);
    }
    prevCartCount.current = cartCount;
  }, [cartCount]);

  useEffect(() => {
    if (wishlistCount > prevWishCount.current) {
      setWishBounce(true);
      const t = setTimeout(() => setWishBounce(false), 450);
      return () => clearTimeout(t);
    }
    prevWishCount.current = wishlistCount;
  }, [wishlistCount]);

  const scrollTo = (id) => {
    onHome();
    setTimeout(
      () => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }),
      100,
    );
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div
        className="navbar-logo"
        onClick={onHome}
        style={{
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "0.6rem",
        }}
      >
        <img
          src={logo}
          alt="Electronic House"
          style={{ height: "32px", width: "auto" }}
        />
        Electronic <span>House</span>
      </div>
      <ul className={`navbar-links ${menuOpen ? "open" : ""}`}>
        <li>
          <a onClick={() => scrollTo("home")}>Home</a>
        </li>
        <li>
          <a onClick={() => scrollTo("products")}>Products</a>
        </li>
        <li>
          <a onClick={() => scrollTo("about")}>About</a>
        </li>
        <li>
          <a onClick={() => scrollTo("contact")}>Contact</a>
        </li>
      </ul>
      <div className="navbar-actions">
        <button
          className={`wishlist-icon-btn ${wishBounce ? "icon-bounce" : ""}`}
          onClick={onWishlistOpen}
        >
          ❤️
          {wishlistCount > 0 && (
            <span className="wishlist-count">{wishlistCount}</span>
          )}
        </button>
        <button
          className={`cart-icon-btn ${cartBounce ? "icon-bounce" : ""}`}
          onClick={onCartOpen}
        >
          🛒{cartCount > 0 && <span className="cart-count">{cartCount}</span>}
        </button>
        {user ? (
          <div className="user-menu-wrap" ref={dropdownRef}>
            <button
              className="user-menu-btn"
              onClick={(e) => {
                e.stopPropagation();
                setDropdownOpen((prev) => !prev);
              }}
            >
              👤 {user.name.split(" ")[0]} ▾
            </button>
            {dropdownOpen && (
              <div className="user-dropdown">
                <div
                  className="user-dropdown-item"
                  style={{ color: "var(--grey)", fontSize: "0.8rem" }}
                >
                  {user.email}
                </div>
                <button
                  className="user-dropdown-item"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDropdownOpen(false);
                    onProfileOpen();
                  }}
                >
                  👤 My Profile
                </button>
                <button
                  className="user-dropdown-item logout"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDropdownOpen(false);
                    onLogout();
                  }}
                >
                  🚪 Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <button className="login-btn" onClick={onAuthOpen}>
            Login
          </button>
        )}
        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          <span />
          <span />
          <span />
        </button>
      </div>
    </nav>
  );
}

// ─── HERO ───────────────────────────────────────────────
function Hero() {
  const scrollTo = (id) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  return (
    <section className="hero" id="home">
      <div className="hero-content">
        <div className="hero-badge">🏪 Trusted Since 2005</div>
        <h1>
          Welcome to <span>Electronic House</span>
        </h1>
        <p>
          Your one-stop shop for the best electronics and home appliances in
          town.
        </p>
        <a className="btn-primary" onClick={() => scrollTo("products")}>
          View Products
        </a>
        <div className="hero-stats">
          <div className="hero-stat">
            <h3>500+</h3>
            <p>Products</p>
          </div>
          <div className="hero-stat">
            <h3>20+</h3>
            <p>Brands</p>
          </div>
          <div className="hero-stat">
            <h3>5000+</h3>
            <p>Happy Customers</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── CATEGORIES ─────────────────────────────────────────
function Categories() {
  const ref = useFadeIn();
  const scrollTo = (id) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  return (
    <section className="section section-alt" id="categories">
      <div className="container">
        <div className="section-title fade-in" ref={ref}>
          <h2>Shop by Category</h2>
          <p>Find exactly what you're looking for</p>
          <div className="underline" />
        </div>
        <div className="categories-grid">
          {CATEGORIES.map((cat) => (
            <div
              className="category-card"
              key={cat.name}
              onClick={() => scrollTo("products")}
            >
              <div className="category-icon">{cat.icon}</div>
              <h3>{cat.name}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── SKELETON ───────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton skeleton-img" />
      <div className="skeleton-body">
        <div className="skeleton skeleton-line short" />
        <div className="skeleton skeleton-line medium" />
        <div className="skeleton skeleton-line full" />
        <div className="skeleton skeleton-line short" />
      </div>
    </div>
  );
}

// ─── PRODUCT DETAIL PAGE ────────────────────────────────
function ProductDetail({
  product,
  onBack,
  cart,
  onAddToCart,
  wishlist,
  onToggleWishlist,
  allProducts,
}) {
  const [added, setAdded] = useState(false);
  const formatPrice = (p) => "₹" + p.toLocaleString("en-IN");
  const isWishlisted = wishlist.find((p) => p.id === product.id);
  const inCart = cart.find((p) => p.id === product.id);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [product]);
  const handleAddToCart = () => {
    onAddToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };
  const related = allProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 3);
  return (
    <div className="detail-page">
      <div className="detail-container">
        <button className="detail-back-btn" onClick={onBack}>
          ← Back to Products
        </button>
        <div className="detail-grid">
          <div className="detail-image-box">
            <img
              src={product.image}
              alt={product.name}
              onError={(e) =>
                (e.target.src =
                  "https://placehold.co/600x380?text=Product+Image")
              }
            />
            <div className="detail-badge-stock">
              <span
                className={`badge ${product.inStock ? "badge-success" : "badge-danger"}`}
              >
                {product.inStock ? "✅ In Stock" : "❌ Out of Stock"}
              </span>
            </div>
          </div>
          <div className="detail-info">
            <div className="detail-category">{product.category}</div>
            <div className="detail-name">{product.name}</div>
            <div className="detail-brand-row">
              <span className="detail-brand">
                Brand: <strong>{product.brand}</strong>
              </span>
            </div>
            <div className="detail-price">{formatPrice(product.price)}</div>
            <div className="detail-description">{product.description}</div>
            <div className="detail-specs">
              <h4>📋 Specifications</h4>
              <div className="spec-row">
                <span className="spec-label">Brand</span>
                <span className="spec-value">{product.brand}</span>
              </div>
              <div className="spec-row">
                <span className="spec-label">Category</span>
                <span className="spec-value">{product.category}</span>
              </div>
              <div className="spec-row">
                <span className="spec-label">Price</span>
                <span className="spec-value">{formatPrice(product.price)}</span>
              </div>
              <div className="spec-row">
                <span className="spec-label">Availability</span>
                <span className="spec-value">
                  {product.inStock ? "In Stock" : "Out of Stock"}
                </span>
              </div>
              <div className="spec-row">
                <span className="spec-label">Warranty</span>
                <span className="spec-value">1 Year Manufacturer Warranty</span>
              </div>
              <div className="spec-row">
                <span className="spec-label">Delivery</span>
                <span className="spec-value">Free Home Delivery</span>
              </div>
              <div className="spec-row">
                <span className="spec-label">EMI</span>
                <span className="spec-value">Available on all major cards</span>
              </div>
            </div>
            <div className="detail-actions">
              <button
                className={`detail-add-cart-btn ${added ? "added" : ""}`}
                onClick={handleAddToCart}
                disabled={!product.inStock}
              >
                {!product.inStock
                  ? "Out of Stock"
                  : added
                    ? "✅ Added to Cart!"
                    : inCart
                      ? "🛒 Add More"
                      : "🛒 Add to Cart"}
              </button>
              <button
                className={`detail-wishlist-btn ${isWishlisted ? "active" : ""}`}
                onClick={() => onToggleWishlist(product)}
              >
                {isWishlisted ? "❤️ Wishlisted" : "🤍 Wishlist"}
              </button>
            </div>
          </div>
        </div>
        {related.length > 0 && (
          <div className="related-section">
            <h3>🔗 Related Products</h3>
            <div className="products-grid">
              {related.map((p) => (
                <div key={p.id} className="product-card">
                  <img
                    className="product-img"
                    src={p.image}
                    alt={p.name}
                    onError={(e) =>
                      (e.target.src =
                        "https://placehold.co/400x200?text=Product+Image")
                    }
                  />
                  <div className="product-body">
                    <div className="product-category">{p.category}</div>
                    <div className="product-name">{p.name}</div>
                    <div className="product-brand">{p.brand}</div>
                    <div className="product-footer">
                      <div className="product-price">
                        {formatPrice(p.price)}
                      </div>
                      <span
                        className={`badge ${p.inStock ? "badge-success" : "badge-danger"}`}
                      >
                        {p.inStock ? "In Stock" : "Out of Stock"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── PRODUCTS ───────────────────────────────────────────
function Products({
  cart,
  onAddToCart,
  wishlist,
  onToggleWishlist,
  onViewDetail,
}) {
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState("All");
  const [compareList, setCompareList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("default");
  const [page, setPage] = useState(1);
  const [addedMap, setAddedMap] = useState({});
  const PER_PAGE = 20;
  const ref = useFadeIn();

  useEffect(() => {
    fetch("http://localhost:8080/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    setPage(1);
  }, [filter, search, sort]);

  const formatPrice = (price) => "₹" + price.toLocaleString("en-IN");
  const handleAddToCart = (product) => {
    onAddToCart(product);
    setAddedMap((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(
      () => setAddedMap((prev) => ({ ...prev, [product.id]: false })),
      1500,
    );
  };
  const toggleCompare = (product) => {
    setCompareList((prev) => {
      if (prev.find((p) => p.id === product.id))
        return prev.filter((p) => p.id !== product.id);
      if (prev.length >= 2) return prev;
      return [...prev, product];
    });
  };

  let displayed =
    filter === "All" ? products : products.filter((p) => p.category === filter);
  if (search.trim())
    displayed = displayed.filter(
      (p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.brand.toLowerCase().includes(search.toLowerCase()),
    );
  if (sort === "low")
    displayed = [...displayed].sort((a, b) => a.price - b.price);
  if (sort === "high")
    displayed = [...displayed].sort((a, b) => b.price - a.price);

  const totalPages = Math.ceil(displayed.length / PER_PAGE);
  const paginated = displayed.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <section className="section" id="products">
      <div className="container">
        <div className="section-title fade-in" ref={ref}>
          <h2>Our Products</h2>
          <p>Quality electronics at the best prices</p>
          <div className="underline" />
        </div>
        <div className="filter-bar">
          {["All", ...CATEGORIES.map((c) => c.name)].map((cat) => (
            <button
              key={cat}
              className={`filter-btn ${filter === cat ? "active" : ""}`}
              onClick={() => setFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="search-sort-bar">
          <input
            className="search-input"
            type="text"
            placeholder="🔍 Search by product name or brand..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="sort-select"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="default">Sort: Default</option>
            <option value="low">Price: Low to High</option>
            <option value="high">Price: High to Low</option>
          </select>
        </div>
        {loading ? (
          <div className="products-grid">
            {[...Array(6)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : paginated.length === 0 ? (
          <div className="products-grid">
            <div className="no-results">
              <h3>😕 No products found</h3>
              <p>Try a different search or category.</p>
            </div>
          </div>
        ) : (
          <div className="products-grid">
            {paginated.map((product) => {
              const isSelected = compareList.find((p) => p.id === product.id);
              const isAdded = addedMap[product.id];
              const inCart = cart.find((p) => p.id === product.id);
              const isWishlisted = wishlist.find((p) => p.id === product.id);
              return (
                <div
                  key={product.id}
                  className={`product-card ${isSelected ? "selected" : ""}`}
                >
                  <button
                    className={`wishlist-btn ${isWishlisted ? "active" : ""}`}
                    onClick={() => onToggleWishlist(product)}
                  >
                    {isWishlisted ? "❤️" : "🤍"}
                  </button>
                  <label
                    className="compare-checkbox"
                    style={{
                      opacity:
                        compareList.length === 2 && !isSelected ? 0.4 : 1,
                      pointerEvents:
                        compareList.length === 2 && !isSelected
                          ? "none"
                          : "auto",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={!!isSelected}
                      onChange={() => toggleCompare(product)}
                    />
                    Compare
                  </label>
                  <img
                    className="product-img"
                    src={product.image}
                    alt={product.name}
                    style={{ cursor: "pointer" }}
                    onClick={() => onViewDetail(product)}
                    onError={(e) =>
                      (e.target.src =
                        "https://placehold.co/400x200?text=Product+Image")
                    }
                  />
                  <div className="product-body">
                    <div className="product-category">{product.category}</div>
                    <div
                      className="product-name"
                      style={{ cursor: "pointer" }}
                      onClick={() => onViewDetail(product)}
                    >
                      {product.name}
                    </div>
                    <div className="product-brand">{product.brand}</div>
                    <div className="product-footer">
                      <div className="product-price">
                        {formatPrice(product.price)}
                      </div>
                      <span
                        className={`badge ${product.inStock ? "badge-success" : "badge-danger"}`}
                      >
                        {product.inStock ? "In Stock" : "Out of Stock"}
                      </span>
                    </div>
                    <button
                      className={`add-to-cart-btn ${isAdded ? "added" : ""}`}
                      onClick={() => handleAddToCart(product)}
                      disabled={!product.inStock}
                    >
                      {!product.inStock
                        ? "Out of Stock"
                        : isAdded
                          ? "✅ Added!"
                          : inCart
                            ? "🛒 Add More"
                            : "🛒 Add to Cart"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="page-btn"
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 1}
            >
              ‹
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                className={`page-btn ${page === i + 1 ? "active" : ""}`}
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button
              className="page-btn"
              onClick={() => setPage((p) => p + 1)}
              disabled={page === totalPages}
            >
              ›
            </button>
          </div>
        )}
        {compareList.length === 2 && (
          <div className="comparison-section">
            <h3>⚖️ Product Comparison</h3>
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>{compareList[0].name}</th>
                  <th>{compareList[1].name}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th>Price</th>
                  <td>{formatPrice(compareList[0].price)}</td>
                  <td>{formatPrice(compareList[1].price)}</td>
                </tr>
                <tr>
                  <th>Category</th>
                  <td>{compareList[0].category}</td>
                  <td>{compareList[1].category}</td>
                </tr>
                <tr>
                  <th>Brand</th>
                  <td>{compareList[0].brand}</td>
                  <td>{compareList[1].brand}</td>
                </tr>
                <tr>
                  <th>Availability</th>
                  <td>
                    {compareList[0].inStock ? "✅ In Stock" : "❌ Out of Stock"}
                  </td>
                  <td>
                    {compareList[1].inStock ? "✅ In Stock" : "❌ Out of Stock"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

// ─── ABOUT ──────────────────────────────────────────────
function About() {
  const ref = useFadeIn();
  return (
    <section className="section section-alt" id="about">
      <div className="container">
        <div className="about-grid">
          <div className="about-image">
            <img
              src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600"
              alt="Electronic House Store"
            />
          </div>
          <div className="about-content fade-in" ref={ref}>
            <h2>About Electronic House</h2>
            <p>
              Established in 2005, Electronic House has been serving the people
              of our town for over 20 years. We started as a small shop with a
              dream to bring the best electronics to every home — and today we
              are proud to be the most trusted electronics store in the region.
            </p>
            <p>
              We stock top brands like Samsung, LG, Whirlpool, Sony, Philips,
              and many more. Whether you need a television for your living room,
              a refrigerator for your kitchen, or a washing machine for your
              family — we have it all under one roof at the best prices.
            </p>
            <p>
              Our friendly staff is always ready to help you find the right
              product for your needs and budget. Visit us today!
            </p>
            <div className="about-features">
              <div className="about-feature">
                <span>✅</span> 20+ Years Experience
              </div>
              <div className="about-feature">
                <span>✅</span> Top Brands Only
              </div>
              <div className="about-feature">
                <span>✅</span> Best Price Guarantee
              </div>
              <div className="about-feature">
                <span>✅</span> After-Sales Service
              </div>
              <div className="about-feature">
                <span>✅</span> EMI Available
              </div>
              <div className="about-feature">
                <span>✅</span> Home Delivery
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── CONTACT ────────────────────────────────────────────
function Contact() {
  const [form, setForm] = useState({ name: "", phone: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useFadeIn();
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("http://localhost:8080/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setSubmitted(true);
      setForm({ name: "", phone: "", message: "" });
    } catch {
      setSubmitted(true);
    }
    setLoading(false);
  };
  return (
    <section className="section" id="contact">
      <div className="container">
        <div className="section-title fade-in" ref={ref}>
          <h2>Contact Us</h2>
          <p>We'd love to hear from you</p>
          <div className="underline" />
        </div>
        <div className="contact-grid">
          <div className="contact-form">
            <h3>Send an Inquiry</h3>
            {submitted ? (
              <div className="success-msg">
                ✅ Thank you! We'll contact you soon.
              </div>
            ) : (
              <div>
                <div className="form-group">
                  <label>Your Name</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Message</label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="What are you looking for?"
                    required
                  />
                </div>
                <button
                  className="btn-submit"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send Message"}
                </button>
              </div>
            )}
          </div>
          <div className="contact-info">
            <div className="contact-info-card">
              <div className="contact-info-icon">📍</div>
              <div>
                <h4>Store Address</h4>
                <p>
                  123 Main Bazaar Road, Near Clock Tower,
                  <br />
                  Your Town - 500001
                </p>
              </div>
            </div>
            <div className="contact-info-card">
              <div className="contact-info-icon">📞</div>
              <div>
                <h4>Phone Number</h4>
                <p>+91 98765 43210</p>
                <p>+91 91234 56789</p>
              </div>
            </div>
            <div className="contact-info-card">
              <div className="contact-info-icon">🕐</div>
              <div>
                <h4>Store Hours</h4>
                <p>Mon – Sat: 9:00 AM – 8:30 PM</p>
                <p>Sunday: 10:00 AM – 6:00 PM</p>
              </div>
            </div>
            <div className="map-container">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3806.3!2d78.4867!3d17.3850!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTfCsDIzJzA2LjAiTiA3OMKwMjknMTIuMiJF!5e0!3m2!1sen!2sin!4v1234567890"
                width="100%"
                height="200"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer({ onAdminOpen }) {
  const scrollTo = (id) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <h3 style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <img
              src={logo}
              alt="Electronic House"
              style={{ height: "28px", width: "auto" }}
            />
            Electronic <span>House</span>
          </h3>
          <p>
            Your trusted electronics store since 2005. Bringing the best brands
            and latest technology to your doorstep.
          </p>
          <div className="social-links">
            <a className="social-link" href="#">
              📘
            </a>
            <a className="social-link" href="#">
              📸
            </a>
            <a className="social-link" href="#">
              🐦
            </a>
            <a className="social-link" href="#">
              ▶️
            </a>
          </div>
        </div>
        <div className="footer-links">
          <h4>Quick Links</h4>
          <ul>
            <li>
              <a onClick={() => scrollTo("home")}>Home</a>
            </li>
            <li>
              <a onClick={() => scrollTo("products")}>Products</a>
            </li>
            <li>
              <a onClick={() => scrollTo("about")}>About Us</a>
            </li>
            <li>
              <a onClick={() => scrollTo("contact")}>Contact</a>
            </li>
          </ul>
        </div>
        <div className="footer-links">
          <h4>Categories</h4>
          <ul>
            {CATEGORIES.map((c) => (
              <li key={c.name}>
                <a onClick={() => scrollTo("products")}>{c.name}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>
          © <AdminTrigger onAdminOpen={onAdminOpen} /> Electronic House. All
          rights reserved. Built by ❤️ Syed Fasihuddin.
        </p>
      </div>
    </footer>
  );
}

// ─── SECRET ADMIN TRIGGER ───────────────────────────────
function AdminTrigger({ onAdminOpen }) {
  const [clicks, setClicks] = useState(0);
  const timerRef = useRef(null);

  const handleClick = () => {
    const newCount = clicks + 1;
    setClicks(newCount);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (newCount >= 5) {
      setClicks(0);
      onAdminOpen();
    } else {
      timerRef.current = setTimeout(() => setClicks(0), 3000);
    }
  };

  return (
    <span onClick={handleClick} style={{ cursor: "default" }}>
      2026
    </span>
  );
}

// ─── APP ────────────────────────────────────────────────
export default function App() {
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [authOpen, setAuthOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [user, setUser] = useState(() => {
    const name = localStorage.getItem("userName");
    const email = localStorage.getItem("userEmail");
    const phone = localStorage.getItem("userPhone");
    return name ? { name, email, phone } : null;
  });

  useEffect(() => {
    fetch("http://localhost:8080/api/products")
      .then((res) => res.json())
      .then((data) => setAllProducts(data))
      .catch(() => {});
  }, []);

  const handleAddToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((p) => p.id === product.id);
      if (existing)
        return prev.map((p) =>
          p.id === product.id ? { ...p, qty: p.qty + 1 } : p,
        );
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const handleRemoveFromCart = (id) =>
    setCart((prev) => prev.filter((p) => p.id !== id));
  const handleQty = (id, delta) =>
    setCart((prev) =>
      prev
        .map((p) => (p.id === id ? { ...p, qty: p.qty + delta } : p))
        .filter((p) => p.qty > 0),
    );
  const handleToggleWishlist = (product) =>
    setWishlist((prev) =>
      prev.find((p) => p.id === product.id)
        ? prev.filter((p) => p.id !== product.id)
        : [...prev, product],
    );
  const handleRemoveFromWishlist = (id) =>
    setWishlist((prev) => prev.filter((p) => p.id !== id));
  const handleMoveToCart = (product) => {
    handleAddToCart(product);
    handleRemoveFromWishlist(product.id);
    setWishlistOpen(false);
    setCartOpen(true);
  };
  const handleLogin = (userData) => {
    setUser(userData);
    setAuthOpen(false);
  };
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userPhone");
    setUser(null);
    setCart([]);
    setWishlist([]);
    setProfileOpen(false);
  };
  const handleUpdateUser = (updatedUser) => setUser(updatedUser);

  const handleOrderPlaced = (order) => {
    setOrders((prev) => [order, ...prev]);
    setCart([]);
    setCheckoutOpen(false);
    setCurrentOrder(order);
    window.scrollTo(0, 0);

    fetch("http://localhost:8080/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId: order.id,
        customerName: order.address?.name || "",
        phone: order.address?.phone || "",
        address: `${order.address?.address || ""}, ${order.address?.city || ""}, ${order.address?.state || ""} - ${order.address?.pincode || ""}`,
        items: order.items.map((i) => `${i.name} x${i.qty}`).join(", "),
        totalAmount: order.total,
        paymentMethod: order.payment,
        status: "Placed",
        date: order.date,
      }),
    }).catch((err) => console.error("Failed to log order to sheet:", err));
  };

  const cartCount = cart.reduce((sum, p) => sum + p.qty, 0);

  if (adminOpen) return <AdminPanel onBack={() => setAdminOpen(false)} />;

  if (currentOrder) {
    return (
      <>
        <Navbar
          cartCount={0}
          wishlistCount={wishlist.length}
          onCartOpen={() => {}}
          onWishlistOpen={() => setWishlistOpen(true)}
          onHome={() => {
            setCurrentOrder(null);
            setSelectedProduct(null);
            setProfileOpen(false);
          }}
          user={user}
          onAuthOpen={() => setAuthOpen(true)}
          onLogout={handleLogout}
          onProfileOpen={() => {
            setProfileOpen(true);
            setCurrentOrder(null);
          }}
        />
        <div className="page-transition" key="confirmation">
          <OrderConfirmation
            order={currentOrder}
            onContinue={() => {
              setCurrentOrder(null);
              setSelectedProduct(null);
              setProfileOpen(false);
              window.scrollTo(0, 0);
            }}
            onViewOrders={() => {
              setCurrentOrder(null);
              setProfileOpen(true);
            }}
          />
        </div>
      </>
    );
  }

  if (checkoutOpen) {
    return (
      <>
        <Navbar
          cartCount={cartCount}
          wishlistCount={wishlist.length}
          onCartOpen={() => setCartOpen(true)}
          onWishlistOpen={() => setWishlistOpen(true)}
          onHome={() => {
            setCheckoutOpen(false);
            setSelectedProduct(null);
            setProfileOpen(false);
          }}
          user={user}
          onAuthOpen={() => setAuthOpen(true)}
          onLogout={handleLogout}
          onProfileOpen={() => {
            setProfileOpen(true);
            setCheckoutOpen(false);
          }}
        />
        <div className="page-transition" key="checkout">
          <CheckoutPage
            cart={cart}
            onBack={() => setCheckoutOpen(false)}
            onOrderPlaced={handleOrderPlaced}
          />
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar
        cartCount={cartCount}
        wishlistCount={wishlist.length}
        onCartOpen={() => setCartOpen(true)}
        onWishlistOpen={() => setWishlistOpen(true)}
        onHome={() => {
          setSelectedProduct(null);
          setProfileOpen(false);
        }}
        user={user}
        onAuthOpen={() => setAuthOpen(true)}
        onLogout={handleLogout}
        onProfileOpen={() => {
          setProfileOpen(true);
          setSelectedProduct(null);
        }}
      />

      {profileOpen && user ? (
        <div className="page-transition" key="profile">
          <ProfilePage
            user={user}
            onBack={() => setProfileOpen(false)}
            cart={cart}
            wishlist={wishlist}
            onLogout={handleLogout}
            onUpdateUser={handleUpdateUser}
            orders={orders}
          />
        </div>
      ) : selectedProduct ? (
        <div className="page-transition" key={`detail-${selectedProduct.id}`}>
          <ProductDetail
            product={selectedProduct}
            onBack={() => setSelectedProduct(null)}
            cart={cart}
            onAddToCart={handleAddToCart}
            wishlist={wishlist}
            onToggleWishlist={handleToggleWishlist}
            allProducts={allProducts}
          />
        </div>
      ) : (
        <div className="page-transition" key="home">
          <Hero />
          <Categories />
          <Products
            cart={cart}
            onAddToCart={handleAddToCart}
            wishlist={wishlist}
            onToggleWishlist={handleToggleWishlist}
            onViewDetail={(product) => {
              setSelectedProduct(product);
              window.scrollTo(0, 0);
            }}
          />
          <About />
          <Contact />
          <Footer onAdminOpen={() => setAdminOpen(true)} />
        </div>
      )}

      {cartOpen && (
        <CartDrawer
          cart={cart}
          onClose={() => setCartOpen(false)}
          onRemove={handleRemoveFromCart}
          onQty={handleQty}
          onCheckout={() => {
            setCheckoutOpen(true);
            window.scrollTo(0, 0);
          }}
        />
      )}
      {wishlistOpen && (
        <WishlistDrawer
          wishlist={wishlist}
          onClose={() => setWishlistOpen(false)}
          onRemove={handleRemoveFromWishlist}
          onMoveToCart={handleMoveToCart}
        />
      )}
      {authOpen && (
        <AuthModal onClose={() => setAuthOpen(false)} onLogin={handleLogin} />
      )}
    </>
  );
}
