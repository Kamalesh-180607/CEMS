import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../services/api";
import Logo from "../components/Logo";

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
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = (data) => {
    const errs = {};
    if (!data.name.trim()) {
      errs.name = "Name is required";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      errs.email = "Invalid email address";
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(data.password)) {
      errs.password = "Password must contain 8 characters, uppercase, lowercase, number and special character";
    }
    if (data.role === "student") {
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(data.mobileNumber)) {
        errs.mobileNumber = "Phone number must contain exactly 10 digits";
      }
    }
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const updateRole = (role) => {
    setForm((prev) => ({
      ...prev,
      role,
      ...(role === "admin" ? { rollNumber: "", mobileNumber: "", department: "" } : {}),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
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
    <main className="register-page">
      <div className="register-shape reg-shape-a" aria-hidden="true" />
      <div className="register-shape reg-shape-b" aria-hidden="true" />
      <div className="register-layout">
        <section className="register-branding">
          <Logo light className="register-brand-logo" />
          <h1>CEMS</h1>
          <p className="register-subtitle">Campus Event Management System</p>
          <p className="register-description">Discover and participate in exciting campus events.</p>
        </section>

        <section className="register-form-side">
          <form className="card register-card" onSubmit={handleSubmit}>
            <Logo className="register-form-logo" />
            <h3 className="mb-1">Create Your Account</h3>
            <p className="text-secondary mb-4">Join the campus event community</p>

            <p className="small text-uppercase text-muted mb-2 register-role-label">Choose role</p>
            <div className="register-role-switch mb-3" role="tablist" aria-label="Choose account role">
              <button
                type="button"
                className={`register-role-chip ${form.role === "student" ? "active" : ""}`}
                onClick={() => updateRole("student")}
              >
                Student
              </button>
              <button
                type="button"
                className={`register-role-chip ${form.role === "admin" ? "active" : ""}`}
                onClick={() => updateRole("admin")}
              >
                Admin
              </button>
            </div>

            <div className="floating-input mb-3">
              <span className="input-icon">U</span>
              <input id="reg-name" name="name" value={form.name} onChange={handleChange} placeholder=" " required />
              <label htmlFor="reg-name">Name</label>
            </div>
            {errors.name && <p className="field-error">{errors.name}</p>}

            <div className="floating-input mb-3">
              <span className="input-icon">@</span>
              <input id="reg-email" type="email" name="email" value={form.email} onChange={handleChange} placeholder=" " required />
              <label htmlFor="reg-email">Email</label>
            </div>
            {errors.email && <p className="field-error">{errors.email}</p>}

            <div className="floating-input password-wrap mb-3">
              <span className="input-icon">*</span>
              <input
                id="reg-password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder=" "
                required
              />
              <label htmlFor="reg-password">Password</label>
              <button type="button" className="password-toggle" onClick={() => setShowPassword((prev) => !prev)}>
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {errors.password && <p className="field-error">{errors.password}</p>}

            {form.role === "student" ? (
              <>
                <div className="floating-input mb-3">
                  <span className="input-icon">ID</span>
                  <input id="reg-roll" name="rollNumber" value={form.rollNumber} onChange={handleChange} placeholder=" " required />
                  <label htmlFor="reg-roll">Roll Number</label>
                </div>

                <div className="floating-input mb-3">
                  <span className="input-icon">TEL</span>
                  <input id="reg-mobile" name="mobileNumber" value={form.mobileNumber} onChange={handleChange} placeholder=" " required />
                  <label htmlFor="reg-mobile">Mobile Number</label>
                </div>
                {errors.mobileNumber && <p className="field-error">{errors.mobileNumber}</p>}

                <div className="floating-input mb-3">
                  <span className="input-icon">DEP</span>
                  <input id="reg-department" name="department" value={form.department} onChange={handleChange} placeholder=" " required />
                  <label htmlFor="reg-department">Department</label>
                </div>
              </>
            ) : null}

            {error ? <div className="alert alert-danger py-2">{error}</div> : null}

            <button className="btn register-submit w-100" type="submit" disabled={loading}>
              {loading ? (
                <span className="d-inline-flex align-items-center gap-2">
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                  Creating account...
                </span>
              ) : (
                "Register"
              )}
            </button>

            <p className="mt-3 mb-0 register-login-link">
              Already have an account? <Link to="/login">Login</Link>
            </p>
          </form>
        </section>
      </div>
    </main>
  );
}
