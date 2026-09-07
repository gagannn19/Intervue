const inputCls = "w-full mt-2 rounded-xl border border-[var(--ink)]/12 bg-[var(--surface)] text-[var(--ink)] px-3 py-2.5 text-sm outline-none focus:border-[#6D5EF8]";

// Date, time, and the two optional fields (target role, custom instructions).
export function ScheduleDetailsForm({ dark, date, onDateChange, time, onTimeChange, role, onRoleChange, instructions, onInstructionsChange }) {
  // Native <input type="date"/"time"> pickers (the calendar/clock icon and
  // the popup itself) are drawn by the browser, not by our CSS — they
  // default to a light color-scheme regardless of our theme, which is why
  // the icon disappears against a dark input background. Telling the
  // browser which scheme we're actually using fixes both the icon and the
  // popup, in both directions.
  const dateTimeStyle = { colorScheme: dark ? "dark" : "light" };

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-[var(--ink)]/60 uppercase tracking-wide">Date</label>
          <input type="date" value={date} onChange={(e) => onDateChange(e.target.value)} className={inputCls} style={dateTimeStyle} />
        </div>
        <div>
          <label className="text-xs font-semibold text-[var(--ink)]/60 uppercase tracking-wide">Time</label>
          <input type="time" value={time} onChange={(e) => onTimeChange(e.target.value)} className={inputCls} style={dateTimeStyle} />
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-[var(--ink)]/60 uppercase tracking-wide">Target role (optional)</label>
        <input
          value={role}
          onChange={(e) => onRoleChange(e.target.value)}
          placeholder="e.g. Frontend Developer @ a product startup"
          className={inputCls}
        />
      </div>

      <div>
        <label className="text-xs font-semibold text-[var(--ink)]/60 uppercase tracking-wide">Custom instructions (optional)</label>
        <textarea
          value={instructions}
          onChange={(e) => onInstructionsChange(e.target.value)}
          rows={2}
          placeholder="e.g. Go easy on system design, focus on arrays and strings"
          className={`${inputCls} resize-none`}
        />
      </div>
    </>
  );
}
