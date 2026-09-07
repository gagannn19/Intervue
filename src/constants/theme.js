// Design tokens shared across the whole app.
// Colors are threaded via CSS custom properties (--ink / --bg / --surface)
// set on the two page-root wrappers (LandingPage, AppShell) — everything
// nested just references var(--ink) etc. and inherits the right value.

export const FONT_LINK =
  "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap";

export const disp = { fontFamily: "'Space Grotesk', sans-serif" };
export const mono = { fontFamily: "'JetBrains Mono', monospace" };

export function themeVars(dark) {
  return dark
    ? { "--ink": "#F5F5FA", "--bg": "#0B0B18", "--surface": "#161629" }
    : { "--ink": "#12122B", "--bg": "#FBFBFE", "--surface": "#FFFFFF" };
}
