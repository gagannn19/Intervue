// ---------------------------------------------------------------------------
// Builds the standalone HTML document for one AI-generated visual
// explanation. It is ONLY ever loaded into a sandboxed iframe (see
// components/interview/VisualPanel.jsx) — never into this app's own DOM.
//
// Layers of containment:
//  - the iframe's sandbox (scripts allowed, but an opaque origin: no
//    cookies, storage, parent DOM, navigation, popups, forms or modals);
//  - this document's Content-Security-Policy: no network at all (fetch,
//    XHR, WebSocket, images, fonts, frames) — only its own inline code;
//  - a timer guard: after VISUAL_JS_LIFETIME_MS every timer/animation
//    frame the visual's JS started is cancelled and new ones do nothing.
// The frontend owns the look (dark panel, font, spacing, color variables);
// the generated code only supplies content and animation.
// ---------------------------------------------------------------------------

const VISUAL_JS_LIFETIME_MS = 60_000;

const CSP = [
  "default-src 'none'",
  "style-src 'unsafe-inline'",
  "script-src 'unsafe-inline'",
  "img-src data:",
  "font-src 'none'",
  "connect-src 'none'",
  "media-src 'none'",
  "frame-src 'none'",
  "form-action 'none'",
  "base-uri 'none'",
].join("; ");

const BASE_CSS = `
:root {
  --bg: #12122a; --panel: #1d1d3d; --border: rgba(255,255,255,0.14);
  --fg: #f1f1fb; --muted: rgba(241,241,251,0.55);
  --accent: #ff7a00; --accent-2: #2dd4bf; --panel-2: #26264d;
}
* { box-sizing: border-box; }
html { color-scheme: dark; }
html, body { margin: 0; background: var(--bg); color: var(--fg);
  font: 14px/1.45 Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif; }
/* A visual taller or wider than the frame scrolls instead of being cut off.
   margin: auto (not align/justify-content: center) centers a small visual
   but pins an oversized one to the top-left, so none of it ends up above or
   left of the scrollable area. */
body { min-height: 100vh; display: flex; padding: 14px; }
/* Own stacking context + positioning origin: a negative z-index or an
   absolutely positioned piece stays inside the visual, above the background. */
#visual-root { position: relative; isolation: isolate; margin: auto; max-width: 100%; }
/* --- Diagram kit: ready-made pieces the AI composes (see the backend prompt).
   Gives every visual the same polished look with less generated code. --- */
body { background: radial-gradient(120% 90% at 50% 0%, #1a1a3a 0%, var(--bg) 70%); }
.v-title { font-size: 11px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: var(--muted); text-align: center; margin: 0 0 12px; }
.v-caption { font-size: 12px; color: var(--muted); text-align: center; margin-top: 10px; }
.v-row { display: flex; align-items: center; justify-content: center; gap: 10px; flex-wrap: wrap; }
.v-col { display: flex; flex-direction: column; align-items: center; gap: 8px; }
.v-node { padding: 8px 14px; border-radius: 10px; text-align: center; font-weight: 500; font-size: 13px;
  background: linear-gradient(180deg, var(--panel-2), var(--panel)); border: 1px solid var(--border);
  box-shadow: 0 1px 0 rgba(255,255,255,.06) inset, 0 6px 16px rgba(0,0,0,.35); }
.v-node small { display: block; font-size: 11px; font-weight: 400; color: var(--muted); margin-top: 2px; }
.v-node.is-accent { border-color: var(--accent); box-shadow: 0 0 0 1px var(--accent) inset, 0 0 18px rgba(255,122,0,.25); }
.v-node.is-accent-2 { border-color: var(--accent-2); box-shadow: 0 0 0 1px var(--accent-2) inset, 0 0 18px rgba(45,212,191,.22); }
.v-arrow { position: relative; flex: none; width: 44px; height: 2px; background: var(--muted); }
.v-arrow[data-label] { width: 96px; margin-top: 14px; }
.v-arrow::after { content: ""; position: absolute; right: -1px; top: -4px; border: 5px solid transparent; border-left: 7px solid var(--muted); border-right: 0; }
.v-arrow.down, .v-arrow.down[data-label] { width: 2px; height: 26px; margin: 0; }
.v-arrow.down::after { right: -4px; top: auto; bottom: -1px; border: 5px solid transparent; border-top: 7px solid var(--muted); border-bottom: 0; }
.v-arrow[data-label]::before { content: attr(data-label); position: absolute; bottom: 6px; left: 50%; transform: translateX(-50%);
  font-size: 10px; color: var(--muted); white-space: nowrap; }
.v-arrow.down[data-label]::before { bottom: auto; top: 50%; left: 10px; transform: translateY(-50%); }
.v-badge { display: inline-grid; place-items: center; width: 20px; height: 20px; border-radius: 50%; flex: none;
  background: var(--accent); color: #1b0f00; font-size: 11px; font-weight: 700; }
.v-step { display: flex; align-items: center; gap: 10px; font-size: 13px; }
.v-cells { display: flex; gap: 4px; justify-content: center; padding-bottom: 16px; }
.v-cell { position: relative; min-width: 38px; height: 38px; padding: 0 6px; display: grid; place-items: center; border-radius: 8px;
  font: 600 14px/1 ui-monospace, SFMono-Regular, Menlo, monospace; background: var(--panel); border: 1px solid var(--border); }
.v-cell[data-i]::after { content: attr(data-i); position: absolute; bottom: -16px; font-size: 10px; font-weight: 400; color: var(--muted); }
.v-cell.is-active { border-color: var(--accent); background: rgba(255,122,0,.14); }
.v-cell.is-done { border-color: var(--accent-2); background: rgba(45,212,191,.12); }
.v-mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
/* Reveal pieces one after another, in walkthrough order: style="--i: 0", "--i: 1", ... */
.v-seq { display: flex; flex-direction: column; align-items: center; gap: 12px; }
.v-seq .v-caption { margin-top: -6px; }
.v-seq > * { animation: v-in .45s ease-out both; animation-delay: calc(var(--i, 0) * 900ms); }
@keyframes v-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) { .v-seq > * { animation: none; } }
`;

