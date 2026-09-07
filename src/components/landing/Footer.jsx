export function Footer() {
  return (
    <footer className="border-t border-[var(--ink)]/8 py-10">
      <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] text-[var(--ink)]/50">
        <span>© 2026 Intervue. Practice with pressure, not pretense.</span>
        <div className="flex items-center gap-4">
          <span className="hover:text-[var(--ink)] cursor-pointer">GitHub</span>
          <span className="hover:text-[var(--ink)] cursor-pointer">Twitter</span>
          <span className="hover:text-[var(--ink)] cursor-pointer">LinkedIn</span>
        </div>
      </div>
    </footer>
  );
}
