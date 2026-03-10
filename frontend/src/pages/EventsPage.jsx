import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import EventCard from "../components/EventCard";
import { eventsApi } from "../services/api";

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    eventType: "",
    club: "",
    status: "",
  });

  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await eventsApi.getEvents(filters);
        setEvents(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch events");
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [filters.search, filters.eventType, filters.club, filters.status]);

  const clubs = useMemo(() => [...new Set(events.map((event) => event.hostingClub))], [events]);

  return (
    <div className="container py-4">
      <Navbar />

      <div className="hero-banner mt-3 mb-4 p-4">
        <h2 className="mb-1">Explore Campus Events</h2>
        <p className="text-secondary mb-0">Find technical events, non technical events, and workshops in one place.</p>
      </div>

      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <input
                className="form-control"
                placeholder="Search by title, club or description"
                value={filters.search}
                onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
              />
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={filters.eventType}
                onChange={(e) => setFilters((prev) => ({ ...prev, eventType: e.target.value }))}
              >
                <option value="">All Categories</option>
                <option value="Technical">Technical Events</option>
                <option value="Non Technical">Non Technical Events</option>
                <option value="Workshop">Workshops</option>
              </select>
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={filters.club}
                onChange={(e) => setFilters((prev) => ({ ...prev, club: e.target.value }))}
              >
                <option value="">All Clubs</option>
                {clubs.map((club) => (
                  <option key={club} value={club}>
                    {club}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <select
                className="form-select"
                value={filters.status}
                onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
              >
                <option value="">All Status</option>
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-3 mb-0">Loading events...</p>
        </div>
      ) : null}

      {error ? <div className="alert alert-danger">{error}</div> : null}

      <div className="row g-4">
        {events.map((event) => (
          <div className="col-md-6 col-lg-4" key={event._id}>
            <EventCard event={event} showRegister />
          </div>
        ))}
      </div>

      {!events.length && !loading ? <div className="alert alert-info mt-4">No events found for selected filters.</div> : null}
    </div>
  );
}
