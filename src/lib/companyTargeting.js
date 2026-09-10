// Pure client-side helpers over data the backend already returned. The
// company catalog now lives in the database and is fetched per wizard
// step (see hooks/useScheduleCatalog.js + services/companyService.js) —
// these functions just shape the in-hand list for rendering. Difficulty
// and salary are resolved by the backend, not here.

// Safety fallback if a difficulty ever comes back missing (shouldn't
// happen — every Position row has one).
export const DEFAULT_DIFFICULTY = "Medium";

// The companies shown as first-level cards on the Company step.
export function filterPopular(companies) {
  return (companies || []).filter((c) => c.popular);
}

// Everything not on the card grid, sorted A→Z — the "More companies" list.
export function listMore(companies) {
  return (companies || []).filter((c) => !c.popular).sort((a, b) => a.name.localeCompare(b.name));
}

// Name search across the WHOLE list (so "micro" finds Microsoft even
// though it's a popular card). Empty query -> the full "more" list.
export function searchCompanies(companies, query) {
  const q = (query || "").trim().toLowerCase();
  if (!q) return listMore(companies);
  return (companies || [])
    .filter((c) => c.name.toLowerCase().includes(q))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function findCompany(companies, companyId) {
  return (companies || []).find((c) => c.id === companyId) || null;
}

// "₹45–₹75 LPA" (or a fallback string when the backend sent no estimate).
export function formatSalaryRange(range) {
  if (!range) return "Estimate unavailable";
  return `₹${range.min}–₹${range.max} ${range.unit}`;
}
