import { Sparkles, AudioLines } from "lucide-react";

// Signature motif: a pulsing "listening" ring around the AI avatar. Used on
// the landing hero mock-up and the real interview room so the AI reads as
// one consistent character rather than two different bits of decoration.
export function PulseAvatar({ size = 64, speaking = false, label }) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {speaking && (
        <>
          <span className="absolute inset-0 rounded-full bg-[#FF7A00]/30 animate-ping" style={{ animationDuration: "1.6s" }} />
          <span className="absolute -inset-2 rounded-full border border-[#FF7A00]/30 animate-pulse" />
        </>
      )}
      <div
        className="relative rounded-full bg-gradient-to-br from-[#FF7A00] to-[#CC5500] flex items-center justify-center text-white shadow-lg"
        style={{ width: size, height: size }}
      >
        <Sparkles size={size * 0.4} />
      </div>
      {label && (
        <span className="absolute -bottom-1 -right-1 flex items-center justify-center w-5 h-5 rounded-full bg-white shadow border border-black/10">
          <AudioLines size={11} className={speaking ? "text-[#CC5500]" : "text-black/30"} />
        </span>
      )}
    </div>
  );
}
