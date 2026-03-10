import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { eventsApi } from "../services/api";

export default function EventDetails() {
  const { id } = useParams();
  const user = JSON.parse(localStorage.getItem("cemsUser") || "null");
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data } = await eventsApi.getById(id);
        setEvent(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch event");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  if (loading) return <div className="loading">Loading event...</div>;
  if (error) return <div className="container py-4"><div className="alert alert-danger">{error}</div></div>;
  if (!event) return <div className="container py-4"><div className="alert alert-warning">Event not found</div></div>;

  return (
    <div className="container py-4">
      <Navbar />
      <section className="card border-0 shadow-sm p-3 p-md-4 mt-3">
        {event.bannerImage ? (
          <img
            src={`${import.meta.env.VITE_FILE_BASE_URL || "http://localhost:5000"}${event.bannerImage}`}
            alt={event.title}
            className="event-banner detail"
          />
        ) : null}
        <h1 className="mt-3 mb-2">{event.title}</h1>
        <div className="d-flex flex-wrap gap-2 mb-3">
          <span className="badge text-bg-primary">{event.eventType}</span>
          <span className="badge text-bg-light border text-dark">{event.hostingClub}</span>
          <span className="badge text-bg-light border text-dark">
            {Number(event.eventPrice) > 0 ? `Rs. ${event.eventPrice}` : "Free"}
          </span>
        </div>
        <p className="text-secondary">{event.description}</p>
        <div className="row g-2 mb-3">
          <div className="col-md-6 small text-secondary">Date: {new Date(event.date).toLocaleDateString()}</div>
          <div className="col-md-6 small text-secondary">Time: {event.time}</div>
          <div className="col-md-6 small text-secondary">Venue: {event.venue}</div>
          <div className="col-md-6 small text-secondary">
            Contact: {event.contactPersonName} ({event.contactPhoneNumber})
          </div>
          <div className="col-md-6 small text-secondary">
            Registration Deadline: {new Date(event.registrationDeadline).toLocaleDateString()}
          </div>
          <div className="col-md-6 small d-flex gap-3">
            {event.instagramLink ? <a href={event.instagramLink}>Instagram</a> : null}
            {event.whatsappGroupLink ? <a href={event.whatsappGroupLink}>WhatsApp Group</a> : null}
          </div>
        </div>
        {user?.role === "student" ? (
          <Link className="btn btn-primary" to={`/events/${event._id}/register`}>
            Register for this event
          </Link>
        ) : null}
      </section>
    </div>
  );
}
