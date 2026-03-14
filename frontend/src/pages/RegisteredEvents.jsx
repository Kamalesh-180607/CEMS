import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiCalendar, FiCheckCircle, FiCreditCard, FiMapPin } from "react-icons/fi";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { registrationApi } from "../services/api";
import { formatDate } from "../utils/date";

export default function RegisteredEvents() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [removingId, setRemovingId] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await registrationApi.getMyEvents();
        setItems(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch your registrations");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleRemove = async (registrationId) => {
    if (!window.confirm("Remove this deleted event from your list?")) return;

    setRemovingId(registrationId);
    setError("");
    setSuccess("");

    try {
      await registrationApi.remove(registrationId);
      setItems((prev) => prev.filter((entry) => entry._id !== registrationId));
      setSuccess("Removed deleted event from your list");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove registration");
    } finally {
      setRemovingId("");
    }
  };

  return (
    <div className="dashboard-page">
      <Navbar />

      <section className="dashboard-hero registered-hero">
        <div className="dashboard-shell">
          <motion.div
            className="dashboard-hero-card registered-hero-card"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          >
            <h2 className="mb-2">My Registered Events</h2>
            <p className="mb-0">Track your registrations and payment status.</p>
          </motion.div>
        </div>
      </section>

      <div className="dashboard-shell dashboard-wrap">

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-3 mb-0">Loading your events...</p>
        </div>
      ) : null}

      {error ? <div className="alert alert-danger">{error}</div> : null}
      {success ? <div className="alert alert-success">{success}</div> : null}

      {!loading && items.length ? (
        <AnimatePresence>
          <motion.div
            className="row g-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {items.map((entry, index) => {
              const event = entry.event || {};
              const isDeleted = event.status === "deleted";
              const paymentLabel = entry.paymentStatus === "paid" ? "Paid" : entry.paymentStatus === "free" ? "Free" : entry.paymentStatus || "Pending";
              const registrationLabel = entry.registrationStatus || "Registered";

              return (
                <motion.div
                  className="col-12 col-md-6 col-xl-4"
                  key={entry._id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, delay: Math.min(index, 6) * 0.05 }}
                  whileHover={{ y: -4, scale: 1.01 }}
                >
                  <article className={`registered-card h-100 ${isDeleted ? "registered-card-deleted" : ""}`}>
                    <div className="registered-card-top">
                      <h5 className="mb-2 fw-bold">{event.title || "Event"}</h5>
                      <div className="d-flex flex-wrap gap-2">
                        <span className={`badge registered-badge ${entry.paymentStatus === "paid" ? "paid" : "free"}`}>
                          <FiCreditCard size={12} /> {paymentLabel}
                        </span>
                        <span className="badge registered-badge status">
                          <FiCheckCircle size={12} /> {registrationLabel}
                        </span>
                      </div>
                    </div>

                    <div className="registered-card-body">
                      {isDeleted ? (
                        <div className="registered-warning">
                          <strong>Warning:</strong> This event was removed by the admin. Please contact the event organizer.
                        </div>
                      ) : null}
                      <div className="registered-info-row">
                        <FiCalendar size={16} />
                        <span>{event.date ? formatDate(event.date) : "-"}</span>
                      </div>
                      <div className="registered-info-row">
                        <FiMapPin size={16} />
                        <span>{event.venue || "-"}</span>
                      </div>
                    </div>

                    <div className="registered-card-footer">
                      <div className="registered-card-actions">
                        <Link className="btn event-action-btn event-action-primary flex-fill" to={`/events/${event._id}`}>
                          View Event Details
                        </Link>
                        {isDeleted ? (
                          <button
                            type="button"
                            className="btn event-action-btn event-action-danger flex-fill"
                            disabled={removingId === entry._id}
                            onClick={() => handleRemove(entry._id)}
                          >
                            {removingId === entry._id ? "Removing..." : "Remove from my list"}
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </article>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      ) : null}

      {!loading && !items.length ? <div className="alert alert-info">You have not registered for any event yet.</div> : null}
      </div>
    </div>
  );
}
