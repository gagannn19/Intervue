// Slim step indicator for the scheduling wizard. A segmented bar (works at
// any width) plus a "Step N of M · Label" line. Colors are theme tokens,
// so it's correct in light and dark automatically.
export function WizardProgress({ steps, current }) {
  return (
    <div>
      <div className="flex items-center gap-1.5">
        {steps.map((label, i) => (
          <div
            key={label}
            className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
              i <= current ? "bg-[#6D5EF8]" : "bg-[var(--ink)]/10"
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-[var(--ink)]/50 mt-2">
        Step {current + 1} of {steps.length} ·{" "}
        <span className="text-[var(--ink)]/75 font-semibold">{steps[current]}</span>
      </p>
    </div>
  );
}
