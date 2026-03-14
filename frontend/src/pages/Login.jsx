import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../services/api";
import Logo from "../components/Logo";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [selectedRole, setSelectedRole] = useState("student");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data } = await authApi.login(form);

      if (data.user.role !== selectedRole) {
        setError(`This account is not registered as ${selectedRole}. Please choose ${data.user.role} login.`);
        return;
      }

      localStorage.setItem("cemsToken", data.token);
      localStorage.setItem("cemsUser", JSON.stringify(data.user));
      navigate(data.user.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-wrap auth-modern-wrap">
      <div className="auth-shape shape-a" aria-hidden="true" />
      <div className="auth-shape shape-b" aria-hidden="true" />
      <div className="auth-shape shape-c" aria-hidden="true" />

      <div className="app-corner-logo">
        <Logo light />
      </div>

      <form className="card auth-card auth-modern-card p-4 p-md-5" onSubmit={handleSubmit}>
        <h3 className="mb-1">Welcome Back</h3>
        <p className="text-secondary mb-4">Sign in to your CEMS portal</p>

        <p className="small text-uppercase text-muted mb-2 auth-role-label">Login as</p>
        <div className="role-switch mb-4" role="tablist" aria-label="Select login role">
          <button
            type="button"
            className={`role-chip ${selectedRole === "student" ? "active" : ""}`}
            onClick={() => setSelectedRole("student")}
          >
            Student Login
          </button>
          <button
            type="button"
            className={`role-chip ${selectedRole === "admin" ? "active" : ""}`}
            onClick={() => setSelectedRole("admin")}
          >
            Admin Login
          </button>
        </div>

        <div className="mb-3 input-shell">
          <input
            className="form-control"
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3 input-shell password-shell">
          <input
            className="form-control"
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <button type="button" className="password-toggle" onClick={() => setShowPassword((prev) => !prev)}>
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        {error ? <div className="alert alert-danger py-2">{error}</div> : null}

        <button className="btn btn-primary w-100 auth-submit" type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Login"}
        </button>

        <p className="mt-3 mb-0">
          New user? <Link to="/register">Register here</Link>
        </p>
      </form>
    </main>
  );
}
