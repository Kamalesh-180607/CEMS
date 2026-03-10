import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { usersApi } from "../services/api";

export default function StudentProfile() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ name: "", mobileNumber: "", department: "" });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
      });
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
      const { data } = await usersApi.updateProfile(form);
      localStorage.setItem("cemsUser", JSON.stringify(data.user));
      setSuccess("Profile updated successfully");
      setEditing(false);
      await loadProfile();
    } catch (err) {
      setError(err.response?.data?.message || "Profile update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container py-4">
      <Navbar />
      <div className="hero-banner mt-3 mb-4 p-4">
        <h2 className="mb-1">Student Profile</h2>
        <p className="text-secondary mb-0">View and edit your profile details.</p>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-3 mb-0">Loading profile...</p>
        </div>
      ) : null}

      {error ? <div className="alert alert-danger">{error}</div> : null}
      {success ? <div className="alert alert-success">{success}</div> : null}

      {profile && !loading ? (
        <div className="card border-0 shadow-sm">
          <div className="card-body p-4">
            {!editing ? (
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label text-muted">Name</label>
                  <div className="fw-semibold">{profile.name}</div>
                </div>
                <div className="col-md-6">
                  <label className="form-label text-muted">Email</label>
                  <div className="fw-semibold">{profile.email}</div>
                </div>
                <div className="col-md-6">
                  <label className="form-label text-muted">Roll Number</label>
                  <div className="fw-semibold">{profile.rollNumber || "-"}</div>
                </div>
                <div className="col-md-6">
                  <label className="form-label text-muted">Mobile Number</label>
                  <div className="fw-semibold">{profile.mobileNumber || "-"}</div>
                </div>
                <div className="col-md-6">
                  <label className="form-label text-muted">Department</label>
                  <div className="fw-semibold">{profile.department || "-"}</div>
                </div>
                <div className="col-12 mt-3">
                  <button className="btn btn-primary" onClick={() => setEditing(true)}>
                    Edit Profile
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Name</label>
                  <input
                    className="form-control"
                    value={form.name}
                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Mobile Number</label>
                  <input
                    className="form-control"
                    value={form.mobileNumber}
                    onChange={(e) => setForm((prev) => ({ ...prev, mobileNumber: e.target.value }))}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Department</label>
                  <input
                    className="form-control"
                    value={form.department}
                    onChange={(e) => setForm((prev) => ({ ...prev, department: e.target.value }))}
                    required
                  />
                </div>
                <div className="col-12 d-flex gap-2 mt-2">
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setEditing(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
