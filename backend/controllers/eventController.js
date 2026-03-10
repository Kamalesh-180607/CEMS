const Event = require("../models/Event");
const Announcement = require("../models/Announcement");

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
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (String(event.adminId) !== String(req.user._id)) {
      return res.status(403).json({ message: "You cannot update another admin's event" });
    }

    const updates = { ...req.body };
    if (updates.eventPrice !== undefined) {
      updates.eventPrice = Number(updates.eventPrice);
    }

    if (req.file) {
      updates.bannerImage = `/uploads/${req.file.filename}`;
    }

    const trackedChanges = [];
    if (updates.time && updates.time !== event.time) trackedChanges.push("time-change");
    if (updates.venue && updates.venue !== event.venue) trackedChanges.push("venue-change");
    if (
      updates.eventPrice !== undefined &&
      Number(updates.eventPrice) < Number(event.eventPrice)
    ) {
      trackedChanges.push("discount");
    }

    Object.assign(event, updates);
    const updatedEvent = await event.save();

    if (trackedChanges.length > 0 || updates.description) {
      const category = trackedChanges[0] || "important-notice";
      let message = `Update in ${updatedEvent.title}: important notice.`;

      if (trackedChanges.includes("time-change")) {
        message = `Update in ${updatedEvent.title}: time changed to ${updatedEvent.time}.`;
      } else if (trackedChanges.includes("venue-change")) {
        message = `Update in ${updatedEvent.title}: venue changed to ${updatedEvent.venue}.`;
      } else if (trackedChanges.includes("discount")) {
        message = `Discount update for ${updatedEvent.title}: new fee is Rs. ${updatedEvent.eventPrice}.`;
      }

      await Announcement.create({
        eventId: updatedEvent._id,
        adminId: req.user._id,
        message,
        category,
      });
    }

    return res.status(200).json(updatedEvent);
  } catch (error) {
    return res.status(500).json({ message: "Failed to update event", error: error.message });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (String(event.adminId) !== String(req.user._id)) {
      return res.status(403).json({ message: "You cannot delete another admin's event" });
    }

    await event.deleteOne();
    return res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete event", error: error.message });
  }
};

const getMyEvents = async (req, res) => {
  try {
    const events = await Event.find({ adminId: req.user._id }).sort({ date: 1 });
    return res.status(200).json(events);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch admin events", error: error.message });
  }
};

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getMyEvents,
};
