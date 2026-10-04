import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom/client";

import {
  BrowserRouter,
  Link,
  Route,
  Routes,
  useLocation,
  useNavigate
} from "react-router-dom";

import "./styles.css";

const TAX_RATE = 0.18;

const createItem = () => ({
  id: Date.now() + Math.random(),
  name: "",
  quantity: 1,
  price: 0
});

const calculateTotals = (items) => {
  const subtotal = items.reduce(
    (sum, item) =>
      sum +
      Number(item.quantity || 0) *
        Number(item.price || 0),
    0
  );

  const tax = subtotal * TAX_RATE;

  return {
    subtotal,
    tax,
    total: subtotal + tax
  };
};

const sampleInvoices = [
  {
    id: "INV-1024",
    customer: "Arun Kumar",
    email: "arun@example.com",
    date: "2026-10-01",
    status: "Paid",
    items: [
      {
        id: 1,
        name: "Web Development",
        quantity: 1,
        price: 12000
      },
      {
        id: 2,
        name: "UI Design",
        quantity: 1,
        price: 5000
      }
    ]
  },
  {
    id: "INV-1025",
    customer: "Priya Sharma",
    email: "priya@example.com",
    date: "2026-10-02",
    status: "Unpaid",
    items: [
      {
        id: 3,
        name: "Website Maintenance",
        quantity: 2,
        price: 2500
      }
    ]
  }
];

