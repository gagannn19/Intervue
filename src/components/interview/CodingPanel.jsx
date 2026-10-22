import { lazy, Suspense, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  FileCode2,
  Loader2,
  Play,
  RotateCcw,
  Terminal,
  Trash2,
  XCircle,
} from "lucide-react";
import { LANGUAGES } from "../../constants/questions";
import { mono } from "../../constants/theme";

// Monaco is large: loaded only when the code editor is first opened.
const CodeEditor = lazy(() => import("./CodeEditor"));

// File name + tab-icon colour per language, like an IDE's file tab.
const FILE = {
  JavaScript: { name: "solution.js", color: "#F7DF1E" },
  Python: { name: "solution.py", color: "#4B8BBE" },
  Java: { name: "Solution.java", color: "#E76F00" },
  "C++": { name: "solution.cpp", color: "#659AD2" },
};

// The candidate's code editor — the right-hand pane of the interview room
// when "Code editor" is open (see InterviewPage), dressed like an IDE: a
// file tab bar with the language / reset / run controls, a collapsible
// problem panel, Monaco, a console for run output, and a status bar.
export function CodingPanel({ statement, lang, onLangChange, code, onCodeChange, onRun, running, output }) {
  const [problemOpen, setProblemOpen] = useState(true);
  const [consoleOpen, setConsoleOpen] = useState(true);
  const [cursor, setCursor] = useState({ line: 1, column: 1, selected: 0 });
  const [clearedOutput, setClearedOutput] = useState(null);
  const file = FILE[lang] ?? { name: "solution.txt", color: "#999" };
  const shownOutput = output && output !== clearedOutput ? output : null;

  return (
    <div className="flex-1 flex flex-col min-h-0 min-w-0 bg-[#0D0D0D]">
      {/* Tab bar */}
      <div className="shrink-0 flex items-stretch h-10 bg-[#080808] border-b border-white/10">
        <div className="flex items-center gap-2 px-4 bg-[#0D0D0D] border-r border-white/10 border-t-2 border-t-[#FF7A00] -mb-px text-[12px] text-white/90">
          <FileCode2 size={14} style={{ color: file.color }} />
          <span style={mono}>{file.name}</span>
        </div>
        <div className="ml-auto flex items-center gap-1.5 px-2">
          <div className="relative">
            <select
              value={lang}
              onChange={(e) => onLangChange(e.target.value)}
              aria-label="Language"
              className="appearance-none bg-white/5 hover:bg-white/10 text-[12px] text-white/80 rounded-md pl-2.5 pr-7 py-1 outline-none border border-white/10 cursor-pointer"
            >
              {LANGUAGES.map((l) => <option key={l} value={l} className="text-black">{l}</option>)}
            </select>
            <ChevronDown size={13} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-white/40" />
          </div>
          <button
            onClick={() => onLangChange(lang)}
            title="Reset to starter code"
            aria-label="Reset to starter code"
            className="p-1.5 rounded-md text-white/45 hover:text-white/80 hover:bg-white/10"
          >
            <RotateCcw size={14} />
          </button>
          <button
            onClick={() => {
              setConsoleOpen(true);
              onRun();
            }}
            disabled={running}
            className="flex items-center gap-1.5 text-[12px] font-semibold bg-[#22C97A] hover:bg-[#2BD985] text-black px-3 py-1 rounded-md disabled:opacity-60"
          >
            {running ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} fill="currentColor" />} Run
          </button>
        </div>
      </div>

      {/* Problem */}
      <div className="shrink-0 border-b border-white/10">
        <button
          onClick={() => setProblemOpen((o) => !o)}
          className="w-full flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-white/45 hover:text-white/70"
        >
          {problemOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />} Problem
        </button>
        {problemOpen && <p className="px-4 pb-3 text-[13px] leading-relaxed text-white/70">{statement}</p>}
      </div>

      {/* Editor */}
      <div className="flex-1 min-h-[240px]">
        <Suspense
          fallback={
            <div className="h-full flex items-center justify-center gap-2 text-xs text-white/40">
              <Loader2 size={14} className="animate-spin" /> Loading editor…
            </div>
          }
        >
          <CodeEditor lang={lang} code={code} onCodeChange={onCodeChange} onCursorChange={setCursor} />
        </Suspense>
      </div>

      {/* Console */}
      <div className="shrink-0 border-t border-white/10 bg-[#080808]">
        <div className="flex items-center h-8 px-3">
          <button
            onClick={() => setConsoleOpen((o) => !o)}
            className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-white/55 hover:text-white/80"
          >
            {consoleOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
            <Terminal size={13} /> Console
          </button>
          {shownOutput && (
            <button
              onClick={() => setClearedOutput(output)}
              title="Clear console"
              aria-label="Clear console"
              className="ml-auto p-1 rounded text-white/35 hover:text-white/70 hover:bg-white/10"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
        {consoleOpen && (
          <div className="h-28 overflow-y-auto px-4 pb-3 text-[12px] leading-relaxed" style={mono}>
            {running ? (
              <p className="text-white/45">
                <span className="text-[#FF7A00]">$</span> running {file.name}…
              </p>
            ) : shownOutput ? (
              <>
                <p className="text-white/35">
                  <span className="text-[#FF7A00]">$</span> run {file.name}
                </p>
                <p className={shownOutput.ok ? "text-[#4ADE9A]" : "text-[#FF8FA3]"}>
                  {shownOutput.ok ? <CheckCircle2 size={12} className="inline mr-1.5 -mt-0.5" /> : <XCircle size={12} className="inline mr-1.5 -mt-0.5" />}
                  {shownOutput.text}
                </p>
              </>
            ) : (
              <p className="text-white/30">Run your code to see the output here.</p>
            )}
          </div>
        )}
      </div>

      {/* Status bar */}
      <div className="shrink-0 flex items-center gap-4 h-6 px-3 bg-[#FF7A00] text-black text-[11px] font-medium" style={mono}>
        <span>{lang}</span>
        <span className="ml-auto">
          Ln {cursor.line}, Col {cursor.column}
          {cursor.selected ? ` (${cursor.selected} selected)` : ""}
        </span>
        <span>Spaces: {lang === "Python" ? 4 : 2}</span>
        <span>UTF-8</span>
      </div>
    </div>
  );
}
