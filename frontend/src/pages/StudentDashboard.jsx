import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import EventCard from "../components/EventCard";
import AnnouncementCard from "../components/AnnouncementCard";
import { announcementApi, eventsApi } from "../services/api";

export default function StudentDashboard() {
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    eventType: "",
    club: "",
    status: "",
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError("");
      try {
        const [eventsRes, announcementsRes] = await Promise.all([
          eventsApi.getEvents(filters),
          announcementApi.getAll(),
        ]);
        setEvents(eventsRes.data);
        setAnnouncements(announcementsRes.data.slice(0, 3));
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [filters.search, filters.eventType, filters.club, filters.status]);

  const clubs = useMemo(() => [...new Set(events.map((e) => e.hostingClub))], [events]);

  return (
    <div className="page-wrap">
      <Navbar />
      <section className="hero">
        <h1>Student Dashboard</h1>
        <p>Explore events, filter quickly, and register in minutes.</p>
      </section>

      <section className="card filter-grid">
        <input
          placeholder="Search events"
          value={filters.search}
          onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
        />
        <select
          value={filters.eventType}
          onChange={(e) => setFilters((prev) => ({ ...prev, eventType: e.target.value }))}
        >
          <option value="">All Categories</option>
          <option value="Technical">Technical Events</option>
          <option value="Non Technical">Non Technical Events</option>
          <option value="Workshop">Workshops</option>
        </select>
        <select value={filters.club} onChange={(e) => setFilters((prev) => ({ ...prev, club: e.target.value }))}>
          <option value="">All Clubs</option>
          {clubs.map((club) => (
            <option key={club} value={club}>
              {club}
            </option>
          ))}
        </select>
        <select
          value={filters.status}
          onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
        >
          <option value="">All Status</option>
          <option value="upcoming">Upcoming</option>
          <option value="ongoing">Ongoing</option>
        </select>
      </section>

      {loading ? <div className="loading">Loading dashboard...</div> : null}
      {error ? <div className="error">{error}</div> : null}

      <section className="grid two-col">
        <div>
          <h2>All Events</h2>
          <div className="grid cards-grid">
            {events.map((event) => (
              <EventCard key={event._id} event={event} showRegister />
            ))}
            {!events.length && !loading ? <p>No events found.</p> : null}
          </div>
        </div>

        <aside>
          <h2>Latest Announcements</h2>
          <div className="grid">
            {announcements.map((announcement) => (
              <AnnouncementCard key={announcement._id} announcement={announcement} />
            ))}
            {!announcements.length && !loading ? <p>No announcements yet.</p> : null}
          </div>
        </aside>
      </section>
    </div>
  );
}
