import { useState } from "react";

// Owns the light/dark boolean + toggle. Pages read `dark` to set the
// --ink/--bg/--surface CSS variables (see constants/theme.js#themeVars) on
// their root wrapper; nothing else needs to know this hook exists.
export function useTheme() {
  const [dark, setDark] = useState(false);
  const toggleDark = () => setDark((d) => !d);
  return { dark, toggleDark };
}
