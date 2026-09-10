import { Loader2 } from "lucide-react";
import { useCompanyPositions } from "../../../hooks/useScheduleCatalog";
import { StepHeading } from "./StepHeading";

// Step 3. Its own API call: GET /companies/:slug/positions. Levels are a
// company's own ladder when it has one (Google → L3–L7, Amazon → SDE I–
// Principal), otherwise a generic fallback ladder seeded in the backend.
export function PositionStep({ companySlug, selectedId, onSelect }) {
  const { company, positions, loading, error } = useCompanyPositions(companySlug);

  if (!companySlug) return null;

  return (
    <div>
      <StepHeading
        title="What position are you targeting?"
        hint={
          company ? `Choose the level you're targeting at ${company.name}.` : "Choose a level."
        }
      />

      {loading && (
        <div className="flex items-center gap-2 py-8 text-sm text-[var(--ink)]/50">
          <Loader2 size={15} className="animate-spin" /> Loading levels…
        </div>
      )}

      {error && !loading && <p className="py-4 text-[13px] text-[#E24468]">{error}</p>}

      {!loading && !error && (
        <div className="grid gap-2">
          {positions.map((p) => (
            <button
              key={p.id}
              onClick={() => onSelect(p.id)}
              aria-pressed={selectedId === p.id}
              className={`p-3 rounded-xl border text-left text-sm font-semibold transition-colors ${
                selectedId === p.id
                  ? "border-[#6D5EF8] bg-[#6D5EF8]/5 text-[#4C3FE0]"
                  : "border-[var(--ink)]/10 text-[var(--ink)]/70 hover:border-[var(--ink)]/25"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
