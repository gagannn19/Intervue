import { ChevronRight } from "lucide-react";
import { GradientButton } from "../ui/GradientButton";
import { disp } from "../../constants/theme";

export function FinalCTA({ onSchedule }) {
  return (
    <section className="max-w-5xl mx-auto px-6 pb-20">
      <div className="rounded-3xl bg-gradient-to-br from-[#6D5EF8] to-[#4C3FE0] px-8 py-14 text-center relative overflow-hidden">
        <h2 className="text-3xl sm:text-4xl font-bold text-white" style={disp}>Ready for a real practice round?</h2>
        <p className="text-white/75 mt-3">No recruiter watching. Just you, a problem, and an interviewer that won't let you off easy.</p>
        <GradientButton onClick={onSchedule} className="mt-7 !bg-white !bg-none !text-[#4C3FE0] px-7 py-3">
          Schedule your interview <ChevronRight size={16} />
        </GradientButton>
      </div>
    </section>
  );
}
