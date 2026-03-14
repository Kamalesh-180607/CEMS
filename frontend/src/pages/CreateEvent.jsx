import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import EventForm from "../components/EventForm";
import { eventsApi } from "../services/api";

const appendFormData = (payload) => {
  const formData = new FormData();
  const allowedKeys = [
    "title",
    "description",
    "eventType",
    "hostingClub",
    "date",
    "time",
    "venue",
    "contactPersonName",
    "contactPhoneNumber",
    "instagramLink",
    "whatsappGroupLink",
    "registrationDeadline",
    "eventPrice",
    "bannerImage",
  ];

  allowedKeys.forEach((key) => {
    const value = payload[key];
    if (value !== null && value !== undefined && value !== "") {
      formData.append(key, value);
    }
  });
  
  console.log("===== FORM DATA BEING SENT =====");
  for (let [key, value] of formData.entries()) {
    if (value instanceof File) {
      console.log(`${key}:`, `File(${value.name}, ${value.size} bytes)`);
    } else {
      console.log(`${key}:`, value);
    }
  }
  
  return formData;
};

export default function CreateEvent() {
  const navigate = useNavigate();
  const location = useLocation();
  const eventToEdit = location.state?.event || null;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [postAnnouncement, setPostAnnouncement] = useState(false);

  useEffect(() => {
    setPostAnnouncement(false);
  }, [eventToEdit?._id]);

  const handleCreateOrUpdate = async (form) => {
    setLoading(true);
    setError("");

    try {
      const formData = appendFormData(form);
      console.log("Submitting form with event data...");
      
      let response;
      if (eventToEdit?._id) {
        formData.append("postAnnouncement", String(postAnnouncement));
        console.log("Updating event:", eventToEdit._id);
        console.log(formData);
        response = await eventsApi.update(eventToEdit._id, formData);
      } else {
        console.log("Creating new event");
        response = await eventsApi.create(formData);
      }
      
      console.log("API Response:", response.data);
      console.log("Success! Redirecting to admin dashboard");
      
      setTimeout(() => {
        navigate("/admin", {
          replace: true,
          state: {
            successMessage: eventToEdit?._id
              ? "Event updated successfully"
              : "Event created successfully",
          },
        });
      }, 500);
    } catch (err) {
      console.error("Failed to save event");
      console.error("Error status:", err.response?.status);
      console.error("Error data:", err.response?.data);
      console.error("Full error:", err);
      setError(err.response?.data?.message || "Failed to save event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-page">
      <Navbar />

      <motion.section
        className="dashboard-hero"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        <div className="dashboard-shell">
          <div className="dashboard-hero-card">
            <h2 className="mb-2">Create New Event</h2>
            <p className="mb-0">Host and manage campus events.</p>
          </div>
        </div>
      </motion.section>

      <div className="dashboard-shell dashboard-wrap">
        {error ? (
          <motion.div
            className="alert alert-danger mb-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.div>
        ) : null}

        <motion.section
          className="admin-create-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
        >
          <div className="section-card">
            <h3 className="admin-section-title mb-4">
              {eventToEdit ? "Update Event" : "Create Event"}
            </h3>
            <EventForm
              initialData={eventToEdit}
              onSubmit={handleCreateOrUpdate}
              onCancel={() => navigate("/admin")}
              loading={loading}
              postAnnouncement={postAnnouncement}
              setPostAnnouncement={setPostAnnouncement}
            />
          </div>
        </motion.section>
      </div>
    </div>
  );
}