function App() {
  const [invoices, setInvoices] = useState(() => {
    const saved = localStorage.getItem(
      "invoicegen-invoices"
    );

    return saved
      ? JSON.parse(saved)
      : sampleInvoices;
  });

  const [darkMode, setDarkMode] = useState(
    () =>
      localStorage.getItem(
        "invoicegen-theme"
      ) === "dark"
  );

  useEffect(() => {
    localStorage.setItem(
      "invoicegen-invoices",
      JSON.stringify(invoices)
    );
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem(
      "invoicegen-theme",
      darkMode ? "dark" : "light"
    );

    document.body.className = darkMode
      ? "dark-mode"
      : "light-mode";
  }, [darkMode]);

  const addInvoice = (invoice) => {
    setInvoices((current) => [
      invoice,
      ...current
    ]);
  };

  const deleteInvoice = (id) => {
    setInvoices((current) =>
      current.filter(
        (invoice) => invoice.id !== id
      )
    );
  };

  const toggleStatus = (id) => {
    setInvoices((current) =>
      current.map((invoice) =>
        invoice.id === id
          ? {
              ...invoice,
              status:
                invoice.status === "Paid"
                  ? "Unpaid"
                  : "Paid"
            }
          : invoice
      )
    );
  };

  return (
    <div className="app">
      <Navbar
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      <main className="main-content">
        <Routes>
          <Route
            path="/"
            element={
              <Dashboard invoices={invoices} />
            }
          />

          <Route
            path="/create"
            element={
              <CreateInvoice
                addInvoice={addInvoice}
              />
            }
          />

          <Route
            path="/history"
            element={
              <InvoiceHistory
                invoices={invoices}
                deleteInvoice={deleteInvoice}
                toggleStatus={toggleStatus}
              />
            }
          />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

function Navbar({
  darkMode,
  setDarkMode
}) {
  const location = useLocation();

  return (
    <header className="navbar">
      <div className="nav-container">

        <Link to="/" className="brand">
          <span className="brand-icon">
            ₹
          </span>

          <span>
            Invoice<span>Gen</span>
          </span>
        </Link>

        <nav className="nav-links">
          <Link
            to="/"
            className={
              location.pathname === "/"
                ? "active"
                : ""
            }
          >
            Dashboard
          </Link>

          <Link
            to="/create"
            className={
              location.pathname === "/create"
                ? "active"
                : ""
            }
          >
            Create Invoice
          </Link>

          <Link
            to="/history"
            className={
              location.pathname === "/history"
                ? "active"
                : ""
            }
          >
            History
          </Link>
        </nav>

        <button
          className="theme-button"
          onClick={() =>
            setDarkMode((value) => !value)
          }
        >
          {darkMode ? "☀️" : "🌙"}
        </button>

      </div>
    </header>
  );
}

function Dashboard({ invoices }) {
  const totalRevenue = useMemo(
    () =>
      invoices.reduce(
        (sum, invoice) =>
          sum +
          calculateTotals(invoice.items).total,
        0
      ),
    [invoices]
  );

  const paidInvoices = invoices.filter(
    (invoice) => invoice.status === "Paid"
  ).length;

  const unpaidInvoices = invoices.filter(
    (invoice) => invoice.status === "Unpaid"
  ).length;

  return (
    <section className="page">

      <div className="hero">
        <div>
          <p className="eyebrow">
            INVOICE MANAGEMENT
          </p>

          <h1>
            Simple invoices.
            <br />
            <span>Smarter business.</span>
          </h1>

          <p className="hero-text">
            Create professional invoices,
            calculate taxes automatically,
            and manage your invoice history
            in one simple ReactJS application.
          </p>

          <Link
            to="/create"
            className="primary-button"
          >
            + Create New Invoice
          </Link>
        </div>

        <div className="hero-card">
          <div className="mini-invoice">
            <div className="mini-top">
              <strong>INVOICE</strong>
              <span>#INV-1024</span>
            </div>

            <div className="mini-line" />
            <div className="mini-line short" />

            <div className="mini-total">
              <span>Total</span>
              <strong>₹20,060</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="stats-grid">

        <StatCard
          title="Total Invoices"
          value={invoices.length}
          icon="🧾"
        />

        <StatCard
          title="Paid Invoices"
          value={paidInvoices}
          icon="✓"
        />

        <StatCard
          title="Pending"
          value={unpaidInvoices}
          icon="⏳"
        />

        <StatCard
          title="Total Revenue"
          value={`₹${totalRevenue.toLocaleString(
            "en-IN",
            { maximumFractionDigits: 0 }
          )}`}
          icon="₹"
        />

      </div>

      <div className="dashboard-info">

        <div className="info-card">
          <h2>Why InvoiceGen?</h2>

          <p>
            InvoiceGen is a responsive ReactJS
            application designed to make invoice
            creation fast and easy.
          </p>

          <ul>
            <li>Automatic subtotal calculation</li>
            <li>18% GST calculation</li>
            <li>Invoice status tracking</li>
            <li>LocalStorage persistence</li>
          </ul>
        </div>

        <div className="info-card accent-card">
          <span className="big-icon">⚡</span>

          <h2>Fast & Interactive</h2>

          <p>
            Built using React state management,
            reusable components and responsive
            CSS.
          </p>
        </div>

      </div>
    </section>
  );
}

function StatCard({
  title,
  value,
  icon
}) {
  return (
    <div className="stat-card">
      <div className="stat-icon">
        {icon}
      </div>

      <div>
        <p>{title}</p>
        <h3>{value}</h3>
      </div>
    </div>
  );
}

function CreateInvoice({ addInvoice }) {
  const navigate = useNavigate();

  const [customer, setCustomer] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [items, setItems] =
    useState([createItem()]);

  const [error, setError] =
    useState("");

  const totals = useMemo(
    () => calculateTotals(items),
    [items]
  );

  const updateItem = (
    id,
    field,
    value
  ) => {
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value
            }
          : item
      )
    );
  };

  const addItem = () => {
    setItems((current) => [
      ...current,
      createItem()
    ]);
  };

  const removeItem = (id) => {
    setItems((current) =>
      current.length === 1
        ? current
        : current.filter(
            (item) => item.id !== id
          )
    );
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");

    if (!customer.trim()) {
      setError(
        "Please enter the customer name."
      );
      return;
    }

    if (
      !email.includes("@") ||
      !email.includes(".")
    ) {
      setError(
        "Please enter a valid email address."
      );
      return;
    }

    const validItems = items.filter(
      (item) =>
        item.name.trim() &&
        Number(item.quantity) > 0 &&
        Number(item.price) >= 0
    );

    if (!validItems.length) {
      setError(
        "Please add at least one valid product."
      );
      return;
    }

    const invoice = {
      id: `INV-${Math.floor(
        1000 + Math.random() * 9000
      )}`,
      customer: customer.trim(),
      email: email.trim(),
      date: new Date()
        .toISOString()
        .split("T")[0],
      status: "Unpaid",
      items: validItems
    };

    addInvoice(invoice);
    navigate("/history");
  };

  return (
    <section className="page">

      <div className="page-heading">
        <div>
          <p className="eyebrow">
            NEW DOCUMENT
          </p>

          <h1>Create Invoice</h1>

          <p>
            Add customer and product details
            to generate a professional invoice.
          </p>
        </div>

        <Link
          to="/history"
          className="secondary-button"
        >
          View History
        </Link>
      </div>

      <form
        className="invoice-form"
        onSubmit={handleSubmit}
      >

        <div className="form-section">

          <h2>Customer Details</h2>

          <div className="form-grid">

            <label>
              Customer Name

              <input
                type="text"
                value={customer}
                onChange={(event) =>
                  setCustomer(
                    event.target.value
                  )
                }
                placeholder="Enter customer name"
              />
            </label>

            <label>
              Email Address

              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(
                    event.target.value
                  )
                }
                placeholder="customer@example.com"
              />
            </label>

          </div>
        </div>

        <div className="form-section">

          <div className="section-header">
            <div>
              <h2>Products / Services</h2>

              <p>
                Add items included in this invoice.
              </p>
            </div>

            <button
              type="button"
              className="secondary-button"
              onClick={addItem}
            >
              + Add Item
            </button>
          </div>

          <div className="items-header">
            <span>Item</span>
            <span>Qty</span>
            <span>Price</span>
            <span>Total</span>
            <span />
          </div>

          {items.map((item) => (
            <div
              className="item-row"
              key={item.id}
            >

              <input
                value={item.name}
                onChange={(event) =>
                  updateItem(
                    item.id,
                    "name",
                    event.target.value
                  )
                }
                placeholder="Product or service"
              />

              <input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(event) =>
                  updateItem(
                    item.id,
                    "quantity",
                    event.target.value
                  )
                }
              />

              <input
                type="number"
                min="0"
                step="0.01"
                value={item.price}
                onChange={(event) =>
                  updateItem(
                    item.id,
                    "price",
                    event.target.value
                  )
                }
              />

              <strong>
                ₹
                {(
                  Number(item.quantity || 0) *
                  Number(item.price || 0)
                ).toLocaleString(
                  "en-IN",
                  {
                    minimumFractionDigits: 2
                  }
                )}
              </strong>

              <button
                type="button"
                className="delete-button"
                onClick={() =>
                  removeItem(item.id)
                }
              >
                ×
              </button>

            </div>
          ))}
        </div>

        <div className="invoice-bottom">

          <div className="note-box">
            <strong>GST included</strong>

            <p>
              Tax is automatically calculated
              at 18% of the subtotal.
            </p>
          </div>

          <div className="totals-card">

            <div>
              <span>Subtotal</span>

              <strong>
                ₹
                {totals.subtotal.toLocaleString(
                  "en-IN",
                  {
                    minimumFractionDigits: 2
                  }
                )}
              </strong>
            </div>

            <div>
              <span>GST (18%)</span>

              <strong>
                ₹
                {totals.tax.toLocaleString(
                  "en-IN",
                  {
                    minimumFractionDigits: 2
                  }
                )}
              </strong>
            </div>

            <div className="grand-total">
              <span>Total</span>

              <strong>
                ₹
                {totals.total.toLocaleString(
                  "en-IN",
                  {
                    minimumFractionDigits: 2
                  }
                )}
              </strong>
            </div>

          </div>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <button
          type="submit"
          className="primary-button submit-button"
        >
          Generate Invoice →
        </button>

      </form>
    </section>
  );
}

