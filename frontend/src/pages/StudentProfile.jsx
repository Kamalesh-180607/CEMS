import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "../components/Navbar";
import { adminApi, eventsApi, registrationApi, studentsApi, usersApi } from "../services/api";

export default function StudentProfile() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ name: "", mobileNumber: "", department: "", profileImage: null });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [stats, setStats] = useState({
    eventsRegistered: 0,
    upcomingEvents: 0,
    pastEvents: 0,
    eventsCreated: 0,
    totalRegistrations: 0,
    adminUpcomingEvents: 0,
  });

  const user = useMemo(() => JSON.parse(localStorage.getItem("cemsUser") || "null"), []);
  const isAdmin = user?.role === "admin";
  const fileBaseUrl = import.meta.env.VITE_FILE_BASE_URL || "http://localhost:5000";

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("");
  };

  const loadActivitySummary = async (role) => {
    const now = new Date();

    if (role === "admin") {
      const { data: adminEvents } = await eventsApi.getMyEvents();
      const upcomingEvents = adminEvents.filter((event) => new Date(event.date) > now).length;

      const registrationLists = await Promise.all(
        adminEvents.map(async (event) => {
          try {
            const { data } = await registrationApi.getByEvent(event._id);
            return data;
          } catch {
            return [];
          }
        })
      );

      setStats((prev) => ({
        ...prev,
        eventsCreated: adminEvents.length,
        totalRegistrations: registrationLists.reduce((sum, list) => sum + list.length, 0),
        adminUpcomingEvents: upcomingEvents,
      }));
      return;
    }

    const { data } = await studentsApi.getActivitySummary();
    setStats((prev) => ({
      ...prev,
      eventsRegistered: data.totalRegistered || 0,
      upcomingEvents: data.upcoming || 0,
      pastEvents: data.past || 0,
    }));
  };

  const handleRemoveProfilePicture = async () => {
    if (saving) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const { data } = isAdmin
        ? await adminApi.removeProfilePicture()
        : await studentsApi.removeProfilePicture();
      if (data?.user) {
        localStorage.setItem("cemsUser", JSON.stringify(data.user));
      }
      setForm((prev) => ({ ...prev, profileImage: null }));
      setSuccess("Profile picture removed successfully");
      await loadProfile();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove profile picture");
    } finally {
      setSaving(false);
    }
  };

  const loadProfile = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await usersApi.getProfile();
      setProfile(data);
      setForm({
        name: data.name || "",
        mobileNumber: data.mobileNumber || "",
        department: data.department || "",
        profileImage: null,
      });
      await loadActivitySummary(data.role);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload = new FormData();
      payload.append("name", form.name);
      payload.append("mobileNumber", form.mobileNumber);
      payload.append("department", form.department);
      if (form.profileImage) {
        payload.append("profileImage", form.profileImage);
      }

      const { data } = await usersApi.updateProfile(payload);
      localStorage.setItem("cemsUser", JSON.stringify(data.user));
      setSuccess("Profile updated successfully");
      setIsModalOpen(false);
      await loadProfile();
    } catch (err) {
      setError(err.response?.data?.message || "Profile update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-shell pt-2 pb-4">
      <Navbar />
      <motion.section
        className="dashboard-hero"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        <div className="dashboard-hero-card profile-hero-card">
          <h2 className="mb-2">{isAdmin ? "Admin Profile" : "Student Profile"}</h2>
          <p className="mb-0">Manage your identity and track your activity summary.</p>
        </div>
      </motion.section>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-3 mb-0">Loading profile...</p>
        </div>
      ) : null}

      {error ? <div className="alert alert-danger">{error}</div> : null}
      {success ? <div className="alert alert-success">{success}</div> : null}

      {profile && !loading ? (
        <>
          <div className="row g-4 profile-layout-grid">
            <motion.div
              className="col-12"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28 }}
            >
              <div className="profile-header-card">
                <div className="profile-header-left">
                  {profile.profileImage ? (
                    <img
                      src={`${fileBaseUrl}${profile.profileImage}`}
                      alt={profile.name}
                      className="profile-avatar-image"
                      onClick={() => setIsImageModalOpen(true)}
                      title="Click to view full image"
                    />
                  ) : (
                    <div className="profile-avatar-fallback">{getInitials(profile.name)}</div>
                  )}
                  <div>
                    <h3 className="profile-user-name mb-1">{profile.name}</h3>
                    <p className="profile-user-meta mb-1">
                      {(profile.role || "student").toUpperCase()} - {profile.department || "Department not set"}
                    </p>
                    {!isAdmin ? <p className="profile-user-subtle mb-0">Roll No: {profile.rollNumber || "-"}</p> : null}
                  </div>
                </div>
                <button className="btn btn-primary profile-edit-btn" onClick={() => setIsModalOpen(true)}>
                  Edit Profile
                </button>
              </div>
            </motion.div>

            <motion.div
              className="col-12 col-lg-8"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05 }}
            >
              <div className="profile-info-card">
                <h4 className="profile-section-title">Profile Information</h4>
                <div className="profile-info-grid">
                  <div className="profile-info-item">
                    <span className="profile-info-label">Name</span>
                    <span className="profile-info-value">{profile.name || "-"}</span>
                  </div>
                  <div className="profile-info-item">
                    <span className="profile-info-label">Email</span>
                    <span className="profile-info-value">{profile.email || "-"}</span>
                  </div>
                  {!isAdmin ? (
                    <div className="profile-info-item">
                      <span className="profile-info-label">Roll Number</span>
                      <span className="profile-info-value">{profile.rollNumber || "-"}</span>
                    </div>
                  ) : null}
                  <div className="profile-info-item">
                    <span className="profile-info-label">Mobile Number</span>
                    <span className="profile-info-value">{profile.mobileNumber || "-"}</span>
                  </div>
                  <div className="profile-info-item">
                    <span className="profile-info-label">Department</span>
                    <span className="profile-info-value">{profile.department || "-"}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="col-12 col-lg-4"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <div className="profile-activity-card">
                <h4 className="profile-section-title">Activity Summary</h4>
                <div className="profile-stats-stack">
                  {isAdmin ? (
                    <>
                      <div className="profile-mini-stat">
                        <span className="profile-mini-stat-label">Events Created</span>
                        <strong>{stats.eventsCreated}</strong>
                      </div>
                      <div className="profile-mini-stat">
                        <span className="profile-mini-stat-label">Total Registrations</span>
                        <strong>{stats.totalRegistrations}</strong>
                      </div>
                      <div className="profile-mini-stat">
                        <span className="profile-mini-stat-label">Upcoming Events</span>
                        <strong>{stats.adminUpcomingEvents}</strong>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="profile-mini-stat">
                        <span className="profile-mini-stat-label">Events Registered</span>
                        <strong>{stats.eventsRegistered}</strong>
                      </div>
                      <div className="profile-mini-stat">
                        <span className="profile-mini-stat-label">Upcoming Events</span>
                        <strong>{stats.upcomingEvents}</strong>
                      </div>
                      <div className="profile-mini-stat">
                        <span className="profile-mini-stat-label">Past Events</span>
                        <strong>{stats.pastEvents}</strong>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          <AnimatePresence>
            {isImageModalOpen && profile?.profileImage ? (
              <motion.div
                className="image-modal"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsImageModalOpen(false)}
              >
                <motion.img
                  src={`${fileBaseUrl}${profile.profileImage}`}
                  alt={profile.name}
                  className="full-image"
                  initial={{ scale: 0.92, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.92, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={(e) => e.stopPropagation()}
                />
              </motion.div>
            ) : null}

            {isModalOpen ? (
              <motion.div
                className="profile-modal-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => !saving && setIsModalOpen(false)}
              >
                <motion.div
                  className="profile-modal-card"
                  initial={{ opacity: 0, scale: 0.96, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 20 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <h4 className="mb-3">Edit Profile</h4>
                  <form onSubmit={handleSubmit} className="row g-3">
                    <div className="col-12">
                      <div className="profile-preview">
                        {profile?.profileImage ? (
                          <img
                            src={`${fileBaseUrl}${profile.profileImage}`}
                            alt="Profile Preview"
                            className="profile-preview-img"
                          />
                        ) : (
                          <div className="profile-avatar-fallback profile-preview-img-fallback">{getInitials(profile?.name)}</div>
                        )}
                      </div>
                    </div>
                    <div className="col-12">
                      <label className="form-label">Name</label>
                      <input
                        className="form-control"
                        value={form.name}
                        onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Mobile Number</label>
                      <input
                        className="form-control"
                        value={form.mobileNumber}
                        onChange={(e) => setForm((prev) => ({ ...prev, mobileNumber: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Department</label>
                      <input
                        className="form-control"
                        value={form.department}
                        onChange={(e) => setForm((prev) => ({ ...prev, department: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Profile Picture (Optional)</label>
                      <input
                        type="file"
                        accept="image/*"
                        className="form-control"
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, profileImage: e.target.files?.[0] || null }))
                        }
                      />
                    </div>
                    {profile?.profileImage ? (
                      <div className="col-12 d-flex justify-content-start">
                        <button
                          type="button"
                          className="remove-photo-btn"
                          onClick={handleRemoveProfilePicture}
                          disabled={saving}
                        >
                          {saving ? "Removing..." : "Remove Picture"}
                        </button>
                      </div>
                    ) : null}
                    <div className="col-12 d-flex justify-content-end gap-2 mt-2">
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        disabled={saving}
                        onClick={() => setIsModalOpen(false)}
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary" disabled={saving}>
                        {saving ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </form>
                </motion.div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </>
      ) : null}
    </div>
  );
}
