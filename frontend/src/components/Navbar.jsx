import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("cemsUser") || "null");

  const handleLogout = () => {
    localStorage.removeItem("cemsToken");
    localStorage.removeItem("cemsUser");
    navigate("/login");
  };

  return (
    <header className="nav-shell">
      <div className="nav-brand">CEMS</div>
      <nav className="nav-links">
        {user?.role === "student" ? (
          <>
            <Link to="/student">Dashboard</Link>
            <Link to="/announcements">Announcements</Link>
          </>
        ) : (
          <>
            <Link to="/admin">Admin Panel</Link>
            <Link to="/announcements">Announcements</Link>
          </>
        )}
      </nav>
      <button className="btn ghost" onClick={handleLogout}>
        Logout
      </button>
    </header>
  );
}