function InvoiceHistory({
  invoices,
  deleteInvoice,
  toggleStatus
}) {
  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState("All");

  const filteredInvoices =
    invoices.filter((invoice) => {

      const searchText =
        search.toLowerCase();

      const matchesSearch =
        invoice.customer
          .toLowerCase()
          .includes(searchText) ||
        invoice.id
          .toLowerCase()
          .includes(searchText);

      const matchesFilter =
        filter === "All" ||
        invoice.status === filter;

      return (
        matchesSearch &&
        matchesFilter
      );
    });

  return (
    <section className="page">

      <div className="page-heading">

        <div>
          <p className="eyebrow">
            RECORDS
          </p>

          <h1>Invoice History</h1>

          <p>
            Search, manage and update your
            previously created invoices.
          </p>
        </div>

        <Link
          to="/create"
          className="primary-button"
        >
          + New Invoice
        </Link>

      </div>

      <div className="toolbar">

        <div className="search-box">
          🔎

          <input
            type="text"
            placeholder="Search customer or invoice ID..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
          />
        </div>

        <div className="filter-buttons">

          {["All", "Paid", "Unpaid"].map(
            (option) => (
              <button
                key={option}
                className={
                  filter === option
                    ? "filter-active"
                    : ""
                }
                onClick={() =>
                  setFilter(option)
                }
              >
                {option}
              </button>
            )
          )}

        </div>
      </div>

      <div className="history-list">

        {filteredInvoices.length === 0 ? (
          <div className="empty-state">
            <div>🧾</div>

            <h2>No invoices found</h2>

            <p>
              Try another search or create
              a new invoice.
            </p>
          </div>
        ) : (
          filteredInvoices.map((invoice) => {

            const total =
              calculateTotals(
                invoice.items
              ).total;

            return (
              <div
                className="invoice-card"
                key={invoice.id}
              >

                <div className="invoice-main">

                  <div className="invoice-symbol">
                    ₹
                  </div>

                  <div>
                    <h3>
                      {invoice.customer}
                    </h3>

                    <p>
                      {invoice.id}
                      {" • "}
                      {invoice.date}
                    </p>

                    <small>
                      {invoice.email}
                    </small>
                  </div>

                </div>

                <div className="invoice-items">
                  {invoice.items.length} item
                  {invoice.items.length !== 1
                    ? "s"
                    : ""}
                </div>

                <div className="invoice-amount">
                  ₹
                  {total.toLocaleString(
                    "en-IN",
                    {
                      minimumFractionDigits: 2
                    }
                  )}
                </div>

                <button
                  className={
                    invoice.status === "Paid"
                      ? "status paid"
                      : "status unpaid"
                  }
                  onClick={() =>
                    toggleStatus(invoice.id)
                  }
                >
                  {invoice.status}
                </button>

                <button
                  className="delete-button"
                  onClick={() =>
                    deleteInvoice(invoice.id)
                  }
                >
                  🗑
                </button>

              </div>
            );
          })
        )}

      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <p>
        InvoiceGen • ReactJS Task 2
      </p>

      <p>
        Developed by{" "}
        <strong>Charulatha R</strong>
        {" • "}
        RA2411003050007
      </p>
    </footer>
  );
}

ReactDOM.createRoot(
  document.getElementById("root")
).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
