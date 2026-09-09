import { useState } from "react";
import { Sparkles, ChevronRight, Loader2 } from "lucide-react";
import { Card } from "../components/ui/Card";
import { GradientButton } from "../components/ui/GradientButton";
import { ThemeToggle } from "../components/ui/ThemeToggle";
import { GoogleButton } from "../components/auth/GoogleButton";
import { disp, themeVars } from "../constants/theme";

const inputCls = "w-full mt-2 rounded-xl border border-[var(--ink)]/12 bg-[var(--surface)] text-[var(--ink)] px-3 py-2.5 text-sm outline-none focus:border-[#6D5EF8]";

export function SignupPage({ onSignup, onGoogle, onGoToLogin, onBack, dark, onToggleDark }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await onSignup({ name, email, password });
    } catch (err) {
      setError(err.message || "Something went wrong creating your account.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await onGoogle();
    } catch (err) {
      setError(err.message || "Something went wrong signing up with Google.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col transition-colors duration-300" style={{ ...themeVars(dark), fontFamily: "'Inter', sans-serif" }}>
      <header className="max-w-7xl w-full mx-auto flex items-center justify-between px-6 py-5">
        <button onClick={onBack} className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6D5EF8] to-[#4C3FE0] flex items-center justify-center">
            <Sparkles size={17} className="text-white" />
          </div>
          <span className="font-bold text-xl text-[var(--ink)]" style={disp}>Intervue</span>
        </button>
        <ThemeToggle dark={dark} onToggle={onToggleDark} />
      </header>

      <div className="flex-1 flex items-center justify-center px-6 py-10">
        <Card className="w-full max-w-sm p-6">
          <h1 className="text-xl font-bold text-[var(--ink)]" style={disp}>Create your account</h1>
          <p className="text-sm text-[var(--ink)]/50 mt-1 mb-6">Start practicing in a couple of minutes.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[var(--ink)]/60 uppercase tracking-wide">Name</label>
              <input required value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="Your name" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--ink)]/60 uppercase tracking-wide">Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} placeholder="you@example.com" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--ink)]/60 uppercase tracking-wide">Password</label>
              <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} placeholder="At least 6 characters" />
            </div>

            <GradientButton type="submit" disabled={submitting} className="w-full py-2.5">
              {submitting ? <Loader2 size={15} className="animate-spin" /> : <>Create account <ChevronRight size={15} /></>}
            </GradientButton>
          </form>

          <div className="flex items-center gap-3 my-4">
            <div className="h-px flex-1 bg-[var(--ink)]/10" />
            <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--ink)]/40">or</span>
            <div className="h-px flex-1 bg-[var(--ink)]/10" />
          </div>

          <GoogleButton onClick={handleGoogle} disabled={submitting} label="Sign up with Google" />

          {error && <p className="text-[13px] text-[#E24468] mt-4">{error}</p>}

          <p className="text-[13px] text-[var(--ink)]/55 mt-5 text-center">
            Already have an account?{" "}
            <button onClick={onGoToLogin} className="font-semibold text-[#4C3FE0]">Log in</button>
          </p>
        </Card>
      </div>
    </div>
  );
}
