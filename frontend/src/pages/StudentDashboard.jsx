import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiCalendar, FiCheckCircle, FiClock } from "react-icons/fi";
import Navbar from "../components/Navbar";
import EventCard from "../components/EventCard";
import RecommendedEvents from "../components/RecommendedEvents";
import EventAssistantChatbot from "../components/EventAssistantChatbot";
import { eventsApi, registrationApi } from "../services/api";

const FILTERS = [
  { key: "all", label: "All Events" },
  { key: "technical", label: "Technical" },
  { key: "non-technical", label: "Non Technical" },
  { key: "workshop", label: "Workshops" },
];

const FILTER_META = {
  technical: { apiType: "Technical", title: "Recommended Technical Events" },
  "non-technical": { apiType: "Non Technical", title: "Recommended Non Technical Events" },
  workshop: { apiType: "Workshop", title: "Recommended Workshops" },
};

const matchFilterType = (eventType, filterKey) => {
  const normalizedEventType = String(eventType || "").toLowerCase().trim();
  if (filterKey === "technical") return normalizedEventType === "technical";
  if (filterKey === "non-technical") {
    return normalizedEventType === "non technical" || normalizedEventType === "non-technical";
  }
  if (filterKey === "workshop") return normalizedEventType === "workshop" || normalizedEventType === "workshops";
  return true;
};

function parseTimeToken(dateValue, token) {
  if (!token) return null;
  const dateOnly = new Date(dateValue).toDateString();
  const parsed = new Date(`${dateOnly} ${token.trim()}`);
  if (!Number.isNaN(parsed.getTime())) return parsed;

  const twentyFourHourMatch = token.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!twentyFourHourMatch) return null;

  const hours = Number(twentyFourHourMatch[1]);
  const minutes = Number(twentyFourHourMatch[2]);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;

  const fallback = new Date(dateValue);
  fallback.setHours(hours, minutes, 0, 0);
  return fallback;
}

function getEventStatus(event, now = new Date()) {
  const eventDate = new Date(event.date);
  if (Number.isNaN(eventDate.getTime())) return "upcoming";

  const timeText = (event.time || "").replace(/[\u2013\u2014]/g, "-");
  const [startToken, endToken] = timeText.split("-").map((value) => value.trim()).filter(Boolean);
  const startTime = parseTimeToken(eventDate, startToken);
  const endTime = parseTimeToken(eventDate, endToken);

  if (startTime && endTime) {
    if (now >= startTime && now <= endTime) return "ongoing";
    if (now < startTime) return "upcoming";
    return "past";
  }

  if (startTime && !endTime) {
    return now < startTime ? "upcoming" : "ongoing";
  }

  const startOfEventDay = new Date(eventDate);
  startOfEventDay.setHours(0, 0, 0, 0);
  const endOfEventDay = new Date(eventDate);
  endOfEventDay.setHours(23, 59, 59, 999);

  if (now >= startOfEventDay && now <= endOfEventDay) return "ongoing";
  return eventDate > now ? "upcoming" : "past";
}

