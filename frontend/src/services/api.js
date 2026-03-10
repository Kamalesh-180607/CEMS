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
  return config;
});

export const authApi = {
  register: (payload) => api.post("/auth/register", payload),
  login: (payload) => api.post("/auth/login", payload),
};

export const eventsApi = {
  getEvents: (params) => api.get("/events", { params }),
  getMyEvents: () => api.get("/events/my/list"),
  getById: (id) => api.get(`/events/${id}`),
  create: (formData) => api.post("/events/create", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }),
  update: (id, formData) =>
    api.put(`/events/update/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  remove: (id) => api.delete(`/events/delete/${id}`),
};

export const registrationApi = {
  register: (payload) => api.post("/register", payload),
  createOrder: (payload) => api.post("/register/order", payload),
  getByEvent: (eventId) => api.get(`/register/event/${eventId}`),
  getMyEvents: () => api.get("/registrations/my-events"),
};

export const announcementApi = {
  getAll: () => api.get("/announcements"),
};

export const usersApi = {
  getProfile: () => api.get("/users/profile"),
  updateProfile: (payload) => api.put("/users/update-profile", payload),
};

export default api;
