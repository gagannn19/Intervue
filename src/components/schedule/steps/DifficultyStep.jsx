import { Loader2, Sparkles } from "lucide-react";
import { Badge } from "../../ui/Badge";
import { diffTone } from "../../../utils/difficulty";
import { useCompanyPosition } from "../../../hooks/useScheduleCatalog";
import { StepHeading } from "./StepHeading";

// Step 4. Its own API call: GET /companies/:slug/positions/:posSlug. The
// user doesn't pick — difficulty is resolved by the backend from the
// chosen company + level (cached, so this shares one request with the
// Salary / Review steps).
export function DifficultyStep({ companySlug, positionSlug, companyName }) {
  const { position, loading, error } = useCompanyPosition(companySlug, positionSlug);
  const difficulty = position?.difficulty;

  return (
    <div>
      <StepHeading
        title="Difficulty — selected automatically"
        hint={
          position
            ? `Set from your target: ${companyName} · ${position.label}. Nothing to choose here.`
            : `Set from your target at ${companyName}. Nothing to choose here.`
        }
      />

      <div className="rounded-xl border border-[var(--ink)]/10 bg-[var(--ink)]/[0.02] p-4 flex items-center gap-3">
        <Sparkles size={16} className="text-[#4C3FE0] shrink-0" />
        <span className="text-sm text-[var(--ink)]/70">Interview difficulty</span>
        <span className="ml-auto">
          {loading ? (
            <Loader2 size={15} className="animate-spin text-[var(--ink)]/40" />
          ) : error ? (
            <span className="text-[13px] text-[#E24468]">{error}</span>
          ) : (
            <Badge tone={diffTone(difficulty)}>{difficulty}</Badge>
          )}
        </span>
      </div>

      <p className="text-[11px] text-[var(--ink)]/45 mt-2">
        Based on a reference mapping of company level → difficulty, stored in the backend catalog.
      </p>
    </div>
  );
}
