import { useEffect, useMemo, useRef, useState } from "react";
import { Building2, Check, Search } from "lucide-react";
import { searchCompanies } from "../../../lib/companyTargeting";

// The dropdown/popover opened by "More companies" on Step 2. Client-side
// name search over the fetched company list (passed in as `companies`), a
// scrollable themed list, an empty state, and basic keyboard nav (↑/↓ to
// move, Enter to pick, Esc to close). Open/close + outside-click are
// owned by the parent CompanyStep.
export function MoreCompaniesPopover({ companies, selectedId, onSelect, onClose }) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);
  const itemRefs = useRef([]);

  const results = useMemo(() => searchCompanies(companies, query), [companies, query]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    itemRefs.current[activeIndex]?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const onSearchChange = (e) => {
    setQuery(e.target.value);
    setActiveIndex(0); // keep the keyboard highlight on the first result
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const company = results[activeIndex];
      if (company) onSelect(company.id);
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-label="More companies"
      className="absolute left-0 right-0 z-20 mt-2 rounded-xl border border-[var(--ink)]/12 bg-[var(--surface)] p-2 shadow-[0_12px_32px_-8px_rgba(18,18,43,0.28)]"
    >
      <div className="relative">
        <Search
          size={14}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--ink)]/40"
        />
        <input
          ref={inputRef}
          value={query}
          onChange={onSearchChange}
          onKeyDown={onKeyDown}
          placeholder="Search companies…"
          aria-label="Search companies"
          className="w-full rounded-lg border border-[var(--ink)]/12 bg-[var(--bg)] text-[var(--ink)] pl-8 pr-3 py-2 text-sm outline-none focus:border-[#6D5EF8]"
        />
      </div>

      {results.length === 0 ? (
        <p className="px-2 py-6 text-center text-xs text-[var(--ink)]/50">No companies found.</p>
      ) : (
        <ul
          role="listbox"
          aria-label="Companies"
          className="mt-2 grid max-h-56 grid-cols-1 gap-1 overflow-y-auto sm:grid-cols-2"
        >
          {results.map((c, i) => {
            const isSelected = c.id === selectedId;
            const isActive = i === activeIndex;
            return (
              <li key={c.id}>
                <button
                  ref={(el) => {
                    itemRefs.current[i] = el;
                  }}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setActiveIndex(i)}
                  onClick={() => onSelect(c.id)}
                  className={`flex w-full items-center gap-2 rounded-lg border p-2.5 text-left transition-colors ${
                    isSelected
                      ? "border-[#6D5EF8] bg-[#6D5EF8]/5"
                      : isActive
                        ? "border-[var(--ink)]/25 bg-[var(--ink)]/[0.04]"
                        : "border-transparent hover:border-[var(--ink)]/15"
                  }`}
                >
                  {isSelected ? (
                    <Check size={14} className="shrink-0 text-[#4C3FE0]" />
                  ) : (
                    <Building2 size={14} className="shrink-0 text-[var(--ink)]/45" />
                  )}
                  <span className="truncate text-xs font-semibold text-[var(--ink)]">{c.name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
