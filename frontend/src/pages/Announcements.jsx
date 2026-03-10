import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import AnnouncementCard from "../components/AnnouncementCard";
import { announcementApi } from "../services/api";

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAnnouncements = async () => {
      try {
        const { data } = await announcementApi.getAll();
        setAnnouncements(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load announcements");
      } finally {
        setLoading(false);
      }
    };

    loadAnnouncements();
  }, []);

  return (
    <div className="container py-4">
      <Navbar />
      <div className="hero-banner mt-3 mb-4 p-4">
        <h2 className="mb-1">Announcements</h2>
        <p className="text-secondary mb-0">Important updates and notices for campus events.</p>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-3 mb-0">Loading announcements...</p>
        </div>
      ) : null}
      {error ? <div className="alert alert-danger">{error}</div> : null}

      <div className="row g-4">
        {announcements.map((item) => (
          <div className="col-md-6 col-lg-4" key={item._id}>
            <AnnouncementCard announcement={item} />
          </div>
        ))}
      </div>
      {!announcements.length && !loading ? <div className="alert alert-info mt-4">No announcements yet.</div> : null}
    </div>
  );
}
