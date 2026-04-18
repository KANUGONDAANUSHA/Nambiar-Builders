import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const [form, setForm] = useState({
    email: "",
    role: "admin",
  });

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    login(form);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Nambiar Builders</h1>
        <p>Email Wishes Portal Login</p>

        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="email"
            name="email"
            placeholder="Enter email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <select name="role" value={form.role} onChange={handleChange}>
            <option value="admin">Admin</option>
            <option value="staff">Staff</option>
          </select>

          <button className="btn-primary" type="submit">
            Login
          </button>
        </form>

        <div className="login-note">
          <strong>Demo mode:</strong> select Admin or Staff and log in.
        </div>
      </div>
    </div>
  );
}