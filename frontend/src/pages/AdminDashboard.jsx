import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiCalendar, FiEdit2, FiPlus, FiTrash2, FiUsers, FiX } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import PosterPreviewModal from "../components/PosterPreviewModal";
import { eventsApi, registrationApi } from "../services/api";

const POSTER_PLACEHOLDER = `data:image/svg+xml;utf8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="800" height="440" viewBox="0 0 800 440">
    <defs>
      <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stop-color="#e8f0ff"/>
        <stop offset="100%" stop-color="#dbeafe"/>
      </linearGradient>
    </defs>
    <rect width="800" height="440" rx="24" fill="url(#bg)"/>
    <circle cx="150" cy="110" r="70" fill="#bfdbfe"/>
    <circle cx="670" cy="320" r="92" fill="#c7d2fe"/>
    <rect x="180" y="150" width="440" height="16" rx="8" fill="#2563eb" opacity="0.88"/>
    <rect x="180" y="186" width="300" height="12" rx="6" fill="#60a5fa" opacity="0.92"/>
    <rect x="180" y="230" width="220" height="72" rx="18" fill="#ffffff" opacity="0.96"/>
    <text x="400" y="288" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="34" font-weight="700" fill="#1d4ed8">CEMS Event Poster</text>
  </svg>
`)}`;

export default function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [events, setEvents] = useState([]);
  const [selectedEventForRegistrations, setSelectedEventForRegistrations] = useState(null);
  const [previewPoster, setPreviewPoster] = useState(null);
  const [showRegistrations, setShowRegistrations] = useState(false);
  const [registrations, setRegistrations] = useState([]);
  const [totalRegistrations, setTotalRegistrations] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadEvents = async () => {
    try {
      const { data } = await eventsApi.getMyEvents();
      console.log("API Response:", data);
      setEvents(data);

      const registrationLists = await Promise.all(
        data.map(async (event) => {
          try {
            const { data: eventRegs } = await registrationApi.getByEvent(event._id);
            return eventRegs;
          } catch {
            return [];
          }
        })
      );
      setTotalRegistrations(registrationLists.reduce((sum, list) => sum + list.length, 0));
    } catch (err) {
      console.error("Failed to load admin events", err);
      setError(err.response?.data?.message || "Failed to load admin events");
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccess(location.state.successMessage);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, location.state, navigate]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this event?")) return;
    try {
      console.log("Deleting event:", id);
      const response = await eventsApi.remove(id);
      console.log("API Response:", response.data);
      setEvents((prev) => prev.filter((event) => event._id !== id));
      if (selectedEventForRegistrations?._id === id) {
        setSelectedEventForRegistrations(null);
        setRegistrations([]);
        setShowRegistrations(false);
      }
      await loadEvents();
    } catch (err) {
      console.error("Delete failed", err);
      setError(err.response?.data?.message || "Delete failed");
    }
  };

  const loadRegistrations = async (event) => {
    try {
      const { data } = await registrationApi.getByEvent(event._id);
      setRegistrations(data);
      setSelectedEventForRegistrations(event);
      setShowRegistrations(true);
    } catch (err) {
      console.error("Failed to load registrations", err);
      setError(err.response?.data?.message || "Failed to load registrations");
    }
  };

  const upcomingEvents = events.filter((event) => new Date(event.date) > new Date()).length;

  return (
    <div className="dashboard-page">
      {previewPoster ? (
        <PosterPreviewModal src={previewPoster} alt="Event Poster" onClose={() => setPreviewPoster(null)} />
      ) : null}
      <Navbar />

      <motion.section
        className="dashboard-hero"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        <div className="dashboard-shell">
          <div className="dashboard-hero-card">
            <h2 className="mb-2">Admin Dashboard</h2>
            <p className="mb-0">Monitor activity and manage your campus events.</p>
          </div>
        </div>
      </motion.section>

      <div className="dashboard-shell dashboard-wrap">
        {success ? (
          <motion.div
            className="alert alert-success mb-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {success}
          </motion.div>
        ) : null}

        {error ? (
          <motion.div
            className="alert alert-danger mb-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.div>
        ) : null}

        <motion.div
          className="row g-3 mb-4 dashboard-stats-row"
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: {
              transition: { staggerChildren: 0.08 },
            },
          }}
        >
          <motion.div className="col-md-4" variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}>
            <div className="card border-0 shadow-sm stat-card stat-modern stat-blue">
              <div className="card-body d-flex align-items-start justify-content-between gap-3">
                <div>
                  <p className="text-secondary mb-1">Total Events Created</p>
                  <h3 className="mb-0">{events.length}</h3>
                </div>
                <span className="stat-icon-wrap"><FiCalendar size={22} /></span>
              </div>
            </div>
          </motion.div>
          <motion.div className="col-md-4" variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}>
            <div className="card border-0 shadow-sm stat-card stat-modern stat-violet">
              <div className="card-body d-flex align-items-start justify-content-between gap-3">
                <div>
                  <p className="text-secondary mb-1">Upcoming Events</p>
                  <h3 className="mb-0">{upcomingEvents}</h3>
                </div>
                <span className="stat-icon-wrap"><FiCalendar size={22} /></span>
              </div>
            </div>
          </motion.div>
          <motion.div className="col-md-4" variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}>
            <div className="card border-0 shadow-sm stat-card stat-modern stat-cyan">
              <div className="card-body d-flex align-items-start justify-content-between gap-3">
                <div>
                  <p className="text-secondary mb-1">Total Registrations</p>
                  <h3 className="mb-0">{totalRegistrations}</h3>
                </div>
                <span className="stat-icon-wrap"><FiUsers size={22} /></span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        <motion.section
          className="admin-events-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.2 }}
        >
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
            <h3 className="admin-section-title mb-0">My Events</h3>
            <motion.button
              type="button"
              className="btn event-action-btn event-action-primary admin-create-quick-btn"
              onClick={() => navigate("/admin/create-event")}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <FiPlus size={16} /> + Create Event
            </motion.button>
          </div>

          {events.length ? (
            <div className="row g-4">
              <AnimatePresence>
                {events.map((event, index) => (
                  <motion.div
                    className="col-12 col-md-6 col-lg-4"
                    key={event._id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.22, delay: Math.min(index, 6) * 0.05 }}
                  >
                    <div className="admin-event-card">
                      <img
                        src={event.bannerImage ? `${import.meta.env.VITE_FILE_BASE_URL || "http://localhost:5000"}${event.bannerImage}` : POSTER_PLACEHOLDER}
                        alt={event.title}
                        className="admin-event-banner event-banner-clickable"
                        onClick={() => setPreviewPoster(event.bannerImage ? `${import.meta.env.VITE_FILE_BASE_URL || "http://localhost:5000"}${event.bannerImage}` : POSTER_PLACEHOLDER)}
                        title="Click to view full poster"
                      />

                      <div className="admin-event-body">
                        <div className="d-flex align-items-start justify-content-between mb-2">
                          <h5 className="admin-event-title mb-0">{event.title}</h5>
                          <span className="admin-event-type-badge">{event.eventType}</span>
                        </div>

                        <div className="admin-event-meta">
                          <p className="admin-event-venue mb-1">
                            <strong>Venue:</strong> {event.venue}
                          </p>
                          <p className="admin-event-date mb-1">
                            <strong>Date:</strong> {new Date(event.date).toLocaleDateString()}
                          </p>
                          <p className="admin-event-time mb-0">
                            <strong>Time:</strong> {event.time}
                          </p>
                        </div>

                        <div className="admin-event-actions mt-3">
                          <motion.button
                            type="button"
                            className="btn btn-sm btn-outline-primary admin-action-btn"
                            onClick={() => navigate("/admin/create-event", { state: { event } })}
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                          >
                            <FiEdit2 size={14} /> Edit
                          </motion.button>

                          <motion.button
                            type="button"
                            className="btn btn-sm btn-outline-success admin-action-btn"
                            onClick={() => loadRegistrations(event)}
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                          >
                            <FiUsers size={14} /> Registrations
                          </motion.button>

                          <motion.button
                            type="button"
                            className="btn btn-sm btn-outline-danger admin-action-btn"
                            onClick={() => handleDelete(event._id)}
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                          >
                            <FiTrash2 size={14} /> Delete
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <motion.div
              className="alert alert-info"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              No events created yet. Click + Create Event to get started.
            </motion.div>
          )}
        </motion.section>

        {/* Registrations Modal */}
        <AnimatePresence>
          {showRegistrations && selectedEventForRegistrations && (
            <motion.div
              className="admin-registrations-modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRegistrations(false)}
            >
              <motion.div
                className="admin-registrations-modal"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="admin-modal-header">
                  <h3 className="mb-0">Event Registrations</h3>
                  <button
                    type="button"
                    className="admin-modal-close"
                    onClick={() => setShowRegistrations(false)}
                  >
                    <FiX size={24} />
                  </button>
                </div>

                <div className="admin-modal-body">
                  <h5 className="admin-modal-subtitle mb-3">{selectedEventForRegistrations.title}</h5>

                  {registrations.length ? (
                    <div className="admin-registrations-table-wrap">
                      <table className="admin-registrations-table">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Roll Number</th>
                            <th>Email</th>
                            <th>Mobile</th>
                            <th>Payment</th>
                          </tr>
                        </thead>
                        <tbody>
                          {registrations.map((entry) => (
                            <tr key={entry._id}>
                              <td className="admin-table-name">
                                {entry.studentId?.name || "N/A"}
                              </td>
                              <td>{entry.rollNumber}</td>
                              <td className="admin-table-email">{entry.email}</td>
                              <td>{entry.mobileNumber}</td>
                              <td>
                                <span className={`admin-payment-badge ${entry.paymentStatus}`}>
                                  {entry.paymentStatus}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-muted mb-0">No registrations yet for this event.</p>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
