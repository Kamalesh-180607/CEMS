const Event = require("../models/Event");
const Announcement = require("../models/Announcement");
const Registration = require("../models/Registration");
const { getRecommendedEvents } = require("../services/geminiRecommendation");

const formatCurrency = (value) => `Rs. ${Number(value || 0)}`;

const normalizeDateKey = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const formatDateLabel = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const normalizeRecommendationType = (value) => {
  const normalized = String(value || "").toLowerCase().trim();
  if (!normalized) return "";
  if (normalized === "technical") return "Technical";
  if (normalized === "non technical" || normalized === "non-technical") return "Non Technical";
  if (normalized === "workshop" || normalized === "workshops") return "Workshop";
  return "";
};

const parseDateTime = (eventDate, eventTime) => {
  const date = new Date(eventDate);
  if (!eventTime || !eventTime.includes(":")) return date;
  const [hours, minutes] = eventTime.split(":").map(Number);
  date.setHours(hours, minutes, 0, 0);
  return date;
};

const createEvent = async (req, res) => {
  try {
    const payload = { ...req.body };
    payload.adminId = req.user._id;

    if (payload.eventPrice !== undefined) {
      payload.eventPrice = Number(payload.eventPrice);
    }

    if (req.file) {
      payload.bannerImage = `/uploads/${req.file.filename}`;
    }

    const event = await Event.create(payload);
    return res.status(201).json(event);
  } catch (error) {
    return res.status(500).json({ message: "Failed to create event", error: error.message });
  }
};

const getEvents = async (req, res) => {
  try {
    const { search = "", eventType, club, status } = req.query;
    const query = {};

    if (req.user && req.user.role === "admin") {
      query.adminId = req.user._id;
    } else {
      // Students/public should never receive deleted events in dashboard/event listing.
      query.status = "active";
    }

    if (eventType) {
      query.eventType = eventType;
    }

    if (club) {
      query.hostingClub = { $regex: club, $options: "i" };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { hostingClub: { $regex: search, $options: "i" } },
      ];
    }

    if (status) {
      const now = new Date();
      if (status === "upcoming") {
        query.date = { $gt: now };
      } else if (status === "ongoing") {
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        query.date = { $gte: startOfDay, $lt: endOfDay };
      }
    }

    const events = await Event.find(query).sort({ date: 1 });
    return res.status(200).json(events);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch events", error: error.message });
  }
};

const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (req.user.role === "admin" && String(event.adminId) !== String(req.user._id)) {
      return res.status(403).json({ message: "You cannot access another admin's event" });
    }

    return res.status(200).json(event);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch event", error: error.message });
  }
};

