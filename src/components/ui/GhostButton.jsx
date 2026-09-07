export function GhostButton({ children, onClick, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold
        text-[var(--ink)] bg-[var(--surface)] border border-[var(--ink)]/10 hover:border-[var(--ink)]/25 hover:-translate-y-0.5
        transition-all duration-200 ${className}`}
    >
      {children}
    </button>
  );
}
