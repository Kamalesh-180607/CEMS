import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const defaultForm = {
  title: "",
  description: "",
  eventType: "Technical",
  hostingClub: "",
  date: "",
  time: "",
  venue: "",
  contactPersonName: "",
  contactPhoneNumber: "",
  instagramLink: "",
  whatsappGroupLink: "",
  registrationDeadline: "",
  eventPrice: 0,
  bannerImage: null,
};

export default function EventForm({ initialData, onSubmit, onCancel, loading, postAnnouncement, setPostAnnouncement }) {
  const [form, setForm] = useState(defaultForm);
  const [posterPreview, setPosterPreview] = useState(null);

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title || "",
        description: initialData.description || "",
        eventType: initialData.eventType || "Technical",
        hostingClub: initialData.hostingClub || "",
        date: initialData.date ? initialData.date.slice(0, 10) : "",
        time: initialData.time || "",
        venue: initialData.venue || "",
        contactPersonName: initialData.contactPersonName || "",
        contactPhoneNumber: initialData.contactPhoneNumber || "",
        instagramLink: initialData.instagramLink || "",
        whatsappGroupLink: initialData.whatsappGroupLink || "",
        registrationDeadline: initialData.registrationDeadline
          ? initialData.registrationDeadline.slice(0, 10)
          : "",
        eventPrice: initialData.eventPrice ?? 0,
        bannerImage: null,
      });
      if (initialData.bannerImage) {
        setPosterPreview(
          `${import.meta.env.VITE_FILE_BASE_URL || "http://localhost:5000"}${initialData.bannerImage}`
        );
      }
    } else {
      setForm(defaultForm);
      setPosterPreview(null);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "bannerImage") {
      const file = files[0];
      setForm((prev) => ({ ...prev, bannerImage: file }));
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setPosterPreview(event.target.result);
        };
        reader.readAsDataURL(file);
      }
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    console.log("Form validation starting...");
    console.log("Form state:", form);
    
    // Client-side validation
    if (!form.title?.trim()) {
      console.warn("Title is required");
      alert("Event title is required");
      return;
    }
    
    if (!form.description?.trim()) {
      console.warn("Description is required");
      alert("Event description is required");
      return;
    }
    
    if (!form.hostingClub?.trim()) {
      console.warn("Hosting club is required");
      alert("Hosting club is required");
      return;
    }
    
    if (!form.date) {
      console.warn("Date is required");
      alert("Event date is required");
      return;
    }
    
    if (!form.time) {
      console.warn("Time is required");
      alert("Event time is required");
      return;
    }
    
    if (!form.venue?.trim()) {
      console.warn("Venue is required");
      alert("Venue is required");
      return;
    }
    
    if (!form.contactPersonName?.trim()) {
      console.warn("Contact person name is required");
      alert("Contact person name is required");
      return;
    }
    
    if (!form.contactPhoneNumber?.trim()) {
      console.warn("Contact phone number is required");
      alert("Contact phone number is required");
      return;
    }
    
    if (!form.registrationDeadline) {
      console.warn("Registration deadline is required");
      alert("Registration deadline is required");
      return;
    }
    
    console.log("All validations passed, submitting form...");
    onSubmit(form);
  };

  return (
    <form className="admin-event-form" onSubmit={handleSubmit}>
      {/* Event Information Section */}
      <motion.div
        className="form-section mb-5"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h5 className="form-section-title mb-3">Event Information</h5>
        <div className="row g-3">
          <div className="col-12">
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Event Title *"
              required
              className="form-control admin-form-input"
            />
          </div>
          <div className="col-12">
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Event Description *"
              rows={4}
              required
              className="form-control admin-form-input"
            />
          </div>
          <div className="col-md-6">
            <select
              name="eventType"
              value={form.eventType}
              onChange={handleChange}
              className="form-select admin-form-input"
            >
              <option value="Technical">Technical</option>
              <option value="Non Technical">Non Technical</option>
              <option value="Workshop">Workshop</option>
            </select>
          </div>
          <div className="col-md-6">
            <input
              type="text"
              name="hostingClub"
              value={form.hostingClub}
              onChange={handleChange}
              placeholder="Hosting Club *"
              required
              className="form-control admin-form-input"
            />
          </div>
        </div>
      </motion.div>

      {/* Event Schedule Section */}
      <motion.div
        className="form-section mb-5"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
      >
        <h5 className="form-section-title mb-3">Event Schedule</h5>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label admin-form-label">Event Date *</label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
              className="form-control admin-form-input"
            />
          </div>
          <div className="col-md-6">
            <label className="form-label admin-form-label">Event Time *</label>
            <input
              type="time"
              name="time"
              value={form.time}
              onChange={handleChange}
              required
              className="form-control admin-form-input"
            />
          </div>
          <div className="col-12">
            <input
              type="text"
              name="venue"
              value={form.venue}
              onChange={handleChange}
              placeholder="Venue *"
              required
              className="form-control admin-form-input"
            />
          </div>
          <div className="col-md-6">
            <label className="form-label admin-form-label">Registration Deadline *</label>
            <input
              type="date"
              name="registrationDeadline"
              value={form.registrationDeadline}
              onChange={handleChange}
              required
              className="form-control admin-form-input"
            />
          </div>
          <div className="col-md-6">
            <input
              type="number"
              min="0"
              step="0.01"
              name="eventPrice"
              value={form.eventPrice}
              onChange={handleChange}
              placeholder="Event Price (0 for Free)"
              className="form-control admin-form-input"
            />
          </div>
        </div>
      </motion.div>

      {/* Contact Information Section */}
      <motion.div
        className="form-section mb-5"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <h5 className="form-section-title mb-3">Contact Information</h5>
        <div className="row g-3">
          <div className="col-md-6">
            <input
              type="text"
              name="contactPersonName"
              value={form.contactPersonName}
              onChange={handleChange}
              placeholder="Contact Person Name *"
              required
              className="form-control admin-form-input"
            />
          </div>
          <div className="col-md-6">
            <input
              type="tel"
              name="contactPhoneNumber"
              value={form.contactPhoneNumber}
              onChange={handleChange}
              placeholder="Contact Phone Number *"
              required
              className="form-control admin-form-input"
            />
          </div>
        </div>
      </motion.div>

      {/* Social Links Section */}
      <motion.div
        className="form-section mb-5"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
      >
        <h5 className="form-section-title mb-3">Social Links</h5>
        <div className="row g-3">
          <div className="col-md-6">
            <input
              type="url"
              name="instagramLink"
              value={form.instagramLink}
              onChange={handleChange}
              placeholder="Instagram Link"
              className="form-control admin-form-input"
            />
          </div>
          <div className="col-md-6">
            <input
              type="url"
              name="whatsappGroupLink"
              value={form.whatsappGroupLink}
              onChange={handleChange}
              placeholder="WhatsApp Group Link"
              className="form-control admin-form-input"
            />
          </div>
        </div>
      </motion.div>

      {/* Event Poster Upload Section */}
      <motion.div
        className="form-section mb-5"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <h5 className="form-section-title mb-3">Event Poster</h5>
        <div className="row g-3">
          <div className="col-12">
            <div className="admin-file-input-wrap">
              <input
                type="file"
                accept="image/*"
                name="bannerImage"
                onChange={handleChange}
                className="admin-file-input"
                id="posterInput"
              />
              <label htmlFor="posterInput" className="admin-file-label">
                Click to upload poster image (JPG, PNG)
              </label>
            </div>
          </div>
          {posterPreview && (
            <motion.div
              className="col-12"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
            >
              <div className="poster-preview-container">
                <label className="form-label admin-form-label mb-2">Poster Preview</label>
                <img src={posterPreview} alt="Poster Preview" className="poster-preview-image" />
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {initialData ? (
        <motion.div
          className="admin-announcement-toggle mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.22 }}
        >
          <label className="admin-checkbox-row">
            <input
              type="checkbox"
              checked={postAnnouncement}
              onChange={(e) => setPostAnnouncement(e.target.checked)}
            />
            <span>Post this update as an announcement</span>
          </label>
        </motion.div>
      ) : null}

      {/* Action Buttons */}
      <div className="admin-form-actions d-flex gap-3">
        <motion.button
          type="submit"
          disabled={loading}
          className="btn btn-primary admin-submit-btn"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" />
              Saving...
            </>
          ) : initialData ? (
            "Update Event"
          ) : (
            "Create Event"
          )}
        </motion.button>
        {initialData ? (
          <motion.button
            type="button"
            onClick={onCancel}
            className="btn btn-outline-secondary"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Cancel
          </motion.button>
        ) : null}
      </div>
    </form>
  );
}
