import { Sparkles } from "lucide-react";
import { GhostButton } from "../ui/GhostButton";
import { GradientButton } from "../ui/GradientButton";
import { ThemeToggle } from "../ui/ThemeToggle";
import { disp } from "../../constants/theme";

export function Navbar({ onSchedule, onLogin, dark, onToggleDark }) {
  return (
    <header className="max-w-7xl mx-auto flex items-center justify-between px-6 py-5">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6D5EF8] to-[#4C3FE0] flex items-center justify-center">
          <Sparkles size={17} className="text-white" />
        </div>
        <span className="font-bold text-xl text-[var(--ink)]" style={disp}>Intervue</span>
      </div>

      <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[var(--ink)]/65">
        <a href="#how" className="hover:text-[var(--ink)]">How it works</a>
        <a href="#features" className="hover:text-[var(--ink)]">Features</a>
        <a href="#faq" className="hover:text-[var(--ink)]">FAQs</a>
        <a href="#pricing" className="hover:text-[var(--ink)]">Pricing</a>
      </nav>

      <div className="flex items-center gap-3">
        <ThemeToggle dark={dark} onToggle={onToggleDark} />
        <GhostButton onClick={onLogin} className="hidden sm:inline-flex px-4 py-2">Log in</GhostButton>
        <GradientButton onClick={onSchedule} className="px-4 py-2 text-[13px]">Schedule Interview</GradientButton>
      </div>
    </header>
  );
}
