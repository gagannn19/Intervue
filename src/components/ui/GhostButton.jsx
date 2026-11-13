// Secondary button — outlined pill, matches the primary's rounded-full
// shape (see DesignSystem.png's "Secondary Button").
export function GhostButton({ children, onClick, className = "", disabled, type = "button" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold
        text-[var(--ink)] bg-[var(--surface)] border border-[var(--ink)]/15 hover:border-[var(--ink)]/35 hover:-translate-y-0.5
        transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none ${className}`}
    >
      {children}
    </button>
  );
}
