const express = require("express");
const Event = require("../models/Event");
const generateResponse = require("../services/geminiService");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

const FALLBACK_REPLY = "I'm not sure about that. Try asking about events, registrations, payments, or announcements.";

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const containsAny = (text, terms) => {
  const normalizedText = String(text || "").toLowerCase();
  return terms.some((term) => {
    const normalizedTerm = String(term || "").toLowerCase();
    if (!normalizedTerm) return false;
    const boundaryRegex = new RegExp(`(^|\\W)${escapeRegex(normalizedTerm)}(\\W|$)`, "i");
    return boundaryRegex.test(normalizedText);
  });
};

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

const getStartOfDay = (date) => {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

const getEndOfDay = (date) => {
  const copy = new Date(date);
  copy.setHours(23, 59, 59, 999);
  return copy;
};

const extractDateFromMessage = (message) => {
  const text = String(message || "");

  // dd/mm/yyyy or dd-mm-yyyy
  const dmyMatch = text.match(/\b(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})\b/);
  if (dmyMatch) {
    const day = Number(dmyMatch[1]);
    const month = Number(dmyMatch[2]);
    const year = Number(dmyMatch[3]);
    const date = new Date(year, month - 1, day);
    if (!Number.isNaN(date.getTime())) return date;
  }

  // yyyy-mm-dd
  const ymdMatch = text.match(/\b(\d{4})-(\d{1,2})-(\d{1,2})\b/);
  if (ymdMatch) {
    const year = Number(ymdMatch[1]);
    const month = Number(ymdMatch[2]);
    const day = Number(ymdMatch[3]);
    const date = new Date(year, month - 1, day);
    if (!Number.isNaN(date.getTime())) return date;
  }

  return null;
};

const detectEventIntent = (message) => {
  const text = String(message || "").toLowerCase();
  const hasEventSignal = containsAny(text, [
    "event",
    "events",
    "technical",
    "non technical",
    "non-technical",
    "workshop",
    "workshops",
    "upcoming",
    "today",
    "tomorrow",
    "free",
    "paid",
    "on",
  ]);

  if (!hasEventSignal) {
    return null;
  }

  const query = { status: "active" };
  let intentTitle = "Matching Events";

  if (containsAny(text, ["technical"]) && !containsAny(text, ["non technical", "non-technical"])) {
    query.eventType = "Technical";
    intentTitle = "Technical Events";
  }

  if (containsAny(text, ["non technical", "non-technical"])) {
    query.eventType = "Non Technical";
    intentTitle = "Non Technical Events";
  }

  if (containsAny(text, ["workshop", "workshops"])) {
    query.eventType = "Workshop";
    intentTitle = "Workshop Events";
  }

  if (containsAny(text, ["free"])) {
    query.eventPrice = 0;
    intentTitle = "Free Events";
  }

  if (containsAny(text, ["paid"])) {
    query.eventPrice = { $gt: 0 };
    intentTitle = "Paid Events";
  }

  const today = new Date();
  const extractedDate = extractDateFromMessage(text);

  if (containsAny(text, ["events today", "today"])) {
    query.date = {
      $gte: getStartOfDay(today),
      $lte: getEndOfDay(today),
    };
    intentTitle = "Today's Events";
  } else if (containsAny(text, ["events tomorrow", "tomorrow"])) {
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    query.date = {
      $gte: getStartOfDay(tomorrow),
      $lte: getEndOfDay(tomorrow),
    };
    intentTitle = "Tomorrow's Events";
  } else if (containsAny(text, ["upcoming"])) {
    query.date = { $gte: getStartOfDay(today) };
    intentTitle = "Upcoming Events";
  } else if (extractedDate) {
    query.date = {
      $gte: getStartOfDay(extractedDate),
      $lte: getEndOfDay(extractedDate),
    };
    intentTitle = `Events on ${formatDate(extractedDate)}`;
  }

  return { query, intentTitle };
};

const formatEventList = (events) =>
  events
    .map((event, index) => {
      const fee = Number(event.eventPrice || 0) > 0 ? `INR ${Number(event.eventPrice || 0)}` : "Free";
      return `${index + 1}. ${event.title} | Date: ${formatDate(event.date)} | Time: ${event.time || "TBA"} | Venue: ${
        event.venue || "TBA"
      } | Fee: ${fee}`;
    })
    .join("\n");

const buildDeterministicEventReply = (intentTitle, events) => {
  if (!events.length) {
    return "No events found for this request.";
  }

  return `${intentTitle}:\n${formatEventList(events)}`;
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

    const eventIntent = detectEventIntent(trimmed);
    if (eventIntent) {
      const filteredEvents = await Event.find(eventIntent.query).sort({ date: 1, time: 1 }).lean();
      const deterministicReply = buildDeterministicEventReply(eventIntent.intentTitle, filteredEvents);

      const eventDataForPrompt = filteredEvents.length
        ? formatEventList(filteredEvents)
        : "No events found for this request.";

      const eventIntentPrompt = [
        "You are an event assistant for a Campus Event Management System (CEMS).",
        "The events below are already filtered from MongoDB based on the student's request.",
        "Respond in a friendly conversational way, but do not add events that are not in the filtered list.",
        "If no events are available, use exactly: No events found for this request.",
        `Intent: ${eventIntent.intentTitle}`,
        "Filtered events:",
        eventDataForPrompt,
        `Student question: ${trimmed}`,
      ].join("\n\n");

      try {
        const aiReply = await generateResponse(eventIntentPrompt);
        if (aiReply) {
          return sendReply(res, trimmed, aiReply);
        }
      } catch (eventPromptError) {
        console.error("Event intent AI error, using deterministic reply:", eventPromptError.message);
      }

      return sendReply(res, trimmed, deterministicReply);
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
