import { useState } from "react";
import { Loader2 } from "lucide-react";
import { INTERVIEW_TYPES, INTERVIEW_TYPE_META } from "../../constants/interviewTypes";

// Single-select by default (the old Custom Settings form): `value` is an id
// string, `onChange` receives the new id.
//
// Pass `multiple` for the wizard's Step 1: `value` is an array of ids and
// `onChange` receives the next array. Either way, non-live types can't be
// picked yet — the same notice as before is shown.
//
// `types` (optional): rows from GET /interview-types. When given, the list
// is backend-driven (id = slug, name, isActive); the icon is looked up
// locally by slug. When omitted, falls back to the static INTERVIEW_TYPES
// (the classic SchedulePage still uses that).
export function InterviewTypeSelector({ value, onChange, multiple = false, types, loading, error }) {
  const [notice, setNotice] = useState(null);

  const items = types?.length
    ? types.map((t) => {
        const meta = INTERVIEW_TYPE_META[t.slug] || {};
        return {
          id: t.slug,
          label: t.name,
          desc: t.description,
          icon: meta.icon,
          live: t.isActive,
        };
      })
    : INTERVIEW_TYPES;

  const isSelected = (id) => (multiple ? (value || []).includes(id) : value === id);

  const handleClick = (type) => {
    if (!type.live) {
      setNotice(`${type.label} interviews aren't available yet — DSA is the only live interview type right now.`);
      return;
    }
    setNotice(null);
    if (!multiple) {
      onChange(type.id);
      return;
    }
    const current = value || [];
    onChange(
      current.includes(type.id)
        ? current.filter((id) => id !== type.id)
        : [...current, type.id],
    );
  };

  return (
    <div>
      <label className="text-xs font-semibold text-[var(--ink)]/60 uppercase tracking-wide">Interview type</label>

      {loading && (
        <div className="flex items-center gap-2 mt-2 text-sm text-[var(--ink)]/50">
          <Loader2 size={15} className="animate-spin" /> Loading types…
        </div>
      )}
      {error && !loading && <p className="text-[13px] text-[#E24468] mt-2">{error}</p>}

      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
          {items.map((t) => (
            <button
              key={t.id}
              onClick={() => handleClick(t)}
              aria-pressed={isSelected(t.id)}
              className={`p-3 rounded-xl border text-left transition-colors ${
                isSelected(t.id) ? "border-[#6D5EF8] bg-[#6D5EF8]/5" : "border-[var(--ink)]/10"
              } ${!t.live && "opacity-50"}`}
            >
              {t.icon && <t.icon size={15} className="text-[#4C3FE0]" />}
              <p className="text-xs font-semibold mt-1.5 text-[var(--ink)]">{t.label}</p>
            </button>
          ))}
        </div>
      )}
      {notice && <p className="text-xs text-[var(--ink)]/55 mt-2">{notice}</p>}
    </div>
  );
}
