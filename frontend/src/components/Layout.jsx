import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function Layout() {
  return (
    <div style={styles.wrapper}>
      <Sidebar />
      <main style={styles.main}>
        <div style={styles.content}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}

const styles = {
  wrapper: {
    display: "flex",
    minHeight: "100vh",
    background: "#f6f1ea"
  },
  main: {
    flex: 1,
    marginLeft: "250px", // important for fixed sidebar
    padding: "24px",
    boxSizing: "border-box"
  },
  content: {
    width: "100%",
    maxWidth: "100%"
  }
};