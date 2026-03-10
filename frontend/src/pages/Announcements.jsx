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
    <div className="page-wrap">
      <Navbar />
      <section className="hero">
        <h1>Announcements</h1>
        <p>Important event updates from admins.</p>
      </section>

      {loading ? <div className="loading">Loading announcements...</div> : null}
      {error ? <div className="error">{error}</div> : null}

      <section className="grid cards-grid">
        {announcements.map((item) => (
          <AnnouncementCard key={item._id} announcement={item} />
        ))}
        {!announcements.length && !loading ? <p>No announcements yet.</p> : null}
      </section>
    </div>
  );
}
