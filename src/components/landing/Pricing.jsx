import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { GradientButton } from "../ui/GradientButton";
import { GhostButton } from "../ui/GhostButton";
import { disp } from "../../constants/theme";

const PLANS = [
  { name: "Free", price: "₹0", d: "2 interviews / month", cta: "Start free" },
  { name: "Pro", price: "₹499", d: "Unlimited interviews", cta: "Go Pro", highlight: true },
  { name: "Teams", price: "Custom", d: "For bootcamps & colleges", cta: "Contact us" },
];

export function Pricing() {
  return (
    <section id="pricing" className="max-w-7xl mx-auto px-6 pb-20">
      <h2 className="text-3xl font-bold text-center text-[var(--ink)]" style={disp}>Simple pricing</h2>
      <div className="mt-10 grid sm:grid-cols-3 gap-5 max-w-4xl mx-auto">
        {PLANS.map((p) => (
          <Card key={p.name} className={`p-6 ${p.highlight ? "border-[#6D5EF8]/40 ring-2 ring-[#6D5EF8]/20" : ""}`}>
            {p.highlight && <Badge>Most popular</Badge>}
            <h3 className="font-semibold text-[15px] mt-3 text-[var(--ink)]">{p.name}</h3>
            <p className="text-3xl font-bold mt-2 text-[var(--ink)]" style={disp}>
              {p.price}<span className="text-sm font-normal text-[var(--ink)]/40">/mo</span>
            </p>
            <p className="text-[13px] text-[var(--ink)]/55 mt-2">{p.d}</p>
            {p.highlight ? <GradientButton className="w-full mt-5">{p.cta}</GradientButton> : <GhostButton className="w-full mt-5">{p.cta}</GhostButton>}
          </Card>
        ))}
      </div>
    </section>
  );
}
