import { Link } from "react-router-dom";

export default function EventCard({ event, showRegister = false }) {
  const isPaid = Number(event.eventPrice) > 0;

  return (
    <article className="card event-card">
      {event.bannerImage ? (
        <img
          src={`${import.meta.env.VITE_FILE_BASE_URL || "http://localhost:5000"}${event.bannerImage}`}
          alt={event.title}
          className="event-banner"
        />
      ) : null}
      <div className="event-body">
        <div className="pill-row">
          <span className="pill">{event.eventType}</span>
          <span className="pill muted">{event.hostingClub}</span>
        </div>
        <h3>{event.title}</h3>
        <p>{event.description.slice(0, 120)}...</p>
        <div className="event-meta">
          <span>{new Date(event.date).toLocaleDateString()}</span>
          <span>{event.time}</span>
          <span>{event.venue}</span>
          <span>{isPaid ? `Rs. ${event.eventPrice}` : "Free"}</span>
        </div>
        <div className="action-row">
          <Link className="btn" to={`/events/${event._id}`}>
            View Details
          </Link>
          {showRegister ? (
            <Link className="btn accent" to={`/events/${event._id}/register`}>
              Register
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  );
}
