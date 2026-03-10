import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import EventCard from "../components/EventCard";
import AnnouncementCard from "../components/AnnouncementCard";
import { announcementApi, eventsApi, registrationApi } from "../services/api";

export default function StudentDashboard() {
  const [events, setEvents] = useState([]);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError("");
      try {
        const [eventsRes, announcementsRes, myRegsRes] = await Promise.all([
          eventsApi.getEvents(),
          announcementApi.getAll(),
          registrationApi.getMyEvents(),
        ]);
        setEvents(eventsRes.data);
        setAnnouncements(announcementsRes.data.slice(0, 3));
        setRegisteredEvents(myRegsRes.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return events.filter((event) => new Date(event.date) > now).slice(0, 3);
  }, [events]);

  const upcomingCount = useMemo(() => {
    const now = new Date();
    return events.filter((event) => new Date(event.date) > now).length;
  }, [events]);

  return (
    <div className="container py-4">
      <Navbar />

      <div className="hero-banner mt-3 mb-4 p-4">
        <h2 className="mb-1">Welcome back</h2>
        <p className="text-secondary mb-0">Check quick stats, latest announcements, and upcoming campus events.</p>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm stat-card">
            <div className="card-body">
              <p className="text-secondary mb-1">Total Events</p>
              <h3 className="mb-0">{events.length}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm stat-card">
            <div className="card-body">
              <p className="text-secondary mb-1">Upcoming Events</p>
              <h3 className="mb-0">{upcomingCount}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm stat-card">
            <div className="card-body">
              <p className="text-secondary mb-1">Registered Events</p>
              <h3 className="mb-0">{registeredEvents.length}</h3>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-3 mb-0">Loading dashboard...</p>
        </div>
      ) : null}
      {error ? <div className="alert alert-danger">{error}</div> : null}

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">Upcoming Events Preview</h5>
            <Link to="/events" className="btn btn-outline-primary btn-sm">
              View All Events
            </Link>
          </div>
          <div className="row g-4">
            {upcomingEvents.map((event) => (
              <div className="col-md-6" key={event._id}>
                <EventCard event={event} showRegister />
              </div>
            ))}
            {!upcomingEvents.length && !loading ? <p className="text-secondary">No upcoming events right now.</p> : null}
          </div>
        </div>
        <div className="col-lg-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">Latest Announcements</h5>
            <Link to="/announcements" className="btn btn-outline-secondary btn-sm">
              View All
            </Link>
          </div>
          <div className="d-grid gap-3">
            {announcements.map((announcement) => (
              <AnnouncementCard key={announcement._id} announcement={announcement} />
            ))}
            {!announcements.length && !loading ? <p className="text-secondary">No announcements yet.</p> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
