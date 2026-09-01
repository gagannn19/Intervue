export function GradientButton({ children, onClick, className = "", disabled, type = "button" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white
        bg-gradient-to-r from-[#6D5EF8] to-[#4C3FE0] shadow-[0_8px_20px_-6px_rgba(76,63,224,0.55)]
        hover:shadow-[0_10px_26px_-6px_rgba(76,63,224,0.7)] hover:-translate-y-0.5 active:translate-y-0
        transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none ${className}`}
    >
      {children}
    </button>
  );
}
