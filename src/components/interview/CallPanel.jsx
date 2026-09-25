import { Loader2, AlertTriangle, VolumeX } from "lucide-react";
import { GradientButton } from "../ui/GradientButton";

const STATUS_COPY = {
  connecting: "Setting up your interview…",
  joining: "Joining the call…",
  live: null,
  finishing: "Interview ended — preparing your results…",
  ended: "Call ended.",
  error: null,
};

// Fills the space the old typed-transcript view used to occupy. This is a
// real-time voice call (Daily + pipecat) with no live captions in this
// first pass — see useInterviewEngine's file comment for why — so there's
// nothing to render turn by turn. This just reflects call state: still
// connecting, live, or something went wrong.
const TURN_COPY = {
  waiting: "Waiting for the interviewer to join…",
  ai_speaking: "The interviewer is speaking — listen in.",
  ai_finished: "The interviewer is speaking — listen in.",
  listening: "Your turn — just start speaking.",
  user_speaking: "Listening. Take your time — pause for a moment when you're finished.",
  user_finished: "Listening. Take your time — pause for a moment when you're finished.",
  processing: "Got it — the interviewer is thinking…",
  ended: "Interview ended.",
};
const MUTED_COPY = "Your mic is muted — unmute it when you're ready to answer.";
const CANDIDATE_STATES = ["listening", "user_speaking", "user_finished"];

export function CallPanel({ status, error, turnState, micOn = true, audioBlocked, onUnblockAudio }) {
  if (status === "error") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6 text-center">
        <AlertTriangle size={28} className="text-[#FF8FA3]" />
        <p className="text-sm text-white/70">{error || "Something went wrong with the call."}</p>
      </div>
    );
  }

  const copy = STATUS_COPY[status];

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
      {copy ? (
        <>
          <Loader2 size={24} className="animate-spin text-white/40" />
          <p className="text-sm text-white/50">{copy}</p>
        </>
      ) : audioBlocked ? (
        <>
          <VolumeX size={28} className="text-[#FF8FA3]" />
          <p className="text-sm text-white/70">Your browser blocked the interviewer's audio.</p>
          <GradientButton onClick={onUnblockAudio}>Tap to enable sound</GradientButton>
        </>
      ) : (
        <p className="text-sm text-white/40">
          {!micOn && CANDIDATE_STATES.includes(turnState) ? MUTED_COPY : (TURN_COPY[turnState] ?? TURN_COPY.waiting)}
        </p>
      )}
    </div>
  );
}
