import { Mic, MicOff, Video, VideoOff, PhoneOff } from "lucide-react";

export function InterviewControls({ micOn, onToggleMic, camOn, onToggleCam, onEnd }) {
  return (
    <div className="flex items-center justify-center gap-3">
      <button onClick={onToggleMic} className={`p-3 rounded-full ${micOn ? "bg-white/10" : "bg-[#FF5C7A]/20 text-[#FF5C7A]"}`}>
        {micOn ? <Mic size={16} /> : <MicOff size={16} />}
      </button>
      <button onClick={onToggleCam} className={`p-3 rounded-full ${camOn ? "bg-white/10" : "bg-[#FF5C7A]/20 text-[#FF5C7A]"}`}>
        {camOn ? <Video size={16} /> : <VideoOff size={16} />}
      </button>
      <button onClick={onEnd} className="p-3 rounded-full bg-[#FF5C7A] hover:bg-[#FF4568]"><PhoneOff size={16} /></button>
    </div>
  );
}
