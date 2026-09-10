import { useEffect, useRef, useState } from "react";
import { getInterviewTypes } from "../services/interviewTypeService";
import {
  getCompanies,
  getCompanyPositions,
  getCompanyPosition,
} from "../services/companyService";

// ---------------------------------------------------------------------------
// One small hook per schedule-wizard step. Each fetches its own slice of
// the catalog from the backend when the step's inputs are ready, and
// exposes { data, loading, error }. companyService caches positions /
// single-position lookups, so the Difficulty / Salary / Review steps
// calling useCompanyPosition() again cost no extra network.
// ---------------------------------------------------------------------------

// Runs `fetcher` whenever `key` changes (and on mount when enabled). `key`
// is a primitive so the effect's dependency list stays static. A ref
// guards against a slow response landing after a newer request.
function useCatalogResource(fetcher, key, enabled) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);
  const requestId = useRef(0);

  useEffect(() => {
    if (!enabled) {
      setData(null);
      setLoading(false);
      setError(null);
      return undefined;
    }
    const id = ++requestId.current;
    setLoading(true);
    setError(null);
    fetcher()
      .then((result) => {
        if (id === requestId.current) {
          setData(result);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (id === requestId.current) {
          setError(err.message || "Couldn't load that. Try again.");
          setLoading(false);
        }
      });
    return undefined;
  }, [key, enabled]); // fetcher is derived from key; intentionally not a dep

  return { data, loading, error };
}

// Step 0 — interview types.
export function useInterviewTypes() {
  const { data, loading, error } = useCatalogResource(getInterviewTypes, "interview-types", true);
  return { types: data || [], loading, error };
}

// Step 1 — company list.
export function useCompanies() {
  const { data, loading, error } = useCatalogResource(getCompanies, "companies", true);
  return { companies: data || [], loading, error };
}

// Step 2 — one company's position ladder.
export function useCompanyPositions(companySlug) {
  const { data, loading, error } = useCatalogResource(
    () => getCompanyPositions(companySlug),
    `positions:${companySlug || ""}`,
    Boolean(companySlug),
  );
  return {
    company: data?.company || null,
    positions: data?.positions || [],
    loading,
    error,
  };
}

// Steps 3–5 — one level's derived difficulty + salary.
export function useCompanyPosition(companySlug, positionSlug) {
  const { data, loading, error } = useCatalogResource(
    () => getCompanyPosition(companySlug, positionSlug),
    `position:${companySlug || ""}:${positionSlug || ""}`,
    Boolean(companySlug && positionSlug),
  );
  return { position: data, loading, error };
}