export default function StudentDashboard() {
  const [events, setEvents] = useState([]);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [recommendedEvents, setRecommendedEvents] = useState([]);
  const [recommendedLoading, setRecommendedLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError("");
      try {
        const eventsRes = await eventsApi.getEvents();
        let myRegsRes;
        try {
          myRegsRes = await registrationApi.getStudentRegistrations();
        } catch (registrationError) {
          myRegsRes = await registrationApi.getMyEvents();
        }
        setEvents(eventsRes.data);
        setRegisteredEvents(myRegsRes.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    const loadFilteredRecommendations = async () => {
      if (activeFilter === "all") {
        setRecommendedEvents([]);
        setRecommendedLoading(false);
        return;
      }

      const selectedMeta = FILTER_META[activeFilter];
      if (!selectedMeta) {
        setRecommendedEvents([]);
        return;
      }

      setRecommendedLoading(true);
      try {
        const response = await eventsApi.getRecommendations({ type: selectedMeta.apiType });
        const payload = response.data;
        const recommendationList = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.recommendedEvents)
            ? payload.recommendedEvents
            : [];
        setRecommendedEvents(recommendationList);
      } catch (recommendationError) {
        console.warn("Failed to load filtered recommendations", recommendationError);
        setRecommendedEvents([]);
      } finally {
        setRecommendedLoading(false);
      }
    };

    loadFilteredRecommendations();
  }, [activeFilter]);

  const upcomingCount = useMemo(() => {
    const now = new Date();
    return events.filter((event) => getEventStatus(event, now) === "upcoming").length;
  }, [events]);

  const registeredEventIds = useMemo(() => {
    return registeredEvents
      .map((entry) => {
        if (entry?.event?._id) return entry.event._id;
        if (typeof entry?.eventId === "string") return entry.eventId;
        if (entry?.eventId?._id) return entry.eventId._id;
        return null;
      })
      .filter(Boolean)
      .map((id) => String(id));
  }, [registeredEvents]);

  const eventsWithMeta = useMemo(() => {
    const now = new Date();
    return events.map((event) => ({
      ...event,
      eventStatus: getEventStatus(event, now),
      isRegistered: registeredEventIds.includes(String(event._id)),
    }));
  }, [events, registeredEventIds]);

  const recommendationCards = useMemo(() => {
    return recommendedEvents
      .filter((event) => event && event._id && !registeredEventIds.includes(String(event._id)))
      .map((event) => ({
        ...event,
        eventStatus: getEventStatus(event, new Date()),
        isRegistered: registeredEventIds.includes(String(event._id)),
      }));
  }, [recommendedEvents, registeredEventIds]);

  const allEventsGrid = useMemo(() => eventsWithMeta, [eventsWithMeta]);

  const typedEventsGrid = useMemo(() => {
    if (activeFilter === "all") return [];
    return eventsWithMeta.filter((event) => matchFilterType(event.eventType, activeFilter));
  }, [activeFilter, eventsWithMeta]);

  const renderEventGridSection = (title, items, emptyMessage) => (
    <section className="recommended-events-wrap mb-4">
      <h4 className="mb-3">{title}</h4>
      {items.length ? (
        <div className="row g-4">
          {items.map((event, index) => (
            <motion.div
              className="col-12 col-md-6 col-xl-4"
              key={event._id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: Math.min(index, 6) * 0.04 }}
            >
              <EventCard event={event} showRegister isRegistered={registeredEventIds.includes(String(event._id))} />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="alert alert-info mb-0">{emptyMessage}</div>
      )}
    </section>
  );

  return (
    <div className="dashboard-page">
      <Navbar />

      <motion.section
        className="dashboard-hero"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        <div className="dashboard-shell">
          <div className="dashboard-hero-card">
            <h2 className="mb-2">Student Dashboard</h2>
            <p className="mb-0">Browse and register for campus events easily.</p>
          </div>
        </div>
      </motion.section>

      <div className="dashboard-shell dashboard-wrap">

      <motion.div
        className="row g-3 mb-4 dashboard-stats-row"
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: {
            transition: { staggerChildren: 0.08 },
          },
        }}
      >
        <motion.div className="col-md-4" variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}>
          <div className="card border-0 shadow-sm stat-card stat-modern stat-blue">
            <div className="card-body d-flex align-items-start justify-content-between gap-3">
              <div>
                <p className="text-secondary mb-1">Total Events</p>
                <h3 className="mb-0">{events.length}</h3>
              </div>
              <span className="stat-icon-wrap"><FiCalendar size={22} /></span>
            </div>
          </div>
        </motion.div>
        <motion.div className="col-md-4" variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}>
          <div className="card border-0 shadow-sm stat-card stat-modern stat-violet">
            <div className="card-body d-flex align-items-start justify-content-between gap-3">
              <div>
                <p className="text-secondary mb-1">Upcoming Events</p>
                <h3 className="mb-0">{upcomingCount}</h3>
              </div>
              <span className="stat-icon-wrap"><FiClock size={22} /></span>
            </div>
          </div>
        </motion.div>
        <motion.div className="col-md-4" variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}>
          <div className="card border-0 shadow-sm stat-card stat-modern stat-cyan">
            <div className="card-body d-flex align-items-start justify-content-between gap-3">
              <div>
                <p className="text-secondary mb-1">Registered Events</p>
                <h3 className="mb-0">{registeredEvents.length}</h3>
              </div>
              <span className="stat-icon-wrap"><FiCheckCircle size={22} /></span>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-3 mb-0">Loading dashboard...</p>
        </div>
      ) : null}
      {error ? <div className="alert alert-danger">{error}</div> : null}

      {!loading ? (
        <section className="dashboard-filter-wrap mb-4">
          <div className="d-flex flex-wrap gap-3 justify-content-center">
            {FILTERS.map((filter) => (
              <motion.button
                key={filter.key}
                type="button"
                className={`dashboard-filter-btn ${activeFilter === filter.key ? "active" : ""}`}
                onClick={() => setActiveFilter(filter.key)}
                whileHover={{ y: -1, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {filter.label}
              </motion.button>
            ))}
          </div>
        </section>
      ) : null}

      {!loading ? (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeFilter}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
          >
            {activeFilter === "all" ? (
              renderEventGridSection("All Events", allEventsGrid, "No events available right now.")
            ) : (
              <>
                <RecommendedEvents
                  title={FILTER_META[activeFilter]?.title || "Recommended Events"}
                  events={recommendationCards}
                  loading={recommendedLoading}
                  emptyMessage="No personalized recommendations yet. Register for events to improve suggestions."
                />
                {renderEventGridSection(
                  `All ${FILTERS.find((filter) => filter.key === activeFilter)?.label || "Filtered"} Events`,
                  typedEventsGrid,
                  "No events available for this category."
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      ) : null}
      </div>

      <EventAssistantChatbot />
    </div>
  );
}
