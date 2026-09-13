import { disp } from "../../constants/theme";

export function Footer() {
  return (
    <footer className="border-t border-[var(--ink)]/8 py-10">
      <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-[13px] text-[var(--ink)]/50">
          <img src="/brand/logo-mark.png" alt="" className="w-5 h-5" />
          <span style={disp} className="text-base text-[var(--ink)]/70">Cuecast</span>
          <span>· © 2026 · Practice with pressure, not pretense.</span>
        </div>
        <div className="flex items-center gap-4 text-[13px] text-[var(--ink)]/50">
          <span className="hover:text-[var(--ink)] cursor-pointer">GitHub</span>
          <span className="hover:text-[var(--ink)] cursor-pointer">Twitter</span>
          <span className="hover:text-[var(--ink)] cursor-pointer">LinkedIn</span>
        </div>
      </div>
    </footer>
  );
}
