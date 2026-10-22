import { useMemo } from "react";
import { Sparkles } from "lucide-react";
import { buildVisualDocument } from "../../lib/visualDocument";

// The interviewer's current slide, filling the room's main column (the call
// status shrinks to one line below it — see CallPanel's `compact`). The
// slide changes as the interviewer's voice moves on (useInterviewVisuals).
//
// A slide is rendered ONLY inside a sandboxed iframe — never in this app's
// DOM: `sandbox="allow-scripts"` without allow-same-origin gives it an
// opaque origin (no access to this page, cookies, storage or tokens; no
// navigation, popups or forms), and the document's own CSP blocks all
// network access (see lib/visualDocument.js). The iframe is keyed by id +
// version, so changing slide tears down the old one's scripts. Renders
// nothing when there's no slide, so it takes no space.
export function VisualPanel({ slide }) {
  const srcDoc = useMemo(() => (slide ? buildVisualDocument(slide) : ""), [slide]);
  if (!slide) return null;

  return (
    <div className="flex-1 min-h-0 mx-5 mt-4 flex flex-col rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden">
      <div className="shrink-0 flex items-center gap-2 px-3 py-2 border-b border-white/10">
        <Sparkles size={14} className="text-[#FF7A00] shrink-0" />
        <p className="text-xs font-semibold text-white/80 truncate">{slide.title}</p>
      </div>
      <iframe
        key={`${slide.id}:${slide.version}`}
        title={`Slide: ${slide.title}`}
        srcDoc={srcDoc}
        sandbox="allow-scripts"
        referrerPolicy="no-referrer"
        allow=""
        className="block flex-1 w-full min-h-0 border-0 bg-[#12122a] animate-[slide-in_.35s_ease-out]"
      />
    </div>
  );
}
