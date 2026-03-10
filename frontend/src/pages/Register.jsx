import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../services/api";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
    rollNumber: "",
    mobileNumber: "",
    department: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = { ...form };
      if (payload.role === "admin") {
        payload.rollNumber = "";
        payload.mobileNumber = "";
        payload.department = "";
      }

      const { data } = await authApi.register(payload);
      localStorage.setItem("cemsToken", data.token);
      localStorage.setItem("cemsUser", JSON.stringify(data.user));
      navigate(data.user.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-wrap">
      <form className="card auth-card p-4" onSubmit={handleSubmit}>
        <h3 className="mb-3">Create Account</h3>
        <div className="mb-3">
          <input className="form-control" name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <input className="form-control" type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <input
            className="form-control"
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <select className="form-select" name="role" value={form.role} onChange={handleChange}>
            <option value="student">Student</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {form.role === "student" ? (
          <>
            <input className="form-control mb-3"
              name="rollNumber"
              placeholder="Roll Number"
              value={form.rollNumber}
              onChange={handleChange}
              required
            />
            <input className="form-control mb-3"
              name="mobileNumber"
              placeholder="Mobile Number"
              value={form.mobileNumber}
              onChange={handleChange}
              required
            />
            <input className="form-control mb-3"
              name="department"
              placeholder="Department"
              value={form.department}
              onChange={handleChange}
              required
            />
          </>
        ) : null}

        {error ? <div className="alert alert-danger py-2">{error}</div> : null}
        <button className="btn btn-primary w-100" type="submit" disabled={loading}>
          {loading ? "Creating..." : "Register"}
        </button>
        <p className="mt-3 mb-0">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </main>
  );
}
