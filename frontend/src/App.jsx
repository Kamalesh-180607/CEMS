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
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

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
          path="/registered-events"
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
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/events"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/create-event"
          element={
            <AdminRoute>
              <CreateEvent />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/announcements"
          element={
            <AdminRoute>
              <Announcements />
            </AdminRoute>
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
