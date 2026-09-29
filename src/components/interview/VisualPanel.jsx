import { useMemo } from "react";
import { Eye, Sparkles, X } from "lucide-react";
import { buildVisualDocument } from "../../lib/visualDocument";

// The AI interviewer's visual explanations, shown while its voice explains.
// Usually one; the AI can keep several on screen when they're useful
// together — they stack, and the area scrolls past ~half the screen so
// visuals can never push the interview UI away.
//
// Each visual is rendered ONLY inside a sandboxed iframe — never in this
// app's DOM: `sandbox="allow-scripts"` without allow-same-origin gives it an
// opaque origin (no access to this page, cookies, storage or tokens; no
// navigation, popups or forms), and the document's own CSP blocks all
// network access (see lib/visualDocument.js). An iframe is keyed by id +
// version, so an update or removal tears down that visual's old scripts.
// Renders nothing when there are no visuals, so it takes no space.

function VisualCard({ visual, compact, onHide }) {
  const srcDoc = useMemo(() => buildVisualDocument(visual), [visual]);
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden shrink-0">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10">
        <Sparkles size={14} className="text-[#FF7A00] shrink-0" />
        <p className="text-xs font-semibold text-white/80 truncate">{visual.title}</p>
        <button
          onClick={() => onHide(visual)}
          className="ml-auto p-1 rounded-md text-white/40 hover:text-white/80 hover:bg-white/10"
          aria-label={`Hide visual: ${visual.title}`}
          title="Hide on my screen"
        >
          <X size={14} />
        </button>
      </div>
      <iframe
        key={`${visual.id}:${visual.version}`}
        title={`Visual explanation: ${visual.title}`}
        srcDoc={srcDoc}
        sandbox="allow-scripts"
        referrerPolicy="no-referrer"
        allow=""
        className={`block w-full border-0 bg-[#12122a] ${compact ? "h-[200px]" : "h-[240px]"}`}
      />
    </div>
  );
}

export function VisualPanel({ visuals, hiddenCount, onHide, onShowHidden }) {
  if (!visuals.length && !hiddenCount) return null;

  return (
    <div className="mx-5 mt-4 flex flex-col gap-3 max-h-[45vh] overflow-y-auto overscroll-contain pr-1">
      {visuals.map((visual) => (
        <VisualCard key={visual.id} visual={visual} compact={visuals.length > 1} onHide={onHide} />
      ))}
      {hiddenCount ? (
        <button
          onClick={onShowHidden}
          className="self-start flex items-center gap-1.5 text-xs text-white/50 hover:text-white/80"
        >
          <Eye size={13} /> Show {hiddenCount} hidden visual{hiddenCount === 1 ? "" : "s"}
        </button>
      ) : null}
    </div>
  );
}
