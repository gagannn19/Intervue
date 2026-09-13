export function Card({ children, className = "" }) {
  return (
    <div className={`rounded-2xl bg-[var(--surface)] border border-[var(--ink)]/8 shadow-[0_1px_0_rgba(17,17,17,0.04)] transition-colors duration-300 ${className}`}>
      {children}
    </div>
  );
}
