import { useEffect } from "react";

// Closes a popover on a mousedown outside `ref` or on Escape — the same
// behavior CompanyStep wires inline for "More companies", shared here for
// the date/time pickers.
export function usePopoverDismiss(ref, open, onClose) {
  useEffect(() => {
    if (!open) return undefined;
    const onDocDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", onDocDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [ref, open, onClose]);
}
