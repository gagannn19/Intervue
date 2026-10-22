import { InterviewerOrb } from "./InterviewerOrb";
import { useAudioAnalyser } from "../../hooks/useAudioAnalyser";

// Header strip for the left column: avatar + status text + the
// call/code tab switcher.
const TURN_STATUS = {
  waiting: "connecting…",
  ai_speaking: "speaking…",
  ai_finished: "speaking…",
  listening: "listening",
  user_speaking: "listening",
  user_finished: "listening",
  processing: "thinking…",
  ended: "interview ended",
};

export function AIInterviewerPanel({ speaking, turnState, audioTrack, tab, onTabChange }) {
  const status = TURN_STATUS[turnState] ?? (speaking ? "speaking…" : "listening");
  const analyserRef = useAudioAnalyser(audioTrack);
  return (
    <div className="px-4 py-2 flex items-center gap-3 border-b border-white/10 bg-white/[0.02]">
      <InterviewerOrb analyserRef={analyserRef} turnState={turnState} size={96} />
      <div>
        <p className="text-sm font-semibold">
          Kathy <span className="font-normal text-white/45">(AI Interviewer)</span>
        </p>
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
