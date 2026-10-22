import { useEffect, useReducer, useState } from "react";
import { subscribeToInterviewVisuals } from "../services/interviewVisualService";
import { EMPTY_VISUALS, applyVisualEvent, pickSlide } from "./visualState";

// The interviewer's slides during a live interview. The backend streams
// each slide's visual as soon as its code is ready (snapshot / create /
// remove events, keyed by stable id — see visualState.js); the bot says
// which one the voice is on (`currentSlideId`, from useInterviewEngine).
// Returns the ONE slide to show. Subscribed only while `active` (the call
// is live); ending the call or leaving the page drops them.
export function useInterviewVisuals(interviewId, active, currentSlideId) {
  const [byId, dispatch] = useReducer(applyVisualEvent, EMPTY_VISUALS);
  const [showingId, setShowingId] = useState(null);

  useEffect(() => {
    if (!active || !interviewId) {
      dispatch({ type: "reset" });
      return undefined;
    }
    const stop = subscribeToInterviewVisuals(interviewId, (event) => {
      if (event.type === "visual.remove") console.info(`[slide] remove ${event.visualId}`);
      else if (event.type === "visual.snapshot") console.info(`[slide] snapshot: ${event.visuals?.length ?? 0} slide(s)`);
      else console.info(`[slide] ${event.type.slice(7)} ${event.visual?.id} "${event.visual?.title}"`);
      dispatch(event);
    });
    return () => {
      stop();
      dispatch({ type: "reset" });
    };
  }, [interviewId, active]);

  const slide = pickSlide(byId, currentSlideId, showingId);
  // Remember what's showing, for when the voice moves to a slide whose code
  // hasn't arrived yet (React's "store information from previous renders").
  if ((slide?.id ?? null) !== showingId) setShowingId(slide?.id ?? null);

  return { slide };
}
