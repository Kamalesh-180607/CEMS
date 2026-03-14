import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "./Logo";

export default function SplashScreen() {
  const navigate = useNavigate();
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const exitTimer = setTimeout(() => setIsExiting(true), 2400);
    const navigateTimer = setTimeout(() => navigate("/login", { replace: true }), 3000);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(navigateTimer);
    };
  }, [navigate]);

  return (
    <main className={`splash-screen ${isExiting ? "fade-out" : ""}`}>
      <div className="splash-glow splash-glow-left" aria-hidden="true" />
      <div className="splash-glow splash-glow-right" aria-hidden="true" />
      <div className="splash-content">
        <Logo light className="splash-logo" />
        <h1 className="splash-title">CEMS - Campus Event Management System</h1>
      </div>
    </main>
  );
}
