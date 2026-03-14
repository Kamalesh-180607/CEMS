import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentDashboard from "./pages/StudentDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import CreateEvent from "./pages/CreateEvent";
import EventDetails from "./pages/EventDetails";
import EventRegistration from "./pages/EventRegistration";
import Announcements from "./pages/Announcements";
import RegisteredEvents from "./pages/RegisteredEvents";
import StudentProfile from "./pages/StudentProfile";
import SplashScreen from "./components/SplashScreen";

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
  const location = useLocation();

  return (
    <div key={location.pathname} className="route-fade">
      <Routes>
        <Route path="/" element={<SplashScreen />} />
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
          element={<Navigate to="/dashboard" replace />}
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
            <ProtectedRoute allowedRoles={["student", "admin"]}>
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
          path="/admin/create-event"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <CreateEvent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/announcements"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Announcements />
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
    </div>
  );
}
