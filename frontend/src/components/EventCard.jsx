import { useState } from "react";
import { Link } from "react-router-dom";
import PosterPreviewModal from "./PosterPreviewModal";

const POSTER_PLACEHOLDER = `data:image/svg+xml;utf8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="800" height="440" viewBox="0 0 800 440">
    <defs>
      <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stop-color="#e8f0ff"/>
        <stop offset="100%" stop-color="#dbeafe"/>
      </linearGradient>
    </defs>
    <rect width="800" height="440" rx="24" fill="url(#bg)"/>
    <circle cx="150" cy="110" r="70" fill="#bfdbfe"/>
    <circle cx="670" cy="320" r="92" fill="#c7d2fe"/>
    <rect x="180" y="150" width="440" height="16" rx="8" fill="#2563eb" opacity="0.88"/>
    <rect x="180" y="186" width="300" height="12" rx="6" fill="#60a5fa" opacity="0.92"/>
    <rect x="180" y="230" width="220" height="72" rx="18" fill="#ffffff" opacity="0.96"/>
    <text x="400" y="288" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="34" font-weight="700" fill="#1d4ed8">CEMS Event Poster</text>
  </svg>
`)}`;

const formatDate = (date) => {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "--/--/----";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

export default function EventCard({ event, showRegister = false, isRegistered = false, eventStatus = "", hasNewUpdates = false }) {
  const isPaid = Number(event.eventPrice) > 0;
  const banner = event.bannerImage
    ? `${import.meta.env.VITE_FILE_BASE_URL || "http://localhost:5000"}${event.bannerImage}`
    : POSTER_PLACEHOLDER;
  const statusLabel = eventStatus === "ongoing" ? "Ongoing" : eventStatus === "upcoming" ? "Upcoming" : "";
  const shortDescription = (event.description || "").slice(0, 120);
  const [previewPoster, setPreviewPoster] = useState(null);

  return (
    <article className="card event-card h-100 border-0 shadow-sm">
      {previewPoster ? (
        <PosterPreviewModal src={previewPoster} alt={event.title} onClose={() => setPreviewPoster(null)} />
      ) : null}
      {isRegistered ? (
        <span className="event-registered-chip registered-badge">
          ✔ Registered
        </span>
      ) : null}
      {hasNewUpdates ? <span className="event-updated-chip">Updated</span> : null}
      <img
        src={banner}
        alt={event.title}
        className="event-banner event-banner-clickable"
        onClick={() => setPreviewPoster(banner)}
        title="Click to view full poster"
      />
      <div className="card-body d-flex flex-column p-4">
        <div className="d-flex flex-wrap gap-2 mb-3">
          <span className="badge event-category-badge">{event.eventType}</span>
          {statusLabel ? <span className={`badge event-status-badge ${eventStatus}`}>{statusLabel}</span> : null}
          <span className="badge event-club-badge">{event.hostingClub}</span>
        </div>
        <h5 className="card-title mb-2 fw-bold">{event.title}</h5>
        <p className="text-secondary small flex-grow-1 mb-3">{shortDescription}{event.description?.length > 120 ? "..." : ""}</p>
        <div className="small text-secondary d-grid gap-1 mb-4 event-info-list">
          <span>Date: {formatDate(event.date)}</span>
          <span>Time: {event.time}</span>
          <span>Venue: {event.venue}</span>
          <span>Fee: {isPaid ? `Rs. ${event.eventPrice}` : "Free"}</span>
        </div>
        <div className="d-flex gap-2 mt-auto">
          <Link className="btn btn-outline-primary btn-sm event-action-btn event-action-secondary" to={`/events/${event._id}`}>
            View Details
          </Link>
          {showRegister ? (
            isRegistered ? (
              <button type="button" className="btn btn-sm event-action-btn event-action-registered registered-btn" disabled>
                Registered
              </button>
            ) : (
              <Link className="btn btn-primary btn-sm event-action-btn event-action-primary register-btn" to={`/events/${event._id}/register`}>
                Register
              </Link>
            )
          ) : null}
        </div>
      </div>
    </article>
  );
}
