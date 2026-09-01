import { INTERVIEW_TYPES } from "../../constants/interviewTypes";

export function InterviewTypeSelector({ value, onChange }) {
  return (
    <div>
      <label className="text-xs font-semibold text-[var(--ink)]/60 uppercase tracking-wide">Interview type</label>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
        {INTERVIEW_TYPES.map((t) => (
          <button
            key={t.id}
            disabled={!t.live}
            onClick={() => onChange(t.id)}
            className={`p-3 rounded-xl border text-left transition-colors ${
              value === t.id ? "border-[#6D5EF8] bg-[#6D5EF8]/5" : "border-[var(--ink)]/10"
            } ${!t.live && "opacity-40 cursor-not-allowed"}`}
          >
            <t.icon size={15} className="text-[#4C3FE0]" />
            <p className="text-xs font-semibold mt-1.5 text-[var(--ink)]">{t.label}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
