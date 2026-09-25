import { Mic, MicOff, Video, VideoOff, PhoneOff } from "lucide-react";

// Mic is a plain mute/unmute, layered on the automatic turn-taking (see
// useInterviewEngine's toggleMic): muted = the bot never hears you; unmuted
// = you're heard whenever it's your turn. No start/end-turn clicking.
export function InterviewControls({ micOn, onToggleMic, micDisabled, camOn, onToggleCam, onEnd }) {
  const handleEndClick = () => {
    const confirmed = window.confirm("End the interview now? You won't be able to resume this session.");
    if (confirmed) onEnd();
  };

  return (
    <div className="flex items-center justify-center gap-3">
      <button
        onClick={onToggleMic}
        disabled={micDisabled}
        aria-pressed={!micOn}
        aria-label={micOn ? "Mute microphone" : "Unmute microphone"}
        title={micOn ? "Mute microphone" : "Unmute microphone"}
        className={`p-3 rounded-full disabled:opacity-40 disabled:cursor-not-allowed ${micOn ? "bg-white/10" : "bg-[#FF5C7A]/20 text-[#FF5C7A]"}`}
      >
        {micOn ? <Mic size={16} /> : <MicOff size={16} />}
      </button>
      <button onClick={onToggleCam} className={`p-3 rounded-full ${camOn ? "bg-white/10" : "bg-[#FF5C7A]/20 text-[#FF5C7A]"}`}>
        {camOn ? <Video size={16} /> : <VideoOff size={16} />}
      </button>
      <button
        onClick={handleEndClick}
        className="flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold bg-[#FF5C7A] hover:bg-[#FF4568] transition-colors"
      >
        <PhoneOff size={16} /> End Interview
      </button>
    </div>
  );
}
