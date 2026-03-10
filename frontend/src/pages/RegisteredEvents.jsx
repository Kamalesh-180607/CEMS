import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { registrationApi } from "../services/api";

export default function RegisteredEvents() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await registrationApi.getMyEvents();
        setItems(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch your registrations");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="container py-4">
      <Navbar />
      <div className="hero-banner mt-3 mb-4 p-4">
        <h2 className="mb-1">My Registered Events</h2>
        <p className="text-secondary mb-0">Track your registrations and payment status.</p>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-3 mb-0">Loading your events...</p>
        </div>
      ) : null}

      {error ? <div className="alert alert-danger">{error}</div> : null}

      {!loading && items.length ? (
        <div className="card shadow-sm border-0">
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Event Name</th>
                  <th>Date</th>
                  <th>Venue</th>
                  <th>Payment Status</th>
                  <th>Registration Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((entry) => (
                  <tr key={entry._id}>
                    <td>
                      <Link to={`/events/${entry.event?._id}`}>{entry.event?.title || "Event"}</Link>
                    </td>
                    <td>{entry.event?.date ? new Date(entry.event.date).toLocaleDateString() : "-"}</td>
                    <td>{entry.event?.venue || "-"}</td>
                    <td>
                      <span className={`badge ${entry.paymentStatus === "paid" ? "text-bg-success" : "text-bg-secondary"}`}>
                        {entry.paymentStatus}
                      </span>
                    </td>
                    <td>
                      <span className="badge text-bg-primary">{entry.registrationStatus}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {!loading && !items.length ? <div className="alert alert-info">You have not registered for any event yet.</div> : null}
    </div>
  );
}
