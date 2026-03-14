const Razorpay = require("razorpay");
const Event = require("../models/Event");
const Registration = require("../models/Registration");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

const createOrder = async (req, res) => {
  try {
    const { eventId } = req.body;
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.status === "deleted") {
      return res.status(400).json({ message: "This event was removed by the admin" });
    }

    if (event.eventPrice <= 0) {
      return res.status(400).json({ message: "This event is free. No payment required." });
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ message: "Razorpay keys are not configured" });
    }

    const order = await razorpay.orders.create({
      amount: Math.round(event.eventPrice * 100),
      currency: "INR",
      receipt: `evt_${event._id}_${Date.now()}`,
    });

    return res.status(200).json({ order, key: process.env.RAZORPAY_KEY_ID });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create payment order", error: error.message });
  }
};

const registerForEvent = async (req, res) => {
  try {
    const {
      eventId,
      rollNumber,
      mobileNumber,
      email,
      department,
      paymentId,
      orderId,
      paymentStatus,
    } = req.body;

    if (!eventId || !rollNumber || !mobileNumber || !email || !department) {
      return res.status(400).json({ message: "All registration fields are required" });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.status === "deleted") {
      return res.status(400).json({ message: "This event was removed by the admin" });
    }

    const existingRegistration = await Registration.findOne({
      eventId,
      studentId: req.user._id,
    });

    if (existingRegistration) {
      return res.status(409).json({ message: "Already registered for this event" });
    }

    const isPaidEvent = event.eventPrice > 0;

    if (isPaidEvent && paymentStatus !== "paid") {
      return res.status(400).json({ message: "Payment required for paid events" });
    }

    const registration = await Registration.create({
      eventId,
      studentId: req.user._id,
      rollNumber,
      mobileNumber,
      email,
      department,
      amountPaid: isPaidEvent ? event.eventPrice : 0,
      paymentStatus: isPaidEvent ? "paid" : "free",
      paymentId: paymentId || "",
      orderId: orderId || "",
      registrationDate: new Date(),
      registeredAt: new Date(),
    });

    return res.status(201).json({
      message: "Event registration successful",
      registration,
    });
  } catch (error) {
    return res.status(500).json({ message: "Registration failed", error: error.message });
  }
};

const getRegistrationsByEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (String(event.adminId) !== String(req.user._id)) {
      return res.status(403).json({ message: "You cannot view registrations of another admin's event" });
    }

    const registrations = await Registration.find({ eventId })
      .populate("studentId", "name email rollNumber mobileNumber department")
      .sort({ createdAt: -1 });

    return res.status(200).json(registrations);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch registrations", error: error.message });
  }
};

const getMyRegisteredEvents = async (req, res) => {
  try {
    const registrations = await Registration.find({ studentId: req.user._id })
      .populate("eventId", "title date time venue bannerImage eventType hostingClub status updates")
      .sort({ registeredAt: -1, registrationDate: -1, createdAt: -1 });

    const payload = registrations
      .filter((entry) => entry.eventId)
      .map((entry) => ({
        _id: entry._id,
        event: entry.eventId,
        paymentStatus: entry.paymentStatus,
        registrationStatus: "registered",
        registrationDate: entry.registrationDate || entry.registeredAt || entry.createdAt,
        registeredAt: entry.registeredAt || entry.registrationDate || entry.createdAt,
      }));

    return res.status(200).json(payload);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch registered events", error: error.message });
  }
};

const removeMyRegistration = async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id).populate("eventId", "status");

    if (!registration) {
      return res.status(404).json({ message: "Registration not found" });
    }

    if (String(registration.studentId) !== String(req.user._id)) {
      return res.status(403).json({ message: "You can only remove your own registration" });
    }

    if (registration.eventId && registration.eventId.status !== "deleted") {
      return res.status(400).json({ message: "Only deleted events can be removed from your list" });
    }

    await Registration.findByIdAndDelete(req.params.id);

    return res.status(200).json({ message: "Registration removed" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to remove registration", error: error.message });
  }
};

module.exports = {
  createOrder,
  registerForEvent,
  getRegistrationsByEvent,
  getMyRegisteredEvents,
  removeMyRegistration,
};
