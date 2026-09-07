import { LayoutDashboard, History, LogOut, Sparkles } from "lucide-react";
import { ThemeToggle } from "../ui/ThemeToggle";
import { disp, themeVars } from "../../constants/theme";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "history", label: "History", icon: History },
];

// Shared shell for every logged-in page (dashboard, schedule, history,
// feedback): sidebar nav + theme toggle + the --ink/--bg/--surface vars for
// this whole subtree. Kept as one file since the sidebar is small enough
// that splitting it out further wouldn't add clarity.
export function AppShell({ active, onNav, onLogout, dark, onToggleDark, children }) {
  return (
    <div
      className="min-h-screen bg-[var(--bg)] flex transition-colors duration-300"
      style={{ ...themeVars(dark), fontFamily: "'Inter', sans-serif" }}
    >
      <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-[var(--ink)]/8 bg-[var(--surface)] p-5 transition-colors duration-300">
        <div className="flex items-center justify-between px-1 mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6D5EF8] to-[#4C3FE0] flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="font-bold text-[17px] text-[var(--ink)]" style={disp}>Intervue</span>
          </div>
          <ThemeToggle dark={dark} onToggle={onToggleDark} size="sm" />
        </div>

        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((n) => (
            <button
              key={n.id}
              onClick={() => onNav(n.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                active === n.id ? "bg-[#6D5EF8]/12 text-[#8577FF]" : "text-[var(--ink)]/60 hover:bg-[var(--ink)]/5"
              }`}
            >
              <n.icon size={17} /> {n.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-4 border-t border-[var(--ink)]/8">
          <button onClick={onLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[var(--ink)]/50 hover:bg-[var(--ink)]/5 w-full">
            <LogOut size={17} /> Log out
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
