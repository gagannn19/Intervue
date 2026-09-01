import { Sun, Moon } from "lucide-react";

// Sun/Moon toggle used in the landing header and the app sidebar.
export function ThemeToggle({ dark, onToggle, size = "md" }) {
  const dim = size === "sm" ? "w-8 h-8" : "w-10 h-10";
  return (
    <button
      onClick={onToggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
      className={`relative ${dim} shrink-0 rounded-xl flex items-center justify-center border border-[var(--ink)]/10
        bg-[var(--surface)] text-[var(--ink)]/70 hover:border-[var(--ink)]/25 hover:text-[var(--ink)]
        transition-colors duration-300`}
    >
      <span className="relative w-4 h-4">
        <Sun size={16} className={`absolute inset-0 transition-all duration-300 ${dark ? "opacity-0 rotate-90 scale-50" : "opacity-100 rotate-0 scale-100"}`} />
        <Moon size={16} className={`absolute inset-0 transition-all duration-300 ${dark ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-50"}`} />
      </span>
    </button>
  );
}
