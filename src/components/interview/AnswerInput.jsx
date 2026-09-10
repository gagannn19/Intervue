import { Send } from "lucide-react";

export function AnswerInput({ value, onChange, onSubmit, micOn, disabled, error, onRetry }) {
  return (
    <div className="p-4 border-t border-white/10 bg-white/[0.02]">
      {error && (
        <div className="mb-2 flex items-center justify-between gap-3 text-[11px] text-[#FF9CB0]">
          <span>{error}</span>
          {onRetry && (
            <button onClick={onRetry} className="shrink-0 underline hover:text-white">Retry</button>
          )}
        </div>
      )}
      <div className="flex items-end gap-2">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (!disabled) onSubmit();
            }
          }}
          disabled={disabled}
          placeholder={
            disabled ? "Waiting for the interviewer…" : micOn ? "Speak or type your answer…" : "Type your answer…"
          }
          rows={2}
          className="flex-1 bg-white/5 rounded-xl px-3.5 py-2.5 text-sm outline-none resize-none border border-white/10 focus:border-[#6D5EF8]/50 disabled:opacity-50"
        />
        <button
          onClick={onSubmit}
          disabled={disabled}
          className="p-3 rounded-xl bg-[#6D5EF8] disabled:opacity-50 disabled:pointer-events-none"
        >
          <Send size={15} />
        </button>
      </div>
      <p className="text-[10px] text-white/30 mt-1.5">Mic is a UI placeholder in this prototype — type your answer to continue.</p>
    </div>
  );
}
