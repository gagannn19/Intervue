import { lazy, Suspense, useMemo } from "react";
import { Loader2, Check, CloudOff } from "lucide-react";
import "@excalidraw/excalidraw/index.css";

// Excalidraw is big — only loaded once a system design interview opens
// the whiteboard.
const Excalidraw = lazy(() => import("@excalidraw/excalidraw").then((m) => ({ default: m.Excalidraw })));

const SAVE_LABEL = {
  saved: { icon: Check, text: "Saved — the interviewer can see it" },
  pending: { icon: Loader2, text: "Saving…", spin: true },
  saving: { icon: Loader2, text: "Saving…", spin: true },
  error: { icon: CloudOff, text: "Couldn't save — retrying on your next change" },
};

function Loading() {
  return (
    <div className="flex-1 flex items-center justify-center gap-2 text-sm text-white/50">
      <Loader2 size={16} className="animate-spin" /> Loading whiteboard…
    </div>
  );
}

// The candidate's whiteboard for a system design interview. What's drawn
// here is autosaved (useWhiteboard) and read by the AI interviewer as a
// text description of the boxes, arrows and labels.
export function WhiteboardPanel({ whiteboard }) {
  // Mount-time scene: whatever is latest in memory, so closing and
  // reopening the tab keeps the drawing. No custom background: the dark
  // theme inverts the default white canvas to dark (a dark colour set
  // here would be inverted to light grey).
  const initialData = useMemo(
    () => (whiteboard.status === "ready"
      ? { elements: whiteboard.getElements(), scrollToContent: true }
      : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [whiteboard.status],
  );
  const save = SAVE_LABEL[whiteboard.saveState] ?? SAVE_LABEL.saved;

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="px-4 py-2 flex items-center justify-between gap-3 border-b border-white/10 text-xs">
        <p className="text-white/60">
          <span className="font-semibold text-white/85">Whiteboard</span> · label your boxes and arrows so the interviewer can follow your design
        </p>
        <span className={`flex items-center gap-1.5 shrink-0 ${whiteboard.saveState === "error" ? "text-[#FF8A9E]" : "text-white/40"}`}>
          <save.icon size={12} className={save.spin ? "animate-spin" : ""} /> {save.text}
        </span>
      </div>
      <div className="flex-1 min-h-[420px] relative">
        {initialData ? (
          <Suspense fallback={<Loading />}>
            <div className="absolute inset-0">
              <Excalidraw
                theme="dark"
                initialData={initialData}
                onChange={(elements) => whiteboard.onChange(elements)}
                UIOptions={{
                  canvasActions: { loadScene: false, saveToActiveFile: false, export: false, saveAsImage: false },
                  tools: { image: false },
                }}
              />
            </div>
          </Suspense>
        ) : (
          <Loading />
        )}
      </div>
    </div>
  );
}
