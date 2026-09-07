import { disp } from "../../constants/theme";

export function ScoreRing({ score, size = 96 }) {
  const r = (size - 10) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  const color = score >= 75 ? "#22C97A" : score >= 50 ? "#F5A623" : "#FF5C7A";
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--ink)" strokeOpacity="0.08" strokeWidth="8" fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth="8" fill="none"
          strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-[var(--ink)]" style={disp}>{score}</span>
        <span className="text-[10px] text-[var(--ink)]/50 font-medium">/ 100</span>
      </div>
    </div>
  );
}
