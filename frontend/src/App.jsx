import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentDashboard from "./pages/StudentDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import EventDetails from "./pages/EventDetails";
import EventRegistration from "./pages/EventRegistration";
import Announcements from "./pages/Announcements";
import EventsPage from "./pages/EventsPage";
import RegisteredEvents from "./pages/RegisteredEvents";
import StudentProfile from "./pages/StudentProfile";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("cemsToken");
  const user = JSON.parse(localStorage.getItem("cemsUser") || "null");

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === "admin" ? "/admin" : "/dashboard"} replace />;
  }

  return children;
};

export default function App() {
  const user = JSON.parse(localStorage.getItem("cemsUser") || "null");
  const homePath = user?.role === "admin" ? "/admin" : "/dashboard";

  return (
    <Routes>
      <Route path="/" element={<Navigate to={homePath} replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/student" element={<Navigate to="/dashboard" replace />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/events"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <EventsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-events"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <RegisteredEvents />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <StudentProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/events/:id"
        element={
          <ProtectedRoute allowedRoles={["student", "admin"]}>
            <EventDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/events/:id/register"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <EventRegistration />
          </ProtectedRoute>
        }
      />
      <Route
        path="/announcements"
        element={
          <ProtectedRoute allowedRoles={["student", "admin"]}>
            <Announcements />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
