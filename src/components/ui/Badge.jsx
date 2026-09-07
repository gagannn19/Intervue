const TONES = {
  violet: "bg-[#6D5EF8]/12 text-[#8577FF]",
  green: "bg-[#22C97A]/14 text-[#1FAE6C]",
  amber: "bg-[#F5A623]/14 text-[#D98D0E]",
  red: "bg-[#FF5C7A]/14 text-[#E24468]",
  ink: "bg-[var(--ink)]/6 text-[var(--ink)]/70",
};

export function Badge({ children, tone = "violet" }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap ${TONES[tone]}`}>
      {children}
    </span>
  );
}
