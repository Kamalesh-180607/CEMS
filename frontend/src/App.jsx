import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentDashboard from "./pages/StudentDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import EventDetails from "./pages/EventDetails";
import EventRegistration from "./pages/EventRegistration";
import Announcements from "./pages/Announcements";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("cemsToken");
  const user = JSON.parse(localStorage.getItem("cemsUser") || "null");

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === "admin" ? "/admin" : "/student"} replace />;
  }

  return children;
};

export default function App() {
  const user = JSON.parse(localStorage.getItem("cemsUser") || "null");

  return (
    <Routes>
      <Route path="/" element={<Navigate to={user?.role === "admin" ? "/admin" : "/student"} replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <StudentDashboard />
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
