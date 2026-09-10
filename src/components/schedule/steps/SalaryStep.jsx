import { Info, Loader2 } from "lucide-react";
import { formatSalaryRange } from "../../../lib/companyTargeting";
import { disp } from "../../../constants/theme";
import { useCompanyPosition } from "../../../hooks/useScheduleCatalog";
import { StepHeading } from "./StepHeading";

// Step 5. Its own API call: GET /companies/:slug/positions/:posSlug
// (cached — shared with the Difficulty / Review steps). Informational
// only: an estimated reference range for the selected company + level,
// never presented as a guaranteed figure.
export function SalaryStep({ companySlug, positionSlug, companyName }) {
  const { position, loading, error } = useCompanyPosition(companySlug, positionSlug);
  const range = position?.salary || null;

  return (
    <div>
      <StepHeading
        title="Expected salary range for this position"
        hint={`${companyName}${position?.label ? ` · ${position.label}` : ""}`}
      />

      <div className="rounded-xl border border-[var(--ink)]/10 bg-[var(--ink)]/[0.02] p-4">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-[var(--ink)]/50">
            <Loader2 size={15} className="animate-spin" /> Loading estimate…
          </div>
        ) : error ? (
          <p className="text-[13px] text-[#E24468]">{error}</p>
        ) : range ? (
          <>
            <p className="text-xl font-bold text-[var(--ink)]" style={disp}>
              {formatSalaryRange(range)}
            </p>
            <div className="grid grid-cols-2 gap-3 mt-3 text-xs">
              <div>
                <p className="text-[var(--ink)]/45">Minimum</p>
                <p className="font-semibold text-[var(--ink)]">₹{range.min} {range.unit}</p>
              </div>
              <div>
                <p className="text-[var(--ink)]/45">Maximum</p>
                <p className="font-semibold text-[var(--ink)]">₹{range.max} {range.unit}</p>
              </div>
            </div>
          </>
        ) : (
          <p className="text-sm text-[var(--ink)]/55">
            No salary estimate is available for this level yet.
          </p>
        )}
      </div>

      <p className="text-[11px] text-[var(--ink)]/45 mt-2 flex items-start gap-1.5">
        <Info size={12} className="mt-0.5 shrink-0" />
        Estimated reference range only (approx. total compensation, India, LPA) — not an offer or a guarantee.
      </p>
    </div>
  );
}
