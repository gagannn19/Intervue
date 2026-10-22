import { useEffect, useRef } from "react";

// The AI interviewer's presence: a dark "core" that reacts to its actual
// voice. A ring of jagged spikes follows the voice's frequency spectrum,
// the ember at its centre flares with loudness, and HUD arcs rotate around
// it — faster while thinking, dim and watchful while the candidate speaks.
// Drawn on a canvas in a requestAnimationFrame loop (no React re-render per
// frame). `analyserRef` is useAudioAnalyser's ref. With no analyser yet (or a silent one) it animates from
// `turnState` alone, so it's never dead.
const SPIKES = 72;

export function InterviewerOrb({ analyserRef, turnState, size = 96 }) {
  const canvasRef = useRef(null);
  const stateRef = useRef(turnState);
  useEffect(() => {
    stateRef.current = turnState;
  }, [turnState]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const g = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    g.scale(dpr, dpr);

    const bins = new Uint8Array(128); // fftSize 256 -> 128 bins
    const levels = new Float32Array(SPIKES);
    const cx = size / 2;
    const cy = size / 2;
    const core = size * 0.2;
    let energy = 0;
    let spin = 0;
    let raf = 0;
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    const frame = (t) => {
      const state = stateRef.current;
      const speaking = state === "ai_speaking";
      const thinking = state === "processing" || state === "waiting";
      const listening = state === "listening" || state === "user_speaking" || state === "user_finished";

      // Voice spectrum -> per-spike levels (0..1), voice band only.
      const analyser = analyserRef.current;
      let live = 0;
      if (analyser) {
        analyser.getByteFrequencyData(bins);
        for (let i = 0; i < bins.length; i++) live += bins[i];
        live /= bins.length * 255;
      }
      const usable = analyser && live > 0.01;
      for (let i = 0; i < SPIKES; i++) {
        // Mirror the spectrum around the ring so it reads symmetric.
        const k = i < SPIKES / 2 ? i : SPIKES - 1 - i;
        const bin = Math.min(bins.length - 1, 2 + Math.floor((k / (SPIKES / 2)) * bins.length * 0.55));
        const target = usable
          ? bins[bin] / 255
          : speaking
            ? 0.25 + 0.25 * Math.abs(Math.sin(t / 140 + i * 0.9)) * Math.abs(Math.sin(t / 310 + i * 0.37))
            : 0;
        levels[i] += (target - levels[i]) * (target > levels[i] ? 0.55 : 0.12);
      }
      const targetEnergy = usable ? Math.min(1, live * 3.2) : speaking ? 0.45 + 0.2 * Math.sin(t / 180) : 0;
      energy += (targetEnergy - energy) * 0.18;
      spin += reduceMotion ? 0 : thinking ? 0.045 : speaking ? 0.012 + energy * 0.03 : 0.004;
      const breathe = 0.5 + 0.5 * Math.sin(t / 900);

      g.clearRect(0, 0, size, size);
      g.save();
      g.translate(cx, cy);

      // Outer glow — fades out before the canvas edge, so it never clips.
      const glowR = size / 2;
      const glow = g.createRadialGradient(0, 0, core * 0.5, 0, 0, glowR);
      glow.addColorStop(0, `rgba(255, 70, 20, ${0.18 + energy * 0.45})`);
      glow.addColorStop(0.55 + energy * 0.25, `rgba(255, 40, 0, ${0.04 + energy * 0.12})`);
      glow.addColorStop(1, "rgba(255, 40, 0, 0)");
      g.fillStyle = glow;
      g.beginPath();
      g.arc(0, 0, glowR, 0, Math.PI * 2);
      g.fill();

      // Spikes: the voice.
      if (energy > 0.01 || speaking) {
        g.lineCap = "round";
        for (let i = 0; i < SPIKES; i++) {
          const a = (i / SPIKES) * Math.PI * 2 + spin * 0.35;
          // Longest spike stops just inside the HUD ring.
          const len = 2 + levels[i] * size * 0.17;
          const r0 = core * 1.32;
          const hot = levels[i];
          g.strokeStyle = `rgba(255, ${Math.round(150 - hot * 120)}, ${Math.round(30 - hot * 20)}, ${0.35 + hot * 0.65})`;
          g.lineWidth = 1.6;
          g.beginPath();
          g.moveTo(Math.cos(a) * r0, Math.sin(a) * r0);
          g.lineTo(Math.cos(a) * (r0 + len), Math.sin(a) * (r0 + len));
          g.stroke();
        }
      }

      // HUD arcs.
      const hudR = size * 0.46;
      g.lineWidth = 1.2;
      for (let s = 0; s < 3; s++) {
        const start = spin * (s % 2 ? -1 : 1) + (s * Math.PI * 2) / 3;
        g.strokeStyle = listening ? "rgba(255, 60, 40, 0.35)" : `rgba(255, 122, 0, ${0.35 + energy * 0.4})`;
        g.beginPath();
        g.arc(0, 0, hudR, start, start + Math.PI * 0.42);
        g.stroke();
      }
      g.strokeStyle = "rgba(255,255,255,0.06)";
      g.beginPath();
      g.arc(0, 0, hudR - 4, 0, Math.PI * 2);
      g.stroke();

      // Core: a dark sphere...
      const sphere = g.createRadialGradient(-core * 0.35, -core * 0.4, core * 0.1, 0, 0, core * 1.15);
      sphere.addColorStop(0, "#2a1810");
      sphere.addColorStop(1, "#050505");
      g.fillStyle = sphere;
      g.beginPath();
      g.arc(0, 0, core * 1.12, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = `rgba(255, 90, 30, ${0.4 + energy * 0.5})`;
      g.lineWidth = 1.5;
      g.stroke();

      // ...with an ember at its centre that flares with the voice.
      const emberR = core * (listening ? 0.32 + breathe * 0.06 : 0.38 + energy * 0.5);
      const ember = g.createRadialGradient(0, 0, 0, 0, 0, emberR);
      ember.addColorStop(0, listening ? "rgba(255,120,90,0.9)" : "rgba(255,230,190,1)");
      ember.addColorStop(0.35, listening ? "rgba(220,40,30,0.7)" : "rgba(255,120,20,0.95)");
      ember.addColorStop(1, "rgba(200,20,0,0)");
      g.fillStyle = ember;
      g.beginPath();
      g.arc(0, 0, emberR, 0, Math.PI * 2);
      g.fill();

      g.restore();
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [analyserRef, size]);

  return <canvas ref={canvasRef} style={{ width: size, height: size }} aria-hidden="true" />;
}
