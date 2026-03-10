import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { eventsApi, registrationApi } from "../services/api";

const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export default function EventRegistration() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("cemsUser") || "{}");
  const [event, setEvent] = useState(null);
  const [form, setForm] = useState({
    rollNumber: user.rollNumber || "",
    mobileNumber: user.mobileNumber || "",
    email: user.email || "",
    department: user.department || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data } = await eventsApi.getById(id);
        setEvent(data);
      } catch (err) {
        setError(err.response?.data?.message || "Could not load event");
      }
    };

    fetchEvent();
  }, [id]);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const completeRegistration = async (paymentPayload = {}) => {
    await registrationApi.register({
      eventId: id,
      ...form,
      ...paymentPayload,
    });
    navigate("/student");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!event) return;

    setLoading(true);
    setError("");

    try {
      if (Number(event.eventPrice) <= 0) {
        await completeRegistration({ paymentStatus: "free" });
        return;
      }

      const loaded = await loadRazorpay();
      if (!loaded) {
        setError("Razorpay SDK failed to load");
        return;
      }

      const { data } = await registrationApi.createOrder({ eventId: id });
      const options = {
        key: data.key,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "CEMS",
        description: event.title,
        order_id: data.order.id,
        handler: async (response) => {
          try {
            await completeRegistration({
              paymentStatus: "paid",
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
            });
          } catch (err) {
            setError(err.response?.data?.message || "Registration after payment failed");
          }
        },
        prefill: {
          name: user.name,
          email: form.email,
          contact: form.mobileNumber,
        },
        theme: { color: "#c84f2f" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrap">
      <Navbar />
      <section className="card auth-card">
        <h2>Event Registration</h2>
        <p>{event?.title}</p>
        <p>{event ? (Number(event.eventPrice) > 0 ? `Fee: Rs. ${event.eventPrice}` : "Fee: Free") : ""}</p>

        <form className="form-grid" onSubmit={handleSubmit}>
          <input name="rollNumber" value={form.rollNumber} onChange={handleChange} placeholder="Roll Number" required />
          <input
            name="mobileNumber"
            value={form.mobileNumber}
            onChange={handleChange}
            placeholder="Mobile Number"
            required
          />
          <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Email" required />
          <input
            name="department"
            value={form.department}
            onChange={handleChange}
            placeholder="Department"
            required
          />
          {error ? <div className="error">{error}</div> : null}
          <button className="btn accent" disabled={loading} type="submit">
            {loading ? "Processing..." : Number(event?.eventPrice || 0) > 0 ? "Pay & Register" : "Register"}
          </button>
        </form>
      </section>
    </div>
  );
}
