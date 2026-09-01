import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { INTERVIEW_TYPES } from "../../constants/interviewTypes";
import { disp } from "../../constants/theme";

export function Categories() {
  return (
    <section className="max-w-7xl mx-auto px-6 pb-20">
      <div className="flex items-end justify-between mb-6">
        <h2 className="text-3xl font-bold text-[var(--ink)]" style={disp}>Interview categories</h2>
        <span className="text-[13px] text-[var(--ink)]/50">More rounds ship regularly</span>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {INTERVIEW_TYPES.map((t) => (
          <Card key={t.id} className={`p-5 ${!t.live && "opacity-60"}`}>
            <t.icon size={18} className="text-[#4C3FE0]" />
            <h3 className="font-semibold text-sm mt-3 text-[var(--ink)]">{t.label}</h3>
            <p className="text-xs text-[var(--ink)]/50 mt-1">{t.desc}</p>
            <div className="mt-3">
              {t.live ? <Badge tone="green">Live now</Badge> : <Badge tone="ink">Coming soon</Badge>}
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
