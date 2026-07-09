import { useState, useEffect } from "react";
import logo from "./assets/logo.png";

const ADMIN_PASSWORD = "admin123";

// ─── ADMIN LOGIN ────────────────────────────────────────
function AdminLogin({ onLogin }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  const handleLogin = () => {
    if (form.username === "admin" && form.password === ADMIN_PASSWORD) {
      sessionStorage.setItem("adminAuth", "true");
      onLogin();
    } else {
      setError("❌ Invalid username or password!");
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <h2>🔐 Admin Panel</h2>
        <p>Electronic House — Store Management</p>
        {error && <div className="auth-error">{error}</div>}
        <div className="form-group">
          <label>Username</label>
          <input
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            placeholder="Enter admin username"
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="Enter admin password"
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
        </div>
        <button className="auth-submit-btn" onClick={handleLogin}>
          Login to Admin Panel →
        </button>
        <p
          style={{
            textAlign: "center",
            marginTop: "1rem",
            fontSize: "0.8rem",
            color: "var(--grey)",
          }}
        >
          Demo: admin / admin123
        </p>
      </div>
    </div>
  );
}

// ─── PRODUCT FORM MODAL ─────────────────────────────────
function ProductModal({ product, onClose, onSave }) {
  const [form, setForm] = useState(
    product || {
      name: "",
      category: "Televisions",
      price: "",
      image: "",
      inStock: true,
      brand: "",
      description: "",
    },
  );
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const CATS = [
    "Televisions",
    "Refrigerators",
    "Washing Machines",
    "Air Coolers",
    "Kitchen Appliances",
    "Mobile Phones",
    "Laptops",
  ];

  const handleSave = async () => {
    if (!form.name || !form.price || !form.brand) {
      setMsg("❌ Name, price and brand are required!");
      return;
    }
    setLoading(true);
    try {
      const url = product
        ? `http://localhost:8080/api/admin/products/${product.id}`
        : "http://localhost:8080/api/admin/products";
      const method = product ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, price: parseFloat(form.price) }),
      });
      const data = await res.json();
      onSave(data);
      onClose();
    } catch {
      setMsg("❌ Failed to save product!");
    }
    setLoading(false);
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3>{product ? "✏️ Edit Product" : "➕ Add New Product"}</h3>
          <button className="admin-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="admin-modal-body">
          {msg && (
            <div className="auth-error" style={{ marginBottom: "1rem" }}>
              {msg}
            </div>
          )}
          <div className="admin-form-grid">
            <div className="form-group full-width">
              <label>Product Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Samsung 55 inch 4K TV"
              />
            </div>
            <div className="form-group">
              <label>Brand</label>
              <input
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                placeholder="e.g. Samsung"
              />
            </div>
            <div className="form-group">
              <label>Price (₹)</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="e.g. 45999"
              />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select
                className="sort-select"
                style={{ width: "100%", borderRadius: "8px" }}
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {CATS.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>In Stock</label>
              <select
                className="sort-select"
                style={{ width: "100%", borderRadius: "8px" }}
                value={form.inStock}
                onChange={(e) =>
                  setForm({ ...form, inStock: e.target.value === "true" })
                }
              >
                <option value="true">✅ In Stock</option>
                <option value="false">❌ Out of Stock</option>
              </select>
            </div>
            <div className="form-group full-width">
              <label>Image URL</label>
              <input
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                placeholder="https://images.unsplash.com/..."
              />
            </div>
            <div className="form-group full-width">
              <label>
                Description ({form.description?.length || 0} characters)
              </label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Product description... (no length limit)"
                style={{ minHeight: "160px", resize: "vertical" }}
              />
            </div>
          </div>
          {form.image && (
            <div style={{ marginBottom: "1rem" }}>
              <img
                src={form.image}
                alt="preview"
                style={{
                  width: "100%",
                  height: "150px",
                  objectFit: "cover",
                  borderRadius: "8px",
                }}
                onError={(e) => (e.target.style.display = "none")}
              />
            </div>
          )}
          <button
            className="auth-submit-btn"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "Saving..." : product ? "Update Product" : "Add Product"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── DASHBOARD ──────────────────────────────────────────
function Dashboard({ stats }) {
  return (
    <div>
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon blue">📦</div>
          <div className="admin-stat-info">
            <h3>{stats.totalProducts || 0}</h3>
            <p>Total Products</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon green">📋</div>
          <div className="admin-stat-info">
            <h3>{stats.totalContacts || 0}</h3>
            <p>Contact Inquiries</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon orange">👤</div>
          <div className="admin-stat-info">
            <h3>{stats.totalUsers || 0}</h3>
            <p>Registered Users</p>
          </div>
        </div>
      </div>
      <div className="admin-card">
        <div className="admin-card-header">
          <h3>👋 Welcome to Admin Panel</h3>
        </div>
        <div
          style={{ padding: "2rem", color: "var(--grey)", lineHeight: "1.8" }}
        >
          <p>
            🏪 <strong>Electronic House</strong> — Store Management System
          </p>
          <br />
          <p>
            📦 <strong>Products</strong> — Add, edit, delete products from your
            catalog
          </p>
          <p>
            📋 <strong>Inquiries</strong> — View and manage customer contact
            messages
          </p>
          <p>
            👤 <strong>Users</strong> — See total registered customers
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── PRODUCTS MANAGER ───────────────────────────────────
function ProductsManager() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [search, setSearch] = useState("");

  const fetchProducts = () => {
    fetch("http://localhost:8080/api/admin/products")
      .then((r) => r.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    await fetch(`http://localhost:8080/api/admin/products/${id}`, {
      method: "DELETE",
    });
    fetchProducts();
  };

  const handleSave = () => {
    fetchProducts();
  };

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase()),
  );

  const formatPrice = (p) => "₹" + p.toLocaleString("en-IN");

  return (
    <div>
      <div className="admin-card">
        <div className="admin-card-header">
          <h3>📦 Products ({products.length})</h3>
          <button
            className="admin-add-btn"
            onClick={() => {
              setEditProduct(null);
              setModalOpen(true);
            }}
          >
            ➕ Add Product
          </button>
        </div>
        <div
          style={{
            padding: "1rem 1.5rem",
            borderBottom: "1px solid var(--light-grey)",
          }}
        >
          <input
            className="search-input"
            style={{ maxWidth: "350px" }}
            placeholder="🔍 Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="admin-table-wrap">
          {loading ? (
            <p
              style={{
                padding: "2rem",
                textAlign: "center",
                color: "var(--grey)",
              }}
            >
              Loading...
            </p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Brand</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <img
                        src={p.image}
                        alt={p.name}
                        onError={(e) =>
                          (e.target.src = "https://placehold.co/45?text=img")
                        }
                      />
                    </td>
                    <td
                      style={{
                        fontWeight: "600",
                        color: "var(--dark)",
                        maxWidth: "200px",
                      }}
                    >
                      {p.name}
                    </td>
                    <td>{p.brand}</td>
                    <td>{p.category}</td>
                    <td style={{ fontWeight: "700", color: "var(--primary)" }}>
                      {formatPrice(p.price)}
                    </td>
                    <td>
                      <span
                        className={`badge ${p.inStock ? "badge-success" : "badge-danger"}`}
                      >
                        {p.inStock ? "In Stock" : "Out of Stock"}
                      </span>
                    </td>
                    <td>
                      <div className="admin-action-btns">
                        <button
                          className="admin-edit-btn"
                          onClick={() => {
                            setEditProduct(p);
                            setModalOpen(true);
                          }}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="admin-delete-btn"
                          onClick={() => handleDelete(p.id)}
                        >
                          🗑 Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modalOpen && (
        <ProductModal
          product={editProduct}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

// ─── CONTACTS MANAGER ───────────────────────────────────
function ContactsManager() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchContacts = () => {
    fetch("http://localhost:8080/api/admin/contacts")
      .then((r) => r.json())
      .then((data) => {
        setContacts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this inquiry?")) return;
    await fetch(`http://localhost:8080/api/admin/contacts/${id}`, {
      method: "DELETE",
    });
    fetchContacts();
  };

  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <h3>📋 Contact Inquiries ({contacts.length})</h3>
      </div>
      <div className="admin-table-wrap">
        {loading ? (
          <p
            style={{
              padding: "2rem",
              textAlign: "center",
              color: "var(--grey)",
            }}
          >
            Loading...
          </p>
        ) : contacts.length === 0 ? (
          <p
            style={{
              padding: "2rem",
              textAlign: "center",
              color: "var(--grey)",
            }}
          >
            No inquiries yet.
          </p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Message</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((c, i) => (
                <tr key={c.id}>
                  <td>{i + 1}</td>
                  <td style={{ fontWeight: "600", color: "var(--dark)" }}>
                    {c.name}
                  </td>
                  <td>{c.phone}</td>
                  <td style={{ maxWidth: "300px" }}>{c.message}</td>
                  <td>
                    <button
                      className="admin-delete-btn"
                      onClick={() => handleDelete(c.id)}
                    >
                      🗑 Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ─── MAIN ADMIN PANEL ───────────────────────────────────
export default function AdminPanel({ onBack }) {
  const [isLoggedIn, setIsLoggedIn] = useState(
    sessionStorage.getItem("adminAuth") === "true",
  );
  const [activeTab, setActiveTab] = useState("dashboard");
  const [stats, setStats] = useState({});

  useEffect(() => {
    if (isLoggedIn) {
      fetch("http://localhost:8080/api/admin/stats")
        .then((r) => r.json())
        .then((data) => setStats(data))
        .catch(() => {});
    }
  }, [isLoggedIn]);

  const handleLogout = () => {
    sessionStorage.removeItem("adminAuth");
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return <AdminLogin onLogin={() => setIsLoggedIn(true)} />;
  }

  const navItems = [
    { id: "dashboard", icon: "📊", label: "Dashboard" },
    { id: "products", icon: "📦", label: "Products" },
    { id: "contacts", icon: "📋", label: "Inquiries" },
  ];

  return (
    <div className="admin-page">
      <div className="admin-layout">
        {/* Sidebar */}
        <div className="admin-sidebar">
          <div
            className="admin-sidebar-logo"
            style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}
          >
            <img
              src={logo}
              alt="Electronic House"
              style={{ height: "32px", width: "auto" }}
            />
            <div>
              <h3 style={{ margin: 0 }}>Electronic House</h3>
              <p style={{ margin: 0 }}>Admin Panel</p>
            </div>
          </div>
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`admin-nav-item ${activeTab === item.id ? "active" : ""}`}
              onClick={() => setActiveTab(item.id)}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
          <button
            className="admin-nav-item"
            onClick={handleLogout}
            style={{ marginTop: "auto", color: "#ef4444" }}
          >
            <span>🚪</span>
            <span>Logout</span>
          </button>
          <button className="admin-nav-item" onClick={onBack}>
            <span>🌐</span>
            <span>View Website</span>
          </button>
        </div>

        {/* Content */}
        <div className="admin-content">
          <div className="admin-topbar">
            <h2>
              {activeTab === "dashboard" && "📊 Dashboard"}
              {activeTab === "products" && "📦 Products Manager"}
              {activeTab === "contacts" && "📋 Contact Inquiries"}
            </h2>
          </div>

          {activeTab === "dashboard" && <Dashboard stats={stats} />}
          {activeTab === "products" && <ProductsManager />}
          {activeTab === "contacts" && <ContactsManager />}
        </div>
      </div>
    </div>
  );
}
