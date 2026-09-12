import { PulseAvatar } from "../ui/PulseAvatar";

// Header strip for the left column: avatar + status text + the
// call/code tab switcher.
export function AIInterviewerPanel({ speaking, tab, onTabChange }) {
  const status = speaking ? "speaking…" : "listening";
  return (
    <div className="p-5 flex items-center gap-4 border-b border-white/10 bg-white/[0.02]">
      <PulseAvatar size={56} speaking={speaking} label />
      <div>
        <p className="text-sm font-semibold">AI Interviewer</p>
        <p className="text-xs text-white/40">{status}</p>
      </div>
      <div className="ml-auto flex gap-1 bg-white/5 rounded-lg p-1">
        <button onClick={() => onTabChange("call")} className={`px-3 py-1.5 rounded-md text-xs font-semibold ${tab === "call" ? "bg-white/15" : "text-white/50"}`}>
          Call
        </button>
        <button onClick={() => onTabChange("code")} className={`px-3 py-1.5 rounded-md text-xs font-semibold ${tab === "code" ? "bg-white/15" : "text-white/50"}`}>
          Code editor
        </button>
      </div>
    </div>
  );
}
