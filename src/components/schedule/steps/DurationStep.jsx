import { DURATIONS } from "../../../constants/schedule";
import { StepHeading } from "./StepHeading";

// Step 6. Same duration options as the classic scheduler (shared list in
// src/constants/schedule.js).
export function DurationStep({ value, onChange }) {
  return (
    <div>
      <StepHeading title="How long should the interview be?" />

      <div className="grid grid-cols-4 gap-2">
        {DURATIONS.map((d) => (
          <button
            key={d}
            onClick={() => onChange(d)}
            aria-pressed={value === d}
            className={`py-2.5 rounded-xl border text-sm font-semibold transition-colors ${
              value === d
                ? "border-[#6D5EF8] bg-[#6D5EF8]/5 text-[#4C3FE0]"
                : "border-[var(--ink)]/10 text-[var(--ink)]/60 hover:border-[var(--ink)]/25"
            }`}
          >
            {d}m
          </button>
        ))}
      </div>
    </div>
  );
}
