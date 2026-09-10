import { useEffect, useRef, useState } from "react";
import { Building2, Check, ChevronDown, Loader2, Settings2 } from "lucide-react";
import { filterPopular, findCompany } from "../../../lib/companyTargeting";
import { StepHeading } from "./StepHeading";
import { MoreCompaniesPopover } from "./MoreCompaniesPopover";

// Step 2. Company list comes from the backend (GET /companies, fetched by
// the wizard and passed in as `companies`). Popular companies render as
// first-level cards, the rest sit behind a searchable "More companies"
// popover, and "Custom Settings" drops into the classic scheduler.
// Selecting from anywhere calls the same onSelect(id).
export function CompanyStep({ companies, loading, error, selectedId, onSelect, onCustom }) {
  const popular = filterPopular(companies);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef(null);

  const selectedCompany = findCompany(companies, selectedId);
  const selectedIsPopular = popular.some((c) => c.id === selectedId);
  const selectedViaMore = Boolean(selectedCompany) && !selectedIsPopular;

  // Close the popover on outside click or Escape.
  useEffect(() => {
    if (!moreOpen) return undefined;
    const onDocDown = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) setMoreOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setMoreOpen(false);
    };
    document.addEventListener("mousedown", onDocDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [moreOpen]);

  const pick = (id) => {
    onSelect(id);
    setMoreOpen(false);
  };

  return (
    <div>
      <StepHeading
        title="Do you want to target a specific company?"
        hint="Pick a company for a tailored difficulty and salary estimate — or choose Custom Settings to use the classic scheduler."
      />

      {loading && (
        <div className="flex items-center gap-2 py-8 text-sm text-[var(--ink)]/50">
          <Loader2 size={15} className="animate-spin" /> Loading companies…
        </div>
      )}

      {error && !loading && (
        <p className="py-4 text-[13px] text-[#E24468]">{error}</p>
      )}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {popular.map((c) => (
              <button
                key={c.id}
                onClick={() => pick(c.id)}
                aria-pressed={selectedId === c.id}
                className={`flex items-center gap-2 rounded-xl border p-3 text-left transition-colors ${
                  selectedId === c.id
                    ? "border-[#6D5EF8] bg-[#6D5EF8]/5"
                    : "border-[var(--ink)]/10 hover:border-[var(--ink)]/25"
                }`}
              >
                <Building2 size={15} className="shrink-0 text-[#4C3FE0]" />
                <span className="truncate text-xs font-semibold text-[var(--ink)]">{c.name}</span>
              </button>
            ))}
          </div>

          <div className="relative mt-2" ref={moreRef}>
            <button
              type="button"
              onClick={() => setMoreOpen((o) => !o)}
              aria-haspopup="listbox"
              aria-expanded={moreOpen}
              className={`flex w-full items-center gap-2 rounded-xl border p-3 text-left transition-colors ${
                selectedViaMore
                  ? "border-[#6D5EF8] bg-[#6D5EF8]/5"
                  : "border-[var(--ink)]/10 hover:border-[var(--ink)]/25"
              }`}
            >
              {selectedViaMore ? (
                <Check size={15} className="shrink-0 text-[#4C3FE0]" />
              ) : (
                <Building2 size={15} className="shrink-0 text-[var(--ink)]/50" />
              )}
              <span className="truncate text-xs font-semibold text-[var(--ink)]">
                {selectedViaMore ? selectedCompany.name : "More companies"}
              </span>
              <ChevronDown
                size={15}
                className={`ml-auto shrink-0 text-[var(--ink)]/40 transition-transform ${
                  moreOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {moreOpen && (
              <MoreCompaniesPopover
                companies={companies}
                selectedId={selectedId}
                onSelect={pick}
                onClose={() => setMoreOpen(false)}
              />
            )}
          </div>
        </>
      )}

      <button
        onClick={onCustom}
        className="mt-3 flex w-full items-center gap-2 rounded-xl border border-dashed border-[var(--ink)]/25 p-3 text-left transition-colors hover:border-[#6D5EF8]"
      >
        <Settings2 size={15} className="shrink-0 text-[var(--ink)]/60" />
        <span className="text-xs font-semibold text-[var(--ink)]">Custom Settings</span>
        <span className="hidden text-[11px] text-[var(--ink)]/45 sm:inline">
          — skip company targeting
        </span>
      </button>
    </div>
  );
}
