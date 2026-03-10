import { NavLink, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("cemsUser") || "null");

  const handleLogout = () => {
    localStorage.removeItem("cemsToken");
    localStorage.removeItem("cemsUser");
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg bg-white rounded-4 shadow-sm px-3 py-3">
      <div className="container-fluid p-0">
        <span className="navbar-brand fw-bold">CEMS</span>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#cemsNav"
          aria-controls="cemsNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="cemsNav">
          <div className="navbar-nav gap-lg-1 me-auto">
            {user?.role === "student" ? (
              <>
                <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
                  Dashboard
                </NavLink>
                <NavLink to="/events" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
                  Events
                </NavLink>
                <NavLink to="/my-events" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
                  Registered Events
                </NavLink>
                <NavLink to="/announcements" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
                  Announcements
                </NavLink>
                <NavLink to="/profile" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
                  Profile
                </NavLink>
              </>
            ) : (
              <>
                <NavLink to="/admin" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
                  Admin Panel
                </NavLink>
                <NavLink to="/announcements" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
                  Announcements
                </NavLink>
              </>
            )}
          </div>
          <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
