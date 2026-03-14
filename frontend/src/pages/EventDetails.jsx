import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FiBell } from "react-icons/fi";
import Navbar from "../components/Navbar";
import { eventsApi, registrationApi } from "../services/api";

export default function EventDetails() {
  const { id } = useParams();
  const user = JSON.parse(localStorage.getItem("cemsUser") || "null");
  const [event, setEvent] = useState(null);
  const [registeredAt, setRegisteredAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        if (user?.role === "student") {
          const [{ data: eventData }, { data: registrations }] = await Promise.all([
            eventsApi.getById(id),
            registrationApi.getMyEvents(),
          ]);

          setEvent(eventData);
          const matchingRegistration = registrations.find((entry) => entry?.event?._id === id);
          setRegisteredAt(matchingRegistration?.registeredAt || matchingRegistration?.registrationDate || null);
        } else {
          const { data } = await eventsApi.getById(id);
          setEvent(data);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch event");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  if (loading) {
    return (
      <div className="page-shell py-4">
        <Navbar />
        <div className="loading">Loading event...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-shell py-4">
        <Navbar />
        <div className="alert alert-danger mt-3">{error}</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="page-shell py-4">
        <Navbar />
        <div className="alert alert-warning mt-3">Event not found</div>
      </div>
    );
  }

  const isDeleted = event.status === "deleted";
  const visibleUpdates = user?.role === "student"
    ? (registeredAt
      ? (event.updates || []).filter((entry) => new Date(entry.date || entry.createdAt) > new Date(registeredAt))
      : [])
    : event.updates || [];

  return (
    <div className="page-shell py-4">
      <Navbar />
      <section className="card border-0 shadow-sm p-3 p-md-4 mt-3">
        {event.bannerImage ? (
          <div className="poster-wrapper">
            <img
              src={`${import.meta.env.VITE_FILE_BASE_URL || "http://localhost:5000"}${event.bannerImage}`}
              alt={event.title}
              className="event-details-poster"
            />
          </div>
        ) : null}
        <h1 className="mt-3 mb-2">{event.title}</h1>
        <div className="d-flex flex-wrap gap-2 mb-3">
          <span className="badge text-bg-primary">{event.eventType}</span>
          <span className="badge text-bg-light border text-dark">{event.hostingClub}</span>
          <span className="badge text-bg-light border text-dark">
            {Number(event.eventPrice) > 0 ? `Rs. ${event.eventPrice}` : "Free"}
          </span>
        </div>
        <p className="text-secondary event-description">{event.description}</p>
        {isDeleted ? (
          <div className="alert alert-warning">
            This event was removed by the admin. Please contact the event organizer for more details.
          </div>
        ) : null}
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
        {user?.role === "student" && visibleUpdates.length ? (
          <section className="event-updates-panel mb-4">
            <h3 className="event-updates-title">Updates</h3>
            <div className="event-updates-list">
              {[...visibleUpdates]
                .sort((left, right) => new Date(right.date || right.createdAt) - new Date(left.date || left.createdAt))
                .map((entry, index) => (
                  <div className="event-update-item" key={`${entry.date || entry.createdAt}-${index}`}>
                    <span className="event-update-icon"><FiBell size={14} /></span>
                    <div>
                      <p className="mb-1">{entry.message}</p>
                      <span className="event-update-date">{new Date(entry.date || entry.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
            </div>
          </section>
        ) : null}
        {user?.role === "student" && !isDeleted ? (
          <Link className="btn btn-primary" to={`/events/${event._id}/register`}>
            Register for this event
          </Link>
        ) : null}
      </section>
    </div>
  );
}
