import { StepHeading } from "./StepHeading";
import { DatePicker } from "../../ui/DatePicker";
import { TimePicker } from "../../ui/TimePicker";

const labelCls = "text-xs font-semibold text-[var(--ink)]/60 uppercase tracking-wide";

// Steps 7 & 8 combined — date and time are always chosen together. Themed
// pickers (not the native inputs) so the popups match the app in both
// themes; the time picker gets the date so it can disable past slots today.
export function WhenStep({ date, onDateChange, time, onTimeChange }) {
  return (
    <div>
      <StepHeading title="When should it happen?" />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Date</label>
          <DatePicker value={date} onChange={onDateChange} />
        </div>
        <div>
          <label className={labelCls}>Time</label>
          <TimePicker value={time} onChange={onTimeChange} date={date} />
        </div>
      </div>
    </div>
  );
}
