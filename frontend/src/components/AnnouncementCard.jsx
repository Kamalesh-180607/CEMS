import { Link } from "react-router-dom";
import { FiX } from "react-icons/fi";

export default function AnnouncementCard({
  announcement,
  canDismiss = false,
  canHideForAdmin = false,
  isDismissing = false,
  onDismiss,
  onHideForAdmin,
}) {
  const eventTitle = announcement.eventId?.title || announcement.title || "Event Update";
  const postedOn = new Date(announcement.createdAt).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <article className="announcement-card">
      <div className="announcement-card-body">
        <div className="d-flex justify-content-between flex-wrap gap-2 mb-2">
          <h6 className="mb-0 fw-bold">{eventTitle}</h6>
          <div className="d-flex align-items-center gap-2">
            <span className="badge announcement-type-badge">{announcement.category || "New Event"}</span>
            {canDismiss ? (
              <button
                type="button"
                className="announcement-dismiss-icon"
                onClick={onDismiss}
                disabled={isDismissing}
                aria-label="Dismiss announcement"
                title="Clear announcement"
              >
                <FiX size={16} />
              </button>
            ) : null}
          </div>
        </div>
        <p className="text-secondary mb-3 announcement-message">{announcement.message}</p>
        <div className="d-flex justify-content-between flex-wrap gap-2 small announcement-meta-row">
          <span className="announcement-event-name">{eventTitle}</span>
          <span className="text-muted">Posted on: {postedOn}</span>
        </div>
        {announcement.eventId?._id || canDismiss || canHideForAdmin ? (
          <div className="mt-3 announcement-card-actions">
            {announcement.eventId?._id ? (
              <Link className="btn event-action-btn event-action-primary" to={`/events/${announcement.eventId._id}`}>
                View Event
              </Link>
            ) : null}
            {canDismiss ? (
              <button
                type="button"
                className="btn event-action-btn event-action-secondary"
                onClick={onDismiss}
                disabled={isDismissing}
              >
                {isDismissing ? "Clearing..." : "Clear"}
              </button>
            ) : null}
            {canHideForAdmin ? (
              <button
                type="button"
                className="hide-announcement-btn"
                onClick={onHideForAdmin}
              >
                Remove
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}
