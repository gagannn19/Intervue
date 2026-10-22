import { useCallback, useMemo, useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { usePopoverDismiss } from "../../hooks/usePopoverDismiss";
import { toISODate } from "../../utils/dateTime";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

// "YYYY-MM-DD" -> local Date. Parsed by parts, not `new Date(str)`, which
// reads a bare date as UTC and can land on the previous day.
function parseISODate(value) {
  if (!value) return null;
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

// Always 6 rows so the popover doesn't change height between months.
function monthCells(year, month) {
  const lead = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: 42 }, (_, i) => {
    const day = i - lead + 1;
    return day >= 1 && day <= days ? new Date(year, month, day) : null;
  });
}

// Themed replacement for <input type="date">. Same value contract
// ("YYYY-MM-DD" string in, out via onChange) so callers don't change.
// Past days are disabled — you can't schedule an interview in the past.
export function DatePicker({ value, onChange, placeholder = "Pick a date" }) {
  const selected = parseISODate(value);
  const today = startOfToday();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(() => {
    const base = selected ?? today;
    return { year: base.getFullYear(), month: base.getMonth() };
  });
  const rootRef = useRef(null);
  const close = useCallback(() => setOpen(false), []);
  usePopoverDismiss(rootRef, open, close);

  const cells = useMemo(() => monthCells(view.year, view.month), [view]);
  const atCurrentMonth = view.year === today.getFullYear() && view.month === today.getMonth();
  const monthLabel = new Date(view.year, view.month, 1).toLocaleDateString(undefined, { month: "long", year: "numeric" });

  const shiftMonth = (delta) =>
    setView(({ year, month }) => {
      const next = new Date(year, month + delta, 1);
      return { year: next.getFullYear(), month: next.getMonth() };
    });

  const toggle = () => {
    if (!open && selected) setView({ year: selected.getFullYear(), month: selected.getMonth() });
    setOpen((o) => !o);
  };

  const pick = (date) => {
    onChange(toISODate(date));
    setOpen(false);
  };

  const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

  return (
    <div ref={rootRef} className="relative mt-2">
      <button
        type="button"
        onClick={toggle}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={`w-full flex items-center gap-2.5 rounded-xl border bg-[var(--surface)] px-3 py-2.5 text-sm text-left outline-none transition-colors ${
          open ? "border-[#FF7A00]" : "border-[var(--ink)]/12 hover:border-[var(--ink)]/25"
        }`}
      >
        <CalendarDays size={16} className="shrink-0 text-[#FF7A00]" />
        <span className={selected ? "text-[var(--ink)]" : "text-[var(--ink)]/40"}>
          {selected
            ? selected.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short", year: "numeric" })
            : placeholder}
        </span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Choose a date"
          className="absolute left-0 z-20 mt-2 w-72 rounded-xl border border-[var(--ink)]/12 bg-[var(--surface)] p-3 shadow-[0_12px_32px_-8px_rgba(18,18,43,0.28)]"
        >
          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              onClick={() => shiftMonth(-1)}
              disabled={atCurrentMonth}
              aria-label="Previous month"
              className="p-1.5 rounded-lg text-[var(--ink)]/60 hover:bg-[var(--ink)]/5 disabled:opacity-25 disabled:hover:bg-transparent"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-semibold text-[var(--ink)]">{monthLabel}</span>
            <button
              type="button"
              onClick={() => shiftMonth(1)}
              aria-label="Next month"
              className="p-1.5 rounded-lg text-[var(--ink)]/60 hover:bg-[var(--ink)]/5"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-7 mb-1">
            {WEEKDAYS.map((d) => (
              <span key={d} className="text-center text-[11px] font-semibold text-[var(--ink)]/40 py-1">
                {d}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0.5">
            {cells.map((date, i) => {
              if (!date) return <span key={i} className="h-9" />;
              const past = date < today;
              const isSelected = selected && date.getTime() === selected.getTime();
              const isToday = date.getTime() === today.getTime();
              return (
                <button
                  key={i}
                  type="button"
                  disabled={past}
                  onClick={() => pick(date)}
                  aria-pressed={Boolean(isSelected)}
                  className={`h-9 rounded-lg text-sm transition-colors ${
                    isSelected
                      ? "bg-[#FF7A00] text-white font-semibold"
                      : past
                        ? "text-[var(--ink)]/20 cursor-not-allowed"
                        : isToday
                          ? "text-[#FF7A00] font-semibold ring-1 ring-inset ring-[#FF7A00]/40 hover:bg-[#FF7A00]/10"
                          : "text-[var(--ink)] hover:bg-[var(--ink)]/6"
                  }`}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          <div className="flex gap-2 mt-3 pt-3 border-t border-[var(--ink)]/8">
            {[
              ["Today", today],
              ["Tomorrow", tomorrow],
            ].map(([label, date]) => (
              <button
                key={label}
                type="button"
                onClick={() => pick(date)}
                className="flex-1 rounded-lg py-1.5 text-xs font-medium text-[var(--ink)]/70 bg-[var(--ink)]/5 hover:bg-[#FF7A00]/12 hover:text-[#FF7A00] transition-colors"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
