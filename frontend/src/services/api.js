import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("cemsToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  console.log("API Request:", config.method.toUpperCase(), config.url);
  if (config.data instanceof FormData) {
    console.log("Request has FormData");
  }
  
  return config;
});

export const authApi = {
  register: (payload) => api.post("/auth/register", payload),
  login: (payload) => api.post("/auth/login", payload),
};

export const eventsApi = {
  getEvents: (params) => api.get("/events", { params }),
  getMyEvents: () => api.get("/admin/events"),
  getRecommendations: (params) => api.get("/events/recommendations", { params }),
  getById: (id) => api.get(`/events/${id}`),
  create: (formData) => {
    console.log("API.create() called with FormData");
    return api.post("/events", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  update: (id, formData) => {
    console.log("API.update() called for event:", id);
    return api.put(`/events/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  remove: (id) => api.delete(`/events/${id}`),
};

export const registrationApi = {
  register: (payload) => api.post("/register", payload),
  createOrder: (payload) => api.post("/register/order", payload),
  getStudentRegistrations: () => api.get("/register/student"),
  getByEvent: (eventId) => api.get(`/register/event/${eventId}`),
  getMyEvents: () => api.get("/registrations/my-events"),
  remove: (registrationId) => api.delete(`/registrations/${registrationId}`),
};

export const paymentApi = {
  createOrder: (payload) => api.post("/payment/create-order", payload),
};

export const announcementApi = {
  getAll: () => api.get("/announcements"),
  getUnreadCount: () => api.get("/announcements/unread-count"),
  markViewed: () => api.post("/announcements/mark-viewed"),
  dismiss: (announcementId) => api.post(`/announcements/${announcementId}/dismiss`),
  clearAll: () => api.post("/student/announcements/clear-all"),
};

export const usersApi = {
  getProfile: () => api.get("/users/profile"),
  updateProfile: (payload) => {
    if (payload instanceof FormData) {
      return api.put("/users/update-profile", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }
    return api.put("/users/update-profile", payload);
  },
};

export const studentsApi = {
  getActivitySummary: () => api.get("/students/activity-summary"),
  removeProfilePicture: () => api.delete("/students/profile-picture"),
};

export const adminApi = {
  removeProfilePicture: () => api.delete("/admin/profile-picture"),
  hideAnnouncement: (announcementId) => api.post(`/admin/announcements/hide/${announcementId}`),
  clearAllAnnouncements: () => api.post("/admin/announcements/clear-all"),
};

export const aiApi = {
  chat: (message) => api.post("/assistant", { message }),
};

export default api;
