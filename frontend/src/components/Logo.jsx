export default function Logo({ compact = false, light = false, className = "" }) {
  return (
    <div className={`cems-logo ${compact ? "compact" : ""} ${light ? "light" : ""} ${className}`.trim()}>
      <span className="cems-logo-icon" aria-hidden="true">
        C
      </span>
      <span className="cems-logo-text">CEMS</span>
    </div>
  );
}
