import { Send } from "lucide-react";

export function AnswerInput({ value, onChange, onSubmit, micOn }) {
  return (
    <div className="p-4 border-t border-white/10 bg-white/[0.02]">
      <div className="flex items-end gap-2">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSubmit(); } }}
          placeholder={micOn ? "Speak or type your answer…" : "Type your answer…"}
          rows={2}
          className="flex-1 bg-white/5 rounded-xl px-3.5 py-2.5 text-sm outline-none resize-none border border-white/10 focus:border-[#6D5EF8]/50"
        />
        <button onClick={onSubmit} className="p-3 rounded-xl bg-[#6D5EF8]"><Send size={15} /></button>
      </div>
      <p className="text-[10px] text-white/30 mt-1.5">Mic is a UI placeholder in this prototype — type your answer to continue.</p>
    </div>
  );
}
