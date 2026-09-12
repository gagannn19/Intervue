import { Loader2, AlertTriangle } from "lucide-react";

const STATUS_COPY = {
  connecting: "Setting up your interview…",
  joining: "Joining the call…",
  live: null,
  ended: "Call ended.",
  error: null,
};

// Fills the space the old typed-transcript view used to occupy. This is a
// real-time voice call (Daily + pipecat) with no live captions in this
// first pass — see useInterviewEngine's file comment for why — so there's
// nothing to render turn by turn. This just reflects call state: still
// connecting, live, or something went wrong.
export function CallPanel({ status, error, aiSpeaking }) {
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
      ) : (
        <p className="text-sm text-white/40">
          {aiSpeaking ? "The interviewer is speaking — listen in." : "You're live — speak whenever you're ready."}
        </p>
      )}
    </div>
  );
}
