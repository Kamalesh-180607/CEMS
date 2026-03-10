export default function AnnouncementCard({ announcement }) {
  return (
    <article className="card announcement-card">
      <h4>{announcement.eventId?.title || "Event Update"}</h4>
      <p>{announcement.message}</p>
      <div className="event-meta">
        <span>{announcement.category}</span>
        <span>{new Date(announcement.createdAt).toLocaleString()}</span>
      </div>
    </article>
  );
}
