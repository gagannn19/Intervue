import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { subscribeToInterviewVisuals } from "../services/interviewVisualService";
import { EMPTY_VISUALS, applyVisualEvent, orderedVisuals } from "./visualState";

// The AI interviewer's visual explanations currently on screen during a
// live interview — any number, keyed by stable id (see visualState.js).
// The AI decides what's on screen; the backend streams lifecycle events
// (snapshot / create / update / remove). Subscribed only while `active`
// (the call is live); ending the call or leaving the page drops them.
//
// Closing a visual (X) only HIDES it on this screen: it doesn't tell the
// AI or change interview state, and nothing waits on it — new visuals
// appear regardless. Hidden ones can be shown again; one the AI updates
// comes back by itself, since the AI is pointing at it again.
export function useInterviewVisuals(interviewId, active) {
  const [byId, dispatch] = useReducer(applyVisualEvent, EMPTY_VISUALS);
  const [hidden, setHidden] = useState(() => new Map()); // visualId -> version hidden

  useEffect(() => {
    if (!active || !interviewId) {
      dispatch({ type: "reset" });
      return undefined;
    }
    const stop = subscribeToInterviewVisuals(interviewId, (event) => {
      if (event.type === "visual.remove") console.info(`[visual] remove ${event.visualId}`);
      else if (event.type === "visual.snapshot") console.info(`[visual] snapshot: ${event.visuals?.length ?? 0} on screen`);
      else console.info(`[visual] ${event.type.slice(7)} ${event.visual?.id} "${event.visual?.title}"`);
      dispatch(event);
    });
    return () => {
      stop();
      dispatch({ type: "reset" });
    };
  }, [interviewId, active]);

  const all = useMemo(() => orderedVisuals(byId), [byId]);
  const visible = useMemo(
    () => all.filter((v) => !hidden.has(v.id) || hidden.get(v.id) !== v.version),
    [all, hidden],
  );

  const hide = useCallback((visual) => {
    setHidden((prev) => new Map(prev).set(visual.id, visual.version));
  }, []);
  const showHidden = useCallback(() => setHidden(new Map()), []);

  return { visuals: visible, hiddenCount: all.length - visible.length, hide, showHidden };
}
