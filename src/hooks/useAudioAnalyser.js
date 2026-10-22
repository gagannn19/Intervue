import { useEffect, useRef } from "react";

// A Web Audio AnalyserNode on a live MediaStreamTrack (the interviewer's
// voice), for audio-reactive visuals — returned as a ref (`.current` is
// null until there's a track) that an animation loop reads each frame, so
// nothing re-renders. The track also plays through a normal <audio> element
// (useInterviewEngine) — Chrome only feeds a remote WebRTC track into Web
// Audio while it's also being played. The context may start suspended
// (autoplay policy); it's resumed now and on the next click/keypress.
export function useAudioAnalyser(track) {
  const analyserRef = useRef(null);

  useEffect(() => {
    if (!track || typeof window.AudioContext !== "function") return undefined;
    const ctx = new AudioContext();
    const source = ctx.createMediaStreamSource(new MediaStream([track]));
    const node = ctx.createAnalyser();
    node.fftSize = 256;
    node.smoothingTimeConstant = 0.72;
    source.connect(node); // analysis only — never connected to the speakers
    const resume = () => ctx.state === "suspended" && ctx.resume().catch(() => {});
    resume();
    window.addEventListener("pointerdown", resume);
    window.addEventListener("keydown", resume);
    analyserRef.current = node;
    return () => {
      window.removeEventListener("pointerdown", resume);
      window.removeEventListener("keydown", resume);
      analyserRef.current = null;
      source.disconnect();
      ctx.close().catch(() => {});
    };
  }, [track]);

  return analyserRef;
}
