import { useEffect } from "react";
import { FONT_LINK } from "../constants/theme";

// Injects the Google Fonts <link> once, app-wide.
export function useFonts() {
  useEffect(() => {
    if (!document.getElementById("intervue-fonts")) {
      const link = document.createElement("link");
      link.id = "intervue-fonts";
      link.rel = "stylesheet";
      link.href = FONT_LINK;
      document.head.appendChild(link);
    }
  }, []);
}
