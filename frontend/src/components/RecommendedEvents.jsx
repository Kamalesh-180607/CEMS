import EventCard from "./EventCard";

export default function RecommendedEvents({
  title = "Recommended For You 🤖",
  events = [],
  loading = false,
  emptyMessage = "No personalized recommendations yet. Register for events to improve suggestions.",
}) {
  return (
    <section className="recommended-events-wrap mb-4">
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
        <h4 className="mb-0">{title}</h4>
        {loading ? <span className="small text-secondary">Curating recommendations...</span> : null}
      </div>

      {events.length ? (
        <div className="row g-4">
          {events.map((event) => (
            <div className="col-12 col-md-6 col-xl-4" key={`recommended-${event._id}`}>
              <EventCard
                event={event}
                showRegister
                isRegistered={event.isRegistered}
                eventStatus={event.eventStatus}
                hasNewUpdates={false}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="alert alert-light border mb-0">{emptyMessage}</div>
      )}
    </section>
  );
}
