import { apiRequest } from "../lib/apiClient";

// ---------------------------------------------------------------------------
// Company-targeting catalog — served by the backend (companies / positions
// tables). The schedule wizard calls one of these per step instead of
// bundling a static array.
//
// Positions and single-position lookups are cached in-memory for the
// lifetime of the page: the Position, Difficulty, Salary and Review steps
// all read the same level, so this keeps it to one network call without
// each step needing to share state.
// ---------------------------------------------------------------------------

const positionsCache = new Map(); // companySlug -> { company, positions }
const positionCache = new Map(); // `${companySlug}/${positionSlug}` -> position dto

// Step 1 — the full company list ({ id, name, popular }). Not cached: it's
// the wizard's entry point and cheap to refetch if the user comes back.
export async function getCompanies() {
  return apiRequest("/companies");
}

// Step 2 — one company's position ladder.
export async function getCompanyPositions(companySlug) {
  if (!companySlug) return null;
  if (positionsCache.has(companySlug)) return positionsCache.get(companySlug);
  const data = await apiRequest(`/companies/${encodeURIComponent(companySlug)}/positions`);
  positionsCache.set(companySlug, data);
  return data;
}

// Steps 3–5 — one level's derived difficulty + salary.
export async function getCompanyPosition(companySlug, positionSlug) {
  if (!companySlug || !positionSlug) return null;
  const key = `${companySlug}/${positionSlug}`;
  if (positionCache.has(key)) return positionCache.get(key);
  const data = await apiRequest(
    `/companies/${encodeURIComponent(companySlug)}/positions/${encodeURIComponent(positionSlug)}`,
  );
  positionCache.set(key, data);
  return data;
}
