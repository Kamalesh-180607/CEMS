const Event = require("../models/Event");
const razorpay = require("../config/razorpay");

const createPaymentOrder = async (req, res) => {
  try {
    const { eventId, amount } = req.body;

    if (!eventId) {
      return res.status(400).json({ message: "eventId is required" });
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ message: "Razorpay keys are not configured" });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.status === "deleted") {
      return res.status(400).json({ message: "This event was removed by the admin" });
    }

    if (event.registrationDeadline && new Date() > new Date(event.registrationDeadline)) {
      return res.status(400).json({ message: "Registration deadline has passed" });
    }

    const serverAmount = Number(event.eventPrice || 0);
    if (serverAmount <= 0) {
      return res.status(400).json({ message: "This event is free. No payment required." });
    }

    // Use server-side price as source of truth to prevent tampering.
    const amountInPaise = Math.round(serverAmount * 100);

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `event_receipt_${event._id}_${Date.now()}`,
      notes: {
        eventId: String(event._id),
        requestedAmount: String(amount || serverAmount),
      },
    });

    return res.status(200).json({ order, key: process.env.RAZORPAY_KEY_ID });
  } catch (error) {
    console.error("Razorpay create order error:", error);
    return res.status(500).json({ message: "Failed to create payment order" });
  }
};

module.exports = { createPaymentOrder };
