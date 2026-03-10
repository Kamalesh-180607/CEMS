import { Link } from "react-router-dom";

export default function EventCard({ event, showRegister = false }) {
  const isPaid = Number(event.eventPrice) > 0;
  const banner = `${import.meta.env.VITE_FILE_BASE_URL || "http://localhost:5000"}${event.bannerImage || ""}`;

  return (
    <article className="card event-card h-100 border-0 shadow-sm">
      {event.bannerImage ? <img src={banner} alt={event.title} className="event-banner" /> : <div className="event-placeholder" />}
      <div className="card-body d-flex flex-column">
        <div className="d-flex flex-wrap gap-2 mb-2">
          <span className="badge text-bg-primary">{event.eventType}</span>
          <span className="badge text-bg-light border text-dark">{event.hostingClub}</span>
        </div>
        <h5 className="card-title mb-2">{event.title}</h5>
        <p className="text-secondary small flex-grow-1">{event.description.slice(0, 120)}...</p>
        <div className="small text-secondary d-grid gap-1 mb-3">
          <span>Date: {new Date(event.date).toLocaleDateString()}</span>
          <span>Time: {event.time}</span>
          <span>Venue: {event.venue}</span>
          <span>Fee: {isPaid ? `Rs. ${event.eventPrice}` : "Free"}</span>
        </div>
        <div className="d-flex gap-2 mt-auto">
          <Link className="btn btn-outline-primary btn-sm" to={`/events/${event._id}`}>
            View Details
          </Link>
          {showRegister ? (
            <Link className="btn btn-primary btn-sm" to={`/events/${event._id}/register`}>
              Register
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  );
}
