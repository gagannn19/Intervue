import { Navbar } from "../components/landing/Navbar";
import { Hero } from "../components/landing/Hero";
import { Features } from "../components/landing/Features";
import { HowItWorks } from "../components/landing/HowItWorks";
import { Categories } from "../components/landing/Categories";
import { Pricing } from "../components/landing/Pricing";
import { FAQ } from "../components/landing/FAQ";
import { FinalCTA } from "../components/landing/FinalCTA";
import { Footer } from "../components/landing/Footer";
import { themeVars } from "../constants/theme";

export function LandingPage({ onSchedule, onLogin, dark, onToggleDark }) {
  return (
    <div className="min-h-screen bg-[var(--bg)] transition-colors duration-300" style={{ ...themeVars(dark), fontFamily: "'Inter', sans-serif" }}>
      <Navbar onSchedule={onSchedule} onLogin={onLogin} dark={dark} onToggleDark={onToggleDark} />
      <Hero onSchedule={onSchedule} />
      <Features />
      <HowItWorks />
      <Categories />
      <Pricing />
      <FAQ />
      <FinalCTA onSchedule={onSchedule} />
      <Footer />
    </div>
  );
}
