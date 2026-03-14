import { useEffect } from "react";
import { createPortal } from "react-dom";
import { FiX } from "react-icons/fi";

export default function PosterPreviewModal({ src, alt = "Event Poster", onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const modal = (
    <div className="poster-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="poster-modal-inner" onClick={(e) => e.stopPropagation()}>
        <button
          className="poster-modal-close"
          onClick={onClose}
          aria-label="Close poster preview"
          type="button"
        >
          <FiX size={22} />
        </button>
        <img src={src} alt={alt} className="poster-modal-image" />
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(modal, document.body);
}