const updateEvent = async (req, res) => {
  try {
    const oldEvent = await Event.findById(req.params.id);
    if (!oldEvent) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (String(oldEvent.adminId) !== String(req.user._id)) {
      return res.status(403).json({ message: "You cannot update another admin's event" });
    }

    const updates = { ...req.body };
    if (updates.eventPrice !== undefined) {
      updates.eventPrice = Number(updates.eventPrice);
    }

    if (req.file) {
      updates.bannerImage = `/uploads/${req.file.filename}`;
    }

    const nextDate = updates.date !== undefined ? updates.date : oldEvent.date;
    const nextTime = updates.time !== undefined ? updates.time : oldEvent.time;
    const nextVenue = updates.venue !== undefined ? updates.venue : oldEvent.venue;
    const nextPrice = updates.eventPrice !== undefined ? Number(updates.eventPrice) : Number(oldEvent.eventPrice);
    const nextRegistrationDeadline = updates.registrationDeadline !== undefined
      ? updates.registrationDeadline
      : oldEvent.registrationDeadline;
    const nextDescription = updates.description !== undefined ? updates.description : oldEvent.description;

    const changeMessages = [];
    let category = "important-notice";
    const audienceSignals = [];

    if (normalizeDateKey(nextDate) && normalizeDateKey(nextDate) !== normalizeDateKey(oldEvent.date)) {
      changeMessages.push(
        `Date has been updated from ${formatDateLabel(oldEvent.date)} to ${formatDateLabel(nextDate)}`
      );
      audienceSignals.push("all");
    }

    if ((nextTime || "") !== (oldEvent.time || "")) {
      changeMessages.push(`Time has been updated from ${oldEvent.time || "N/A"} to ${nextTime || "N/A"}`);
      category = "time-change";
      audienceSignals.push("registered");
    }

    if ((nextVenue || "") !== (oldEvent.venue || "")) {
      changeMessages.push(`Venue has been updated from ${oldEvent.venue || "N/A"} to ${nextVenue || "N/A"}`);
      if (category === "important-notice") category = "venue-change";
      audienceSignals.push("registered");
    }

    if (!Number.isNaN(nextPrice) && Number(nextPrice) !== Number(oldEvent.eventPrice)) {
      changeMessages.push(
        `Registration fee changed from ${formatCurrency(oldEvent.eventPrice)} to ${formatCurrency(nextPrice)}`
      );
      if (Number(nextPrice) < Number(oldEvent.eventPrice)) {
        category = "discount";
      }
      audienceSignals.push("all");
    }

    if (
      normalizeDateKey(nextRegistrationDeadline)
      && normalizeDateKey(nextRegistrationDeadline) !== normalizeDateKey(oldEvent.registrationDeadline)
    ) {
      changeMessages.push(
        `Registration deadline changed from ${formatDateLabel(oldEvent.registrationDeadline)} to ${formatDateLabel(nextRegistrationDeadline)}`
      );
      audienceSignals.push("all");
    }

    if ((nextDescription || "") !== (oldEvent.description || "")) {
      changeMessages.push("Participant instructions/details have been updated");
      audienceSignals.push("registered");
    }

    Object.assign(oldEvent, updates);
    const updatedEvent = await oldEvent.save();

    if (changeMessages.length > 0) {
      const targetAudience = audienceSignals.includes("all") ? "all" : "registered";
      await Announcement.create({
        eventId: updatedEvent._id,
        adminId: req.user._id,
        title: `${updatedEvent.title} updated`,
        message: `${updatedEvent.title}: ${changeMessages.join(". ")}.`,
        category,
        targetAudience,
        createdAt: new Date(),
      });
    }

    return res.status(200).json(updatedEvent);
  } catch (error) {
    return res.status(500).json({ message: "Failed to update event", error: error.message });
  }
};

const deleteEvent = async (req, res) => {
  try {
    console.log("Deleting event:", req.params.id);
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (String(event.adminId) !== String(req.user._id)) {
      return res.status(403).json({ message: "You cannot delete another admin's event" });
    }

    event.status = "deleted";
    await event.save();
    return res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete event", error: error.message });
  }
};

const getMyEvents = async (req, res) => {
  try {
    const events = await Event.find({ adminId: req.user._id, status: "active" }).sort({ date: 1 });
    return res.status(200).json(events);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch admin events", error: error.message });
  }
};

const getEventRecommendations = async (req, res) => {
  try {
    if (req.user?.role !== "student") {
      return res.status(403).json({ message: "Only students can access recommendations" });
    }

    const requestedType = normalizeRecommendationType(req.query.type);

    const registrations = await Registration.find({ studentId: req.user._id })
      .populate("eventId", "title description eventType hostingClub venue")
      .sort({ createdAt: -1 });

    const registeredEvents = registrations
      .map((entry) => entry.eventId)
      .filter(Boolean);

    const registeredEventIds = registrations
      .map((entry) => String(entry.eventId?._id || entry.eventId || ""))
      .filter(Boolean);

    const candidateQuery = {
      status: "active",
      _id: { $nin: registeredEventIds },
    };

    if (requestedType) {
      candidateQuery.eventType = requestedType;
    }

    const candidateEvents = await Event.find(candidateQuery).sort({ date: 1 });

    const popularityRows = await Registration.aggregate([
      {
        $group: {
          _id: "$eventId",
          count: { $sum: 1 },
        },
      },
    ]);

    const popularityMap = new Map(
      popularityRows.map((row) => [String(row._id), Number(row.count || 0)])
    );

    const recommendedEvents = await getRecommendedEvents({
      studentDepartment: req.user.department,
      registeredEvents,
      candidateEvents,
      popularityMap,
    });

    return res.status(200).json({ recommendedEvents });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch recommendations", error: error.message });
  }
};

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getMyEvents,
  getEventRecommendations,
};
