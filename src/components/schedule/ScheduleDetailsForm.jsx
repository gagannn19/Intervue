import { DatePicker } from "../ui/DatePicker";
import { TimePicker } from "../ui/TimePicker";

const inputCls = "w-full mt-2 rounded-xl border border-[var(--ink)]/12 bg-[var(--surface)] text-[var(--ink)] px-3 py-2.5 text-sm outline-none focus:border-[#FF7A00]";

// Date, time, and the two optional fields (target role, custom instructions).
// Quick start hides date/time — it always starts now.
export function ScheduleDetailsForm({ showDateTime = true, date, onDateChange, time, onTimeChange, role, onRoleChange, instructions, onInstructionsChange }) {
  return (
    <>
      {showDateTime && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-[var(--ink)]/60 uppercase tracking-wide">Date</label>
            <DatePicker value={date} onChange={onDateChange} />
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--ink)]/60 uppercase tracking-wide">Time</label>
            <TimePicker value={time} onChange={onTimeChange} date={date} />
          </div>
        </div>
      )}

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
