import { Loader2, Sparkles } from "lucide-react";
import { disp, themeVars } from "../../constants/theme";

export function AuthLoadingScreen({ dark }) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-3 bg-[var(--bg)] transition-colors duration-300"
      style={{ ...themeVars(dark), fontFamily: "'Inter', sans-serif" }}
    >
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6D5EF8] to-[#4C3FE0] flex items-center justify-center">
        <Sparkles size={18} className="text-white" />
      </div>
      <Loader2 size={18} className="animate-spin text-[var(--ink)]/40" />
      <p className="text-sm text-[var(--ink)]/50" style={disp}>Checking your session…</p>
    </div>
  );
}
