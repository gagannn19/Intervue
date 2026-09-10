import { StepHeading } from "./StepHeading";

const inputCls =
  "w-full mt-2 rounded-xl border border-[var(--ink)]/12 bg-[var(--surface)] text-[var(--ink)] px-3 py-2.5 text-sm outline-none focus:border-[#6D5EF8]";

// Steps 7 & 8 combined — date and time are always chosen together and
// share the same native-picker dark-mode fix as the classic scheduler:
// telling the browser our color-scheme keeps the calendar/clock icon and
// popup visible in both themes.
export function WhenStep({ dark, date, onDateChange, time, onTimeChange }) {
  const dateTimeStyle = { colorScheme: dark ? "dark" : "light" };

  return (
    <div>
      <StepHeading title="When should it happen?" />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-[var(--ink)]/60 uppercase tracking-wide">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            className={inputCls}
            style={dateTimeStyle}
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-[var(--ink)]/60 uppercase tracking-wide">Time</label>
          <input
            type="time"
            value={time}
            onChange={(e) => onTimeChange(e.target.value)}
            className={inputCls}
            style={dateTimeStyle}
          />
        </div>
      </div>
    </div>
  );
}
