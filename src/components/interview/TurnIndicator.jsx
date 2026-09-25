import { Mic, MicOff, Loader2, Volume2, AudioLines, PhoneOff } from "lucide-react";

// Shows whose turn it is. Turn-taking is automatic (the bot detects speech
// start/stop — see useInterviewEngine), so this only renders the bot's
// reported state; there is nothing to click.
const STATES = {
  waiting: { label: "Connecting to interviewer…", Icon: Loader2, spin: true },
  ai_speaking: { label: "Interviewer is speaking…", Icon: Volume2 },
  ai_finished: { label: "Interviewer is speaking…", Icon: Volume2 },
  listening: { label: "Listening — go ahead", Icon: Mic, live: true },
  user_speaking: { label: "Listening…", Icon: AudioLines, live: true },
  user_finished: { label: "Listening…", Icon: AudioLines, live: true },
  processing: { label: "Interviewer is thinking…", Icon: Loader2, spin: true },
  ended: { label: "Interview ended", Icon: PhoneOff },
};
const MUTED = { label: "Your mic is muted — unmute to answer", Icon: MicOff };
const CANDIDATE_STATES = ["listening", "user_speaking", "user_finished"];

export function TurnIndicator({ turnState, micOn = true }) {
  const muted = !micOn && CANDIDATE_STATES.includes(turnState);
  const { label, Icon, spin, live } = muted ? MUTED : (STATES[turnState] ?? STATES.waiting);

  const tone = live
    ? "bg-[#FF5C7A]/15 border-[#FF5C7A]/60 text-white"
    : "bg-white/5 border-white/10 text-white/50";

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        role="status"
        className={`w-full flex items-center justify-center gap-3 rounded-2xl border px-5 py-4 text-sm font-semibold
          transition-all duration-200 ${tone}`}
      >
        {live ? (
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full rounded-full bg-[#FF5C7A] opacity-75 animate-ping" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-[#FF5C7A]" />
          </span>
        ) : null}
        <Icon size={18} className={spin ? "animate-spin" : ""} />
        <span aria-live="polite">{label}</span>
      </div>
      <p className="text-[11px] text-white/40">Just speak when it's your turn · Pause for a moment when you're done</p>
    </div>
  );
}
