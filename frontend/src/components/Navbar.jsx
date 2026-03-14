import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import Logo from "./Logo";
import { announcementApi } from "../services/api";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("cemsUser") || "null");
  const [unreadAnnouncements, setUnreadAnnouncements] = useState(0);
  const fileBaseUrl = import.meta.env.VITE_FILE_BASE_URL || "http://localhost:5000";
  const profileImageUrl = user?.profileImage ? `${fileBaseUrl}${user.profileImage}` : "";
  const profileInitial = (user?.name || "U").trim().charAt(0).toUpperCase();

  useEffect(() => {
    const loadUnreadAnnouncements = async () => {
      if (user?.role !== "student") {
        setUnreadAnnouncements(0);
        return;
      }

      if (location.pathname === "/announcements") {
        setUnreadAnnouncements(0);
        return;
      }

      try {
        const { data } = await announcementApi.getUnreadCount();
        setUnreadAnnouncements(data?.unreadCount || 0);
      } catch {
        setUnreadAnnouncements(0);
      }
    };

    loadUnreadAnnouncements();
  }, [location.pathname, user?.role]);

  const handleLogout = () => {
    localStorage.removeItem("cemsToken");
    localStorage.removeItem("cemsUser");
    navigate("/login");
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg px-3 py-3 cems-navbar fixed-top">
        <div className="container-fluid p-0 cems-navbar-inner">
          <div className="navbar-brand mb-0 d-flex align-items-center cems-navbar-left">
            <Logo compact />
          </div>
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
            <div className="navbar-nav gap-lg-1 mx-auto cems-nav-center cems-nav-links">
              {user?.role === "student" ? (
                <>
                  <NavLink to="/dashboard" className={({ isActive }) => `nav-link cems-nav-link ${isActive ? "active" : ""}`}>
                    Dashboard
                  </NavLink>
                  <NavLink to="/my-events" className={({ isActive }) => `nav-link cems-nav-link ${isActive ? "active" : ""}`}>
                    Registered Events
                  </NavLink>
                  <div className="nav-item announcement-nav">
                    <NavLink to="/announcements" className={({ isActive }) => `nav-link cems-nav-link ${isActive ? "active" : ""}`}>
                      Announcements
                    </NavLink>
                    {unreadAnnouncements > 0 ? <span className="announcement-badge">{unreadAnnouncements}</span> : null}
                  </div>
                </>
              ) : (
                <>
                  <NavLink to="/admin" end className={({ isActive }) => `nav-link cems-nav-link ${isActive ? "active" : ""}`}>
                    Dashboard
                  </NavLink>
                  <NavLink to="/admin/create-event" className={({ isActive }) => `nav-link cems-nav-link ${isActive ? "active" : ""}`}>
                    Create Event
                  </NavLink>
                  <NavLink to="/admin/announcements" className={({ isActive }) => `nav-link cems-nav-link ${isActive ? "active" : ""}`}>
                    Announcements
                  </NavLink>
                </>
              )}
            </div>
            <div className="d-flex align-items-center gap-2 ms-lg-3 cems-nav-right cems-navbar-right">
              <NavLink to="/profile" className={({ isActive }) => `btn btn-sm btn-outline-primary profile-btn ${isActive ? "active" : ""}`}>
                {profileImageUrl ? (
                  <img src={profileImageUrl} alt="Profile" className="profile-btn-avatar" />
                ) : (
                  <span className="profile-btn-avatar-fallback">{profileInitial}</span>
                )}
                <span>Profile</span>
              </NavLink>
              <button className="btn btn-outline-danger btn-sm cems-logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      <div className="cems-navbar-spacer" />
    </>
  );
}
