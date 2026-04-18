import { useAuth } from "../context/AuthContext";

export default function Topbar() {
  const { user, logout } = useAuth();

  return (
    <header className="topbar">
      <div>
        <h1>Admin Panel</h1>
        <p>
          Logged in as <strong>{user?.name}</strong> ({user?.role})
        </p>
      </div>

      <button className="btn-secondary" onClick={logout}>
        Logout
      </button>
    </header>
  );
}