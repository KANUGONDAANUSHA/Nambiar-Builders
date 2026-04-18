import { useState } from "react";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Events from "./pages/Events";
import Templates from "./pages/Templates";
import EmailCenter from "./pages/EmailCenter";
import EmailQueue from "./pages/EmailQueue";
import Settings from "./pages/Settings";

export default function App() {
  const [page, setPage] = useState("dashboard");

  const menuItems = [
    { key: "dashboard", label: "Dashboard" },
    { key: "employees", label: "Employees" },
    { key: "events", label: "Events" },
    { key: "templates", label: "Templates" },
    { key: "email-center", label: "Email Center" },
    { key: "email-queue", label: "Email Queue" },
    { key: "settings", label: "Settings" }
  ];

  const renderPage = () => {
    switch (page) {
      case "dashboard":
        return <Dashboard />;
      case "employees":
        return <Employees />;
      case "events":
        return <Events />;
      case "templates":
        return <Templates />;
      case "email-center":
        return <EmailCenter />;
      case "email-queue":
        return <EmailQueue />;
      case "settings":
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div style={styles.app}>
      <aside style={styles.sidebar}>
        <h2 style={styles.logo}>Nambiar Builders</h2>

        {menuItems.map((item) => (
          <button
            key={item.key}
            onClick={() => setPage(item.key)}
            style={{
              ...styles.menuButton,
              ...(page === item.key ? styles.activeButton : {})
            }}
          >
            {item.label}
          </button>
        ))}
      </aside>

      <main style={styles.main}>
        <div style={styles.pageWrapper}>{renderPage()}</div>
      </main>
    </div>
  );
}

const styles = {
  app: {
    minHeight: "100vh",
    background: "#f5efe6",
    fontFamily: "Inter, sans-serif"
  },
  sidebar: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "250px",
    height: "100vh",
    background: "linear-gradient(180deg, #1b1b1b 0%, #111111 100%)",
    color: "#ffffff",
    padding: "24px 16px",
    boxSizing: "border-box",
    borderRight: "1px solid rgba(255,255,255,0.08)",
    zIndex: 1000,
    overflowY: "auto"
  },
  logo: {
    fontSize: "26px",
    fontWeight: "800",
    margin: "8px 8px 28px",
    lineHeight: "1.2"
  },
  menuButton: {
    width: "100%",
    padding: "14px 16px",
    marginBottom: "12px",
    border: "none",
    borderRadius: "14px",
    cursor: "pointer",
    textAlign: "left",
    fontSize: "16px",
    fontWeight: "600",
    background: "#2f2f2f",
    color: "#ffffff",
    transition: "0.2s ease"
  },
  activeButton: {
    background: "#8b5e3c",
    color: "#ffffff"
  },
  main: {
    marginLeft: "250px",
    minHeight: "100vh",
    background: "linear-gradient(180deg, #f6f1ea 0%, #efe5d8 100%)",
    padding: "24px",
    boxSizing: "border-box"
  },
  pageWrapper: {
    width: "100%",
    maxWidth: "100%"
  }
};