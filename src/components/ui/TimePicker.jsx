import { useCallback, useRef, useState } from "react";
import { Clock } from "lucide-react";
import { usePopoverDismiss } from "../../hooks/usePopoverDismiss";
import { toISODate } from "../../utils/dateTime";

const STEP_MINUTES = 30;

// The day split into four 6-hour tabs of 12 slots each (a 3x4 grid).
const PERIODS = [
  { id: "night", label: "Night", from: 0 },
  { id: "morning", label: "Morning", from: 6 },
  { id: "afternoon", label: "Afternoon", from: 12 },
  { id: "evening", label: "Evening", from: 18 },
];

function slotsFor(period) {
  const slots = [];
  for (let mins = period.from * 60; mins < (period.from + 6) * 60; mins += STEP_MINUTES) {
    slots.push(toHHMM(mins));
  }
  return slots;
}

function toHHMM(totalMinutes) {
  const h = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
  const m = String(totalMinutes % 60).padStart(2, "0");
  return `${h}:${m}`;
}

function toMinutes(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function formatTime(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return new Date(2000, 0, 1, h, m).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit", hour12: true });
}

function periodOf(hhmm) {
  const hour = Math.floor(toMinutes(hhmm) / 60);
  return [...PERIODS].reverse().find((p) => hour >= p.from).id;
}

// Themed replacement for <input type="time">. Same value contract ("HH:MM",
// 24h) so callers don't change. Pass the chosen `date` ("YYYY-MM-DD") and
// slots already past today are disabled.
export function TimePicker({ value, onChange, date, placeholder = "Pick a time" }) {
  const [open, setOpen] = useState(false);
  const [period, setPeriod] = useState("morning");
  const rootRef = useRef(null);
  const close = useCallback(() => setOpen(false), []);
  usePopoverDismiss(rootRef, open, close);

  const now = new Date();
  const cutoff = date === toISODate(now) ? now.getHours() * 60 + now.getMinutes() : -1;
  const isPast = (slot) => toMinutes(slot) <= cutoff;

  const toggle = () => {
    if (!open) {
      // Open on the selected slot's tab, else the first tab with a free slot.
      const firstFree = PERIODS.find((p) => slotsFor(p).some((s) => !isPast(s)));
      setPeriod(value ? periodOf(value) : cutoff >= 0 ? firstFree?.id ?? "evening" : "morning");
    }
    setOpen((o) => !o);
  };

  const pick = (slot) => {
    onChange(slot);
    setOpen(false);
  };

  const activePeriod = PERIODS.find((p) => p.id === period);

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
        <Clock size={16} className="shrink-0 text-[#FF7A00]" />
        <span className={value ? "text-[var(--ink)]" : "text-[var(--ink)]/40"}>
          {value ? formatTime(value) : placeholder}
        </span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Choose a time"
          className="absolute right-0 z-20 mt-2 w-72 rounded-xl border border-[var(--ink)]/12 bg-[var(--surface)] p-3 shadow-[0_12px_32px_-8px_rgba(18,18,43,0.28)]"
        >
          <div className="grid grid-cols-4 gap-1 p-1 mb-3 rounded-lg bg-[var(--ink)]/5">
            {PERIODS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPeriod(p.id)}
                className={`rounded-md py-1.5 text-[11px] font-semibold transition-colors ${
                  p.id === period
                    ? "bg-[var(--surface)] text-[var(--ink)] shadow-[0_1px_2px_rgba(17,17,17,0.12)]"
                    : "text-[var(--ink)]/50 hover:text-[var(--ink)]"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {slotsFor(activePeriod).map((slot) => {
              const past = isPast(slot);
              const isSelected = slot === value;
              return (
                <button
                  key={slot}
                  type="button"
                  disabled={past}
                  onClick={() => pick(slot)}
                  aria-pressed={isSelected}
                  className={`rounded-lg py-2 text-[13px] transition-colors ${
                    isSelected
                      ? "bg-[#FF7A00] text-white font-semibold"
                      : past
                        ? "text-[var(--ink)]/20 cursor-not-allowed"
                        : "text-[var(--ink)] border border-[var(--ink)]/10 hover:border-[#FF7A00]/50 hover:bg-[#FF7A00]/8"
                  }`}
                >
                  {formatTime(slot)}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
