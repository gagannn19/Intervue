const DIFFICULTIES = ["Easy", "Medium", "Hard"];
const DURATIONS = [15, 30, 45, 60];

// Difficulty and duration are two small, closely-related pickers on the same
// form step — grouped in one file rather than split into two near-empty ones.
export function DifficultyDurationSelector({ difficulty, onDifficultyChange, duration, onDurationChange }) {
  return (
    <>
      <div>
        <label className="text-xs font-semibold text-[var(--ink)]/60 uppercase tracking-wide">Difficulty</label>
        <div className="grid grid-cols-3 gap-2 mt-2">
          {DIFFICULTIES.map((d) => (
            <button
              key={d}
              onClick={() => onDifficultyChange(d)}
              className={`py-2.5 rounded-xl border text-sm font-semibold transition-colors ${
                difficulty === d ? "border-[#6D5EF8] bg-[#6D5EF8]/5 text-[#4C3FE0]" : "border-[var(--ink)]/10 text-[var(--ink)]/60"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-[var(--ink)]/60 uppercase tracking-wide">Duration</label>
        <div className="grid grid-cols-4 gap-2 mt-2">
          {DURATIONS.map((d) => (
            <button
              key={d}
              onClick={() => onDurationChange(d)}
              className={`py-2.5 rounded-xl border text-sm font-semibold transition-colors ${
                duration === d ? "border-[#6D5EF8] bg-[#6D5EF8]/5 text-[#4C3FE0]" : "border-[var(--ink)]/10 text-[var(--ink)]/60"
              }`}
            >
              {d}m
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
