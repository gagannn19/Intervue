import { GhostButton } from "../ui/GhostButton";
import { GradientButton } from "../ui/GradientButton";
import { ThemeToggle } from "../ui/ThemeToggle";
import { disp } from "../../constants/theme";

export function Navbar({ onSchedule, onLogin, dark, onToggleDark }) {
  return (
    <header className="max-w-7xl mx-auto flex items-center justify-between px-6 py-5 gap-4">
      <div className="flex items-center gap-3 shrink-0">
        <img src="/brand/logo-mark.png" alt="" className="w-8 h-8" />
        <span className="font-semibold text-2xl text-[var(--ink)]" style={disp}>Cuecast</span>
        <span className="hidden sm:block h-8 w-px bg-[var(--ink)]/12 mx-1" />
        <span className="hidden sm:flex flex-col leading-[1.05] text-[10px] tracking-wide text-[var(--ink)]/45 italic" style={disp}>
          <span>Practice</span>
          <span>Solve</span>
          <span>Grow</span>
        </span>
      </div>

      <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[var(--ink)]/65">
        <a href="#how" className="hover:text-[var(--ink)]">How it works</a>
        <a href="#features" className="hover:text-[var(--ink)]">Features</a>
        <a href="#pricing" className="hover:text-[var(--ink)]">Pricing</a>
        <a href="#faq" className="hover:text-[var(--ink)]">FAQs</a>
      </nav>

      <div className="flex items-center gap-3 shrink-0">
        <ThemeToggle dark={dark} onToggle={onToggleDark} />
        <GhostButton onClick={onLogin} className="hidden sm:inline-flex px-4 py-2">Log in</GhostButton>
        <GradientButton onClick={onSchedule} className="px-4 py-2 text-[13px]">Get Started →</GradientButton>
      </div>
    </header>
  );
}
