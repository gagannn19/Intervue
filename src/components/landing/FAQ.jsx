import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Card } from "../ui/Card";
import { FAQS } from "../../constants/heroContent";
import { disp } from "../../constants/theme";

function FAQItem({ q, a, open, onClick }) {
  return (
    <Card className="overflow-hidden">
      <button onClick={onClick} className="w-full flex items-center justify-between gap-4 p-5 text-left">
        <span className="text-sm font-semibold text-[var(--ink)]">{q}</span>
        <ChevronDown size={16} className={`shrink-0 text-[var(--ink)]/40 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      <div className={`grid transition-all duration-300 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden">
          <p className="px-5 pb-5 -mt-1 text-[13px] text-[var(--ink)]/60 leading-relaxed">{a}</p>
        </div>
      </div>
    </Card>
  );
}

export function FAQ() {
  const [openIdx, setOpenIdx] = useState(0);
  return (
    <section id="faq" className="max-w-3xl mx-auto px-6 py-20">
      <h2 className="text-3xl font-bold text-center text-[var(--ink)]" style={disp}>Frequently asked questions</h2>
      <p className="text-center text-sm text-[var(--ink)]/50 mt-2">Everything you'd want to know before your first round.</p>
      <div className="mt-8 space-y-3">
        {FAQS.map((f, i) => (
          <FAQItem key={f.q} q={f.q} a={f.a} open={openIdx === i} onClick={() => setOpenIdx(openIdx === i ? -1 : i)} />
        ))}
      </div>
    </section>
  );
}
