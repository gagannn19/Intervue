// A pulsing grey placeholder, shown where data will appear once it loads.
export function Skeleton({ className = "" }) {
  return <div className={`animate-pulse rounded-md bg-[var(--ink)]/10 ${className}`} />;
}
