// Primary button. Despite the (unchanged, to avoid touching every call
// site) name, this is no longer a gradient — the design system uses one
// flat accent color, not gradients. Colors are inverted off --ink/--bg
// rather than hardcoded, so it stays a solid, readable pill in both
// light and dark mode without a separate dark-mode variant.
export function GradientButton({ children, onClick, className = "", disabled, type = "button" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold
        bg-[var(--ink)] text-[var(--bg)] shadow-[0_6px_16px_-6px_rgba(17,17,17,0.35)]
        hover:opacity-90 hover:-translate-y-0.5 active:translate-y-0
        transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none ${className}`}
    >
      {children}
    </button>
  );
}
