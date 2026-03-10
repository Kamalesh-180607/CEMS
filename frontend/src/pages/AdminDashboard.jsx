import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import EventCard from "../components/EventCard";
import EventForm from "../components/EventForm";
import { eventsApi, registrationApi } from "../services/api";

const appendFormData = (payload) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      formData.append(key, value);
    }
  });
  return formData;
};

export default function AdminDashboard() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadEvents = async () => {
    try {
      const { data } = await eventsApi.getMyEvents();
      setEvents(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load admin events");
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleCreateOrUpdate = async (form) => {
    setLoading(true);
    setError("");

    try {
      const formData = appendFormData(form);
      if (selectedEvent) {
        await eventsApi.update(selectedEvent._id, formData);
      } else {
        await eventsApi.create(formData);
      }
      setSelectedEvent(null);
      await loadEvents();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save event");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this event?")) return;
    try {
      await eventsApi.remove(id);
      if (selectedEvent?._id === id) {
        setSelectedEvent(null);
        setRegistrations([]);
      }
      await loadEvents();
    } catch (err) {
      setError(err.response?.data?.message || "Delete failed");
    }
  };

  const loadRegistrations = async (eventId) => {
    try {
      const { data } = await registrationApi.getByEvent(eventId);
      setRegistrations(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load registrations");
    }
  };

  return (
    <div className="page-wrap">
      <Navbar />
      <section className="hero">
        <h1>Admin Dashboard</h1>
        <p>Create and manage only your own events and registrations.</p>
      </section>

      <section className="grid two-col admin-grid">
        <EventForm
          initialData={selectedEvent}
          onSubmit={handleCreateOrUpdate}
          onCancel={() => setSelectedEvent(null)}
          loading={loading}
        />

        <div className="card">
          <h3>Your Events</h3>
          <div className="grid">
            {events.map((event) => (
              <div key={event._id} className="card slim">
                <EventCard event={event} />
                <div className="action-row">
                  <button className="btn" onClick={() => setSelectedEvent(event)}>
                    Edit
                  </button>
                  <button className="btn danger" onClick={() => handleDelete(event._id)}>
                    Delete
                  </button>
                  <button className="btn ghost" onClick={() => loadRegistrations(event._id)}>
                    Registrations
                  </button>
                </div>
              </div>
            ))}
            {!events.length ? <p>No events created yet.</p> : null}
          </div>
        </div>
      </section>

      <section className="card">
        <h3>Selected Event Registrations</h3>
        {registrations.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Roll No</th>
                  <th>Mobile</th>
                  <th>Department</th>
                  <th>Payment</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((entry) => (
                  <tr key={entry._id}>
                    <td>{entry.studentId?.name}</td>
                    <td>{entry.email}</td>
                    <td>{entry.rollNumber}</td>
                    <td>{entry.mobileNumber}</td>
                    <td>{entry.department}</td>
                    <td>{entry.paymentStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>Click "Registrations" on any event to load participant data.</p>
        )}
      </section>

      {error ? <div className="error">{error}</div> : null}
    </div>
  );
}
