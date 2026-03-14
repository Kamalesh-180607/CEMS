import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiBell, FiBellOff } from "react-icons/fi";
import Navbar from "../components/Navbar";
import AnnouncementCard from "../components/AnnouncementCard";
import { adminApi, announcementApi } from "../services/api";

export default function Announcements() {
  const user = JSON.parse(localStorage.getItem("cemsUser") || "null");
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [dismissingId, setDismissingId] = useState("");

  useEffect(() => {
    const loadAnnouncements = async () => {
      try {
        if (user?.role === "student") {
          await announcementApi.markViewed();
        }
        const { data } = await announcementApi.getAll();
        console.log("Announcements received:", data);
        setAnnouncements(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load announcements");
      } finally {
        setLoading(false);
      }
    };

    loadAnnouncements();
  }, []);

  const handleDismiss = async (announcementId) => {
    setError("");
    setSuccess("");
    setDismissingId(announcementId);

    try {
      await announcementApi.dismiss(announcementId);
      setAnnouncements((prev) => prev.filter((item) => item._id !== announcementId));
      setSuccess("Announcement cleared from your view");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to dismiss announcement");
    } finally {
      setDismissingId("");
    }
  };

  const handleHideForAdmin = async (announcementId) => {
    setError("");
    setSuccess("");

    try {
      await adminApi.hideAnnouncement(announcementId);
      setAnnouncements((prev) => prev.filter((item) => item._id !== announcementId));
      setSuccess("Announcement removed from your admin view");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove announcement from admin view");
    }
  };

  const clearAllAnnouncements = async () => {
    setError("");
    setSuccess("");

    try {
      if (user?.role === "admin") {
        await adminApi.clearAllAnnouncements();
        setSuccess("All announcements cleared for admin view");
      } else {
        await announcementApi.clearAll();
        setSuccess("All announcements cleared for student view");
      }
      setAnnouncements([]);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to clear announcements");
    }
  };

  return (
    <div className="dashboard-page">
      <Navbar />

      <section className="dashboard-hero announcement-hero">
        <div className="dashboard-shell">
          <motion.div
            className="dashboard-hero-card announcement-hero-card"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          >
            <div className="d-flex align-items-center gap-3">
              <span className="announcement-hero-icon">
                <FiBell size={24} />
              </span>
              <div>
                <h2 className="mb-1">Announcements</h2>
                <p className="mb-0">Important updates and notices related to campus events.</p>
              </div>
              <button
                type="button"
                className="clear-btn"
                onClick={clearAllAnnouncements}
                disabled={loading || !announcements.length}
              >
                Clear All
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="dashboard-shell dashboard-wrap">

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-3 mb-0">Loading announcements...</p>
        </div>
      ) : null}
      {error ? <div className="alert alert-danger">{error}</div> : null}
      {success ? <div className="alert alert-success">{success}</div> : null}

      {!loading && announcements.length ? (
        <AnimatePresence>
          <motion.div
            className="announcement-timeline"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {announcements.map((item, index) => (
              <motion.div
                className="announcement-timeline-item"
                key={item._id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, delay: Math.min(index, 8) * 0.05 }}
              >
                <span className="announcement-node" aria-hidden="true" />
                <AnnouncementCard
                  announcement={item}
                  canDismiss={user?.role === "student"}
                  canHideForAdmin={user?.role === "admin"}
                  isDismissing={dismissingId === item._id}
                  onDismiss={() => handleDismiss(item._id)}
                  onHideForAdmin={() => handleHideForAdmin(item._id)}
                />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      ) : null}

      {!announcements.length && !loading ? (
        <div className="announcement-empty-state">
          <span className="empty-icon">
            <FiBellOff size={28} />
          </span>
          <h4 className="mb-1">No announcements yet</h4>
          <p className="mb-0">Updates from event organizers will appear here.</p>
        </div>
      ) : null}
      </div>
    </div>
  );
}
