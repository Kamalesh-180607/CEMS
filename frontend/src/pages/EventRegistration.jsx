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
    navigate("/my-events");
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
    <div className="container py-4">
      <Navbar />
      <section className="card border-0 shadow-sm p-4 mt-3">
        <h3 className="mb-1">Event Registration</h3>
        <p className="mb-1">{event?.title}</p>
        <p className="text-secondary mb-4">{event ? (Number(event.eventPrice) > 0 ? `Fee: Rs. ${event.eventPrice}` : "Fee: Free") : ""}</p>

        <form className="row g-3" onSubmit={handleSubmit}>
          <div className="col-md-6">
            <input className="form-control" name="rollNumber" value={form.rollNumber} onChange={handleChange} placeholder="Roll Number" required />
          </div>
          <div className="col-md-6">
          <input
            className="form-control"
            name="mobileNumber"
            value={form.mobileNumber}
            onChange={handleChange}
            placeholder="Mobile Number"
            required
          />
          </div>
          <div className="col-md-6">
            <input className="form-control" type="email" name="email" value={form.email} onChange={handleChange} placeholder="Email" required />
          </div>
          <div className="col-md-6">
          <input
            className="form-control"
            name="department"
            value={form.department}
            onChange={handleChange}
            placeholder="Department"
            required
          />
          </div>
          {error ? <div className="col-12"><div className="alert alert-danger py-2">{error}</div></div> : null}
          <div className="col-12">
            <button className="btn btn-primary" disabled={loading} type="submit">
            {loading ? "Processing..." : Number(event?.eventPrice || 0) > 0 ? "Pay & Register" : "Register"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
