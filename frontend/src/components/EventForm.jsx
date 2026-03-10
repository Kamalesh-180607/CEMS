import { useEffect, useState } from "react";

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

export default function EventForm({ initialData, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState(defaultForm);

  useEffect(() => {
    if (initialData) {
      setForm({
        ...initialData,
        date: initialData.date ? initialData.date.slice(0, 10) : "",
        registrationDeadline: initialData.registrationDeadline
          ? initialData.registrationDeadline.slice(0, 10)
          : "",
        bannerImage: null,
      });
    } else {
      setForm(defaultForm);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "bannerImage") {
      setForm((prev) => ({ ...prev, bannerImage: files[0] }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form className="card form-grid" onSubmit={handleSubmit}>
      <h3>{initialData ? "Update Event" : "Create Event"}</h3>
      <input name="title" value={form.title} onChange={handleChange} placeholder="Event title" required />
      <textarea
        name="description"
        value={form.description}
        onChange={handleChange}
        placeholder="Description"
        rows={4}
        required
      />
      <select name="eventType" value={form.eventType} onChange={handleChange}>
        <option value="Technical">Technical</option>
        <option value="Non Technical">Non Technical</option>
        <option value="Workshop">Workshop</option>
      </select>
      <input name="hostingClub" value={form.hostingClub} onChange={handleChange} placeholder="Hosting club" required />
      <input type="date" name="date" value={form.date} onChange={handleChange} required />
      <input type="time" name="time" value={form.time} onChange={handleChange} required />
      <input name="venue" value={form.venue} onChange={handleChange} placeholder="Venue" required />
      <input
        name="contactPersonName"
        value={form.contactPersonName}
        onChange={handleChange}
        placeholder="Contact person name"
        required
      />
      <input
        name="contactPhoneNumber"
        value={form.contactPhoneNumber}
        onChange={handleChange}
        placeholder="Contact phone number"
        required
      />
      <input
        name="instagramLink"
        value={form.instagramLink}
        onChange={handleChange}
        placeholder="Instagram link"
      />
      <input
        name="whatsappGroupLink"
        value={form.whatsappGroupLink}
        onChange={handleChange}
        placeholder="WhatsApp group link"
      />
      <label className="label">Registration deadline</label>
      <input
        type="date"
        name="registrationDeadline"
        value={form.registrationDeadline}
        onChange={handleChange}
        required
      />
      <input
        type="number"
        min="0"
        step="0.01"
        name="eventPrice"
        value={form.eventPrice}
        onChange={handleChange}
        placeholder="Event price"
      />
      <input type="file" accept="image/*" name="bannerImage" onChange={handleChange} />
      <div className="action-row">
        <button className="btn accent" disabled={loading} type="submit">
          {loading ? "Saving..." : initialData ? "Update Event" : "Create Event"}
        </button>
        {initialData ? (
          <button className="btn ghost" type="button" onClick={onCancel}>
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}
