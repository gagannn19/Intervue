import { disp } from "../../../constants/theme";

// Shared question + hint header used at the top of every wizard step, so
// the copy styling stays identical across steps.
export function StepHeading({ title, hint }) {
  return (
    <div className="mb-4">
      <h2 className="text-base font-bold text-[var(--ink)]" style={disp}>{title}</h2>
      {hint && <p className="text-[13px] text-[var(--ink)]/55 mt-1">{hint}</p>}
    </div>
  );
}
