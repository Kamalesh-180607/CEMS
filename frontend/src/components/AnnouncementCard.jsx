export default function AnnouncementCard({ announcement }) {
  return (
    <article className="card border-0 shadow-sm h-100">
      <div className="card-body">
        <h6 className="mb-2">{announcement.eventId?.title || "Event Update"}</h6>
        <p className="text-secondary mb-3">{announcement.message}</p>
        <div className="d-flex justify-content-between flex-wrap gap-2 small">
          <span className="badge text-bg-light border text-dark">{announcement.category}</span>
          <span className="text-muted">{new Date(announcement.createdAt).toLocaleString()}</span>
        </div>
      </div>
    </article>
  );
}
