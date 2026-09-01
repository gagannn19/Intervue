import { useEffect, useRef, useState } from "react";

// Cycles through a list of strings with a fade transition. Pauses while the
// user hovers, and never auto-cycles if the OS asked for reduced motion.
// Returns everything a presentational component needs to render the effect.
export function useRotatingText(variants, intervalMs = 5200) {
  const [index, setIndex] = useState(0);
  const [fading, setFading] = useState(false);
  const pausedRef = useRef(false);
  const reducedRef = useRef(false);

  useEffect(() => {
    reducedRef.current = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
  }, []);

  useEffect(() => {
    if (reducedRef.current) return; // static text for users who asked for less motion
    const id = setInterval(() => {
      if (pausedRef.current) return;
      setFading(true);
      setTimeout(() => {
        setIndex((i) => (i + 1) % variants.length);
        setFading(false);
      }, 300);
    }, intervalMs);
    return () => clearInterval(id);
  }, [variants.length, intervalMs]);

  return {
    text: variants[index],
    fading,
    onMouseEnter: () => { pausedRef.current = true; },
    onMouseLeave: () => { pausedRef.current = false; },
  };
}
