import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../services/api";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data } = await authApi.login(form);
      localStorage.setItem("cemsToken", data.token);
      localStorage.setItem("cemsUser", JSON.stringify(data.user));
      navigate(data.user.role === "admin" ? "/admin" : "/student");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-wrap">
      <form className="card auth-card" onSubmit={handleSubmit}>
        <h2>Welcome to CEMS</h2>
        <p>Campus Event Management System</p>
        <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />
        {error ? <div className="error">{error}</div> : null}
        <button className="btn accent" type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Login"}
        </button>
        <p>
          New user? <Link to="/register">Register here</Link>
        </p>
      </form>
    </main>
  );
}
