// Live subtitles at the bottom of the room: what the interviewer is saying
// (in step with its voice, a sentence at a time) and what it heard from the
// candidate (live — words still being recognised are dimmer). Keeps its
// height while the call is live, so the layout never jumps.
export function CaptionBar({ captions }) {
  const { interviewer, candidate, candidateFinal } = captions;
  return (
    <div className="shrink-0 mx-5 mb-4 min-h-[68px] flex flex-col justify-end gap-1.5" aria-live="polite">
      {interviewer && (
        <p className="self-center max-w-3xl text-center text-[15px] leading-snug text-white bg-black/70 border border-white/10 rounded-lg px-3 py-1.5">
          <span className="mr-2 text-[10px] font-bold uppercase tracking-widest text-[#FF7A00]">Kathy</span>
          {interviewer}
        </p>
      )}
      {candidate && (
        <p className="self-center max-w-3xl text-center text-[14px] leading-snug bg-white/[0.06] border border-white/10 rounded-lg px-3 py-1.5">
          <span className="mr-2 text-[10px] font-bold uppercase tracking-widest text-[#2DD4BF]">You</span>
          <span className={candidateFinal ? "text-white/85" : "text-white/50 italic"}>{candidate}</span>
        </p>
      )}
    </div>
  );
}
