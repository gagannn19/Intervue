// Design tokens shared across the whole app.
// Colors are threaded via CSS custom properties (--ink / --bg / --surface /
// --accent / --accent-soft) set on the page-root wrappers (LandingPage,
// AppShell, LoginPage, SignupPage) — everything nested just references
// var(--ink) etc. and inherits the right value for the current theme.
//
// Brand: Cuecast. Caveat (handwritten) for headings/brand voice, Inter for
// everything else. JetBrains Mono stays for actual code (CodingPanel,
// timers) — that's a functional monospace need, not a brand typeface.

export const FONT_LINK =
  "https://fonts.googleapis.com/css2?family=Caveat:wght@500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap";

export const disp = { fontFamily: "'Caveat', cursive" };
export const mono = { fontFamily: "'JetBrains Mono', monospace" };

// The single accent color the whole design system hangs off — see
// DesignSystem.png's "04. Color palette". Exported for the rare spot that
// needs the raw value (e.g. an SVG stroke) rather than the CSS var.
export const ACCENT = "#FF7A00";

export function themeVars(dark) {
  return dark
    ? {
        "--ink": "#F5F1EA",
        "--bg": "#15130F",
        "--surface": "#1E1B16",
        "--accent": "#FF7A00",
        "--accent-soft": "#3A2413",
        "--accent-ink": "#FFB066",
      }
    : {
        "--ink": "#111111",
        "--bg": "#FCFAF7",
        "--surface": "#FFFFFF",
        "--accent": "#FF7A00",
        "--accent-soft": "#FFE3C7",
        "--accent-ink": "#CC5500",
      };
}
