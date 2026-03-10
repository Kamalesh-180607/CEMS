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
  if (error) return <div className="error">{error}</div>;
  if (!event) return <div className="error">Event not found</div>;

  return (
    <div className="page-wrap">
      <Navbar />
      <section className="card detail-card">
        {event.bannerImage ? (
          <img
            src={`${import.meta.env.VITE_FILE_BASE_URL || "http://localhost:5000"}${event.bannerImage}`}
            alt={event.title}
            className="event-banner detail"
          />
        ) : null}
        <h1>{event.title}</h1>
        <div className="pill-row">
          <span className="pill">{event.eventType}</span>
          <span className="pill muted">{event.hostingClub}</span>
          <span className="pill muted">
            {Number(event.eventPrice) > 0 ? `Rs. ${event.eventPrice}` : "Free"}
          </span>
        </div>
        <p>{event.description}</p>
        <div className="detail-grid">
          <span>Date: {new Date(event.date).toLocaleDateString()}</span>
          <span>Time: {event.time}</span>
          <span>Venue: {event.venue}</span>
          <span>Contact: {event.contactPersonName} ({event.contactPhoneNumber})</span>
          <span>Registration Deadline: {new Date(event.registrationDeadline).toLocaleDateString()}</span>
          {event.instagramLink ? <a href={event.instagramLink}>Instagram</a> : null}
          {event.whatsappGroupLink ? <a href={event.whatsappGroupLink}>WhatsApp Group</a> : null}
        </div>
        {user?.role === "student" ? (
          <Link className="btn accent" to={`/events/${event._id}/register`}>
            Register for this event
          </Link>
        ) : null}
      </section>
    </div>
  );
}
