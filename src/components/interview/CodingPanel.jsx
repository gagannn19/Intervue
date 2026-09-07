import { Play, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { LANGUAGES } from "../../constants/questions";
import { mono } from "../../constants/theme";

export function CodingPanel({ statement, lang, onLangChange, code, onCodeChange, onRun, running, output }) {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="px-5 py-3 border-b border-white/10 text-xs text-white/50 leading-relaxed">{statement}</div>

      <div className="flex items-center justify-between px-5 py-2 border-b border-white/10">
        <select
          value={lang}
          onChange={(e) => onLangChange(e.target.value)}
          className="bg-white/5 text-xs rounded-lg px-2.5 py-1.5 outline-none border border-white/10"
        >
          {LANGUAGES.map((l) => <option key={l} value={l} className="text-black">{l}</option>)}
        </select>
        <button onClick={onRun} disabled={running} className="flex items-center gap-1.5 text-xs font-semibold bg-[#22C97A]/20 text-[#4ADE9A] px-3 py-1.5 rounded-lg">
          {running ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} />} Run
        </button>
      </div>

      <textarea
        value={code}
        onChange={(e) => onCodeChange(e.target.value)}
        spellCheck={false}
        className="flex-1 bg-[#0A0A18] text-[#B8E6D0] text-[13px] p-4 outline-none resize-none"
        style={mono}
      />

      {output && (
        <div className={`px-4 py-3 text-xs border-t border-white/10 ${output.ok ? "text-[#4ADE9A]" : "text-[#FF8FA3]"}`} style={mono}>
          {output.ok ? <CheckCircle2 size={12} className="inline mr-1.5" /> : <XCircle size={12} className="inline mr-1.5" />}
          {output.text}
        </div>
      )}
    </div>
  );
}
