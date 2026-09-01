import { VideoOff } from "lucide-react";

export function UserVideoPanel({ camOn, videoRef }) {
  return (
    <div className="rounded-xl bg-black aspect-video relative overflow-hidden flex items-center justify-center border border-white/10">
      {camOn ? (
        <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
      ) : (
        <div className="text-white/30 text-xs flex flex-col items-center gap-2"><VideoOff size={20} /> Camera off</div>
      )}
      <span className="absolute top-2 left-2 text-[10px] bg-black/50 rounded-full px-2 py-0.5">You</span>
    </div>
  );
}
