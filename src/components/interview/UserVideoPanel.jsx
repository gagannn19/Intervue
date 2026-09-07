import { VideoOff, MicOff } from "lucide-react";

export function UserVideoPanel({ camOn, videoRef, mediaError }) {
  return (
    <div className="rounded-xl bg-black aspect-video relative overflow-hidden flex items-center justify-center border border-white/10">
      {camOn && !mediaError ? (
        <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
      ) : (
        <div className="text-white/30 text-xs flex flex-col items-center gap-2 px-4 text-center">
          <VideoOff size={20} />
          {!camOn && !mediaError && "Camera off"}
        </div>
      )}

      {mediaError && (
        <div className="absolute inset-x-2 bottom-2 rounded-lg bg-[#FF5C7A]/15 border border-[#FF5C7A]/30 px-3 py-2 flex items-start gap-2">
          <MicOff size={13} className="text-[#FF8FA3] mt-0.5 shrink-0" />
          <p className="text-[11px] text-[#FF8FA3] leading-snug">
            {mediaError === "denied"
              ? "Camera/microphone access was denied. Check your browser's site permissions and reload."
              : "Camera/microphone aren't available in this browser or environment."}
          </p>
        </div>
      )}

      <span className="absolute top-2 left-2 text-[10px] bg-black/50 rounded-full px-2 py-0.5">You</span>
    </div>
  );
}
