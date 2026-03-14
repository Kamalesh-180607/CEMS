const express = require("express");
const Event = require("../models/Event");
const generateResponse = require("../services/geminiService");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

const FALLBACK_REPLY = "I'm not sure about that. Try asking about events, registrations, payments, or announcements.";

const containsAny = (text, terms) => terms.some((term) => text.includes(term));

const sendReply = (res, message, reply, statusCode = 200) => {
  console.log("Assistant question:", message);
  console.log("Assistant reply:", reply);
  return res.status(statusCode).json({ reply });
};

const formatDate = (value) => {
  if (!value) return "TBA";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "TBA";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const matchesEventTitle = (message, eventTitle) => {
  const msg = String(message || "").toLowerCase();
  const title = String(eventTitle || "").toLowerCase();
  if (!msg || !title) return false;

  if (msg.includes(title)) return true;

  const titleKeywords = title
    .split(/[^a-z0-9]+/)
    .filter((part) => part.length >= 3 && !/^\d+$/.test(part));

  if (!titleKeywords.length) return false;
  return titleKeywords.some((keyword) => msg.includes(keyword));
};

const buildEventReply = (message, events) => {
  const msg = String(message || "").toLowerCase();

  if (!events.length) {
    return "There are no active events at the moment. Please check again later.";
  }

  if (msg.includes("available") || msg.includes("list") || msg.includes("what events")) {
    return `Currently available events are: ${events.map((event) => event.title).join(", ")}.`;
  }

  if (msg.includes("paid") || msg.includes("fee") || msg.includes("price")) {
    const paidEvents = events.filter((event) => Number(event.eventPrice || 0) > 0);
    if (!paidEvents.length) {
      return "All currently active events are free to register.";
    }
    return paidEvents
      .map((event) => `${event.title} has a registration fee of INR ${Number(event.eventPrice || 0)}.`)
      .join(" ");
  }

  if (msg.includes("this week")) {
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);
    const thisWeekEvents = events.filter((event) => {
      const eventDate = new Date(event.date);
      return eventDate >= now && eventDate <= nextWeek;
    });

    if (!thisWeekEvents.length) {
      return "There are no active events scheduled in the next 7 days.";
    }

    return thisWeekEvents
      .map((event) => `${event.title} is scheduled on ${formatDate(event.date)} at ${event.venue}.`)
      .join(" ");
  }

  const matchedEvent = events.find((event) => matchesEventTitle(msg, event.title));
  if (matchedEvent) {
    return `${matchedEvent.title} is on ${formatDate(matchedEvent.date)} at ${matchedEvent.venue}. Registration fee is INR ${Number(
      matchedEvent.eventPrice || 0
    )}.`;
  }

  return null;
};

router.post("/", protect, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !String(message).trim()) {
      return sendReply(res, message, "Please enter a message.", 400);
    }

    const trimmed = String(message).trim();

    const normalizedMessage = trimmed.toLowerCase();

    if (containsAny(normalizedMessage, ["hi", "hello", "hey", "good morning", "good evening"])) {
      return sendReply(
        res,
        trimmed,
        "Hello! I am your CEMS event assistant. You can ask me about events, registrations, payments, or announcements."
      );
    }

    if (containsAny(normalizedMessage, ["register", "registration"])) {
      return sendReply(res, trimmed, "Open an event, click View Details, and then press Register.");
    }

    if (containsAny(normalizedMessage, ["payment", "pay", "fee"])) {
      return sendReply(
        res,
        trimmed,
        "Paid events require payment during registration using the integrated payment gateway."
      );
    }

    if (containsAny(normalizedMessage, ["announcement", "update"])) {
      return sendReply(
        res,
        trimmed,
        "You can view announcements in the Announcements tab in the navigation bar."
      );
    }

    const events = await Event.find({ status: "active" }).sort({ date: 1 }).lean();

    const eventReply = buildEventReply(trimmed, events);
    if (eventReply) {
      return sendReply(res, trimmed, eventReply);
    }

    const eventsText = events
      .map(
        (event) =>
          `${event.title} | Date: ${formatDate(event.date)} | Time: ${event.time || "TBA"} | Venue: ${
            event.venue || "TBA"
          } | Fee: INR ${Number(event.eventPrice || 0)} | Type: ${event.eventType || "General"}`
      )
      .join("\n");

    const prompt = [
      "You are an event assistant for a Campus Event Management System (CEMS).",
      "Use the event data below when answering.",
      "If the question is event-related, answer using only the provided event data.",
      "If the student asks about registration, payments, or announcements, provide clear guidance.",
      "Keep responses concise and practical.",
      "Available events:",
      eventsText || "No active events available.",
      `Student question: ${trimmed}`,
    ].join("\n\n");

    try {
      const reply = await generateResponse(prompt);
      if (reply) {
        return sendReply(res, trimmed, reply);
      }
    } catch (geminiError) {
      console.error("Gemini error, using fallback:", geminiError.message);
    }

    return sendReply(res, trimmed, FALLBACK_REPLY);
  } catch (error) {
    console.error("Assistant route error:", error);
    return sendReply(
      res,
      req.body && req.body.message ? String(req.body.message) : "",
      "Assistant is temporarily unavailable.",
      500
    );
  }
});

module.exports = router;