// Stops the visual's JS work after a while: tracks every timer and
// animation frame it starts, then cancels them all and disables new ones.
const TIMER_GUARD = `(() => {
  const ids = { t: new Set(), i: new Set(), r: new Set() };
  const st = setTimeout, si = setInterval, raf = requestAnimationFrame;
  const ct = clearTimeout, ci = clearInterval, craf = cancelAnimationFrame;
  let stopped = false;
  window.setTimeout = (f, ms, ...a) => { if (stopped) return 0; const id = st(f, ms, ...a); ids.t.add(id); return id; };
  window.setInterval = (f, ms, ...a) => { if (stopped) return 0; const id = si(f, Math.max(ms || 0, 16), ...a); ids.i.add(id); return id; };
  window.requestAnimationFrame = (f) => { if (stopped) return 0; const id = raf(f); ids.r.add(id); return id; };
  st(() => { stopped = true; ids.t.forEach(ct); ids.i.forEach(ci); ids.r.forEach(craf); }, ${VISUAL_JS_LIFETIME_MS});
})();`;

// Never let generated text close the <style>/<script> it's placed in.
const noClose = (text, tag) => String(text || "").replace(new RegExp(`</?${tag}`, "gi"), "");

export function buildVisualDocument({ html, css, js }) {
  const script = js
    ? `<script>${TIMER_GUARD}</script><script>try {\n${noClose(js, "script")}\n} catch (e) { /* a broken visual stays static */ }</script>`
    : "";
  return `<!doctype html><html><head><meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="${CSP}">
<style>${BASE_CSS}</style>
<style>${noClose(css, "style")}</style>
</head><body><div id="visual-root">${noClose(html, "script")}</div>${script}</body></html>`;
}
