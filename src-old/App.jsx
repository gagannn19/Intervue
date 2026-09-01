import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Sparkles, Calendar, Clock, Mic, MicOff, Video, VideoOff, PhoneOff,
  Code2, Play, ChevronRight, ArrowLeft, TrendingUp, Award, Target,
  CheckCircle2, XCircle, BarChart3, History, LayoutDashboard, LogOut,
  Send, Loader2, Zap, MessageSquare, Terminal, ChevronDown, Star,
  Brain, Users, AudioLines, Sun, Moon,
} from "lucide-react";

/* =========================================================================
   DESIGN TOKENS
   Light: ink #12122B on base #FBFBFE / surface #FFFFFF
   Dark:  ink #F5F5FA on base #0B0B18 / surface #161629
   Threaded via CSS custom properties (--ink / --bg / --surface) set on the
   two page-root wrappers (Landing, AppShell) so every nested component just
   references var(--ink) etc. and inherits the right value automatically —
   no prop drilling needed for the theme switch itself.
   ========================================================================= */

const FONT_LINK = "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap";

function useFonts() {
  useEffect(() => {
    if (!document.getElementById("intervue-fonts")) {
      const link = document.createElement("link");
      link.id = "intervue-fonts";
      link.rel = "stylesheet";
      link.href = FONT_LINK;
      document.head.appendChild(link);
    }
  }, []);
}

const disp = { fontFamily: "'Space Grotesk', sans-serif" };
const mono = { fontFamily: "'JetBrains Mono', monospace" };

function themeVars(dark) {
  return dark
    ? { "--ink": "#F5F5FA", "--bg": "#0B0B18", "--surface": "#161629" }
    : { "--ink": "#12122B", "--bg": "#FBFBFE", "--surface": "#FFFFFF" };
}

/* =========================================================================
   MOCK DATA
   ========================================================================= */

const INTERVIEW_TYPES = [
  { id: "dsa", label: "DSA", desc: "Data structures & algorithms", icon: Code2, live: true },
  { id: "system-design", label: "System Design", desc: "Architecture & scale", icon: LayoutDashboard, live: false },
  { id: "behavioral", label: "Behavioral", desc: "Situational & story-based", icon: MessageSquare, live: false },
  { id: "frontend", label: "Frontend", desc: "JS, React, CSS internals", icon: Terminal, live: false },
  { id: "hr", label: "HR Round", desc: "Culture fit & expectations", icon: Users, live: false },
];

const QUESTION_BANK = {
  easy: {
    title: "Two Sum",
    statement: "Given an array of integers nums and an integer target, return the indices of the two numbers that add up to target. Assume exactly one solution exists, and you can't use the same element twice.",
    followUps: [
      "Walk me through your approach before you write any code — what's the brute-force idea first?",
      "That works, but what's the time complexity? Can we do better than O(n²)?",
      "Good — a hash map gets us to O(n). What's the space tradeoff there?",
      "What happens if the array is empty, or has only one element?",
    ],
  },
  medium: {
    title: "Longest Substring Without Repeating Characters",
    statement: "Given a string s, find the length of the longest substring without repeating characters.",
    followUps: [
      "Before coding — what's your high-level strategy? Sliding window, brute force, something else?",
      "How do you decide when to shrink the window from the left?",
      "What data structure are you using to track characters in the current window, and why that one?",
      "What's the time and space complexity of your final solution?",
      "What if the string contains unicode or emoji — does your approach still hold?",
    ],
  },
  hard: {
    title: "Median of Two Sorted Arrays",
    statement: "Given two sorted arrays nums1 and nums2 of size m and n, return the median of the two sorted arrays. The overall run time complexity should be O(log(m+n)).",
    followUps: [
      "This one's tricky — what's your instinct for getting to log time instead of just merging?",
      "Talk me through how binary search applies here. What are you searching over?",
      "How do you handle the partition when one array is much smaller than the other?",
      "What edge cases around empty arrays or even/odd total length are you accounting for?",
      "Can you state the final complexity and defend it?",
    ],
  },
};

const LANGUAGES = ["JavaScript", "Python", "Java", "C++"];

const STARTER_CODE = {
  JavaScript: "function solve(nums, target) {\n  // your code here\n}",
  Python: "def solve(nums, target):\n    # your code here\n    pass",
  Java: "class Solution {\n    public int[] solve(int[] nums, int target) {\n        // your code here\n    }\n}",
  "C++": "vector<int> solve(vector<int>& nums, int target) {\n    // your code here\n}",
};

const MOCK_HISTORY = [
  { id: "h1", type: "DSA", difficulty: "Medium", duration: 30, date: "Aug 24, 2026", score: 78, status: "Completed" },
  { id: "h2", type: "DSA", difficulty: "Easy", duration: 15, date: "Aug 18, 2026", score: 91, status: "Completed" },
  { id: "h3", type: "DSA", difficulty: "Hard", duration: 45, date: "Aug 10, 2026", score: 54, status: "Completed" },
];

const diffTone = (d) => (d === "Easy" ? "green" : d === "Medium" ? "amber" : "red");

const HERO_VARIANTS = [
  "Intervue runs a live mock interview with an AI interviewer that asks follow-ups, challenges weak reasoning, and gives you a real scorecard afterward — starting with DSA rounds.",
  "Practice realistic technical interviews with an AI interviewer that adapts to your answers, asks follow-ups, and evaluates how you think.",
  "Stop practicing interview questions alone. Face an AI interviewer that challenges your reasoning and tells you exactly where you need to improve.",
  "Choose your interview, meet your AI interviewer, solve real problems, and get a detailed performance scorecard when you're done.",
];

const FAQS = [
  { q: "What is Intervue?", a: "Intervue is an AI-powered mock interview platform that lets you practice realistic interviews with an AI interviewer and receive detailed feedback afterward." },
  { q: "How does an AI interview work?", a: "You schedule an interview, join the interview room, and interact with an AI interviewer that asks questions, follows up on your answers, and evaluates your performance." },
  { q: "What types of interviews can I practice?", a: "Intervue is starting with DSA interviews, with the architecture designed to support technical, system design, behavioral, HR, and other interview types later." },
  { q: "Can the AI ask follow-up questions?", a: "Yes. The interviewer is designed to ask follow-up questions based on your answers rather than simply following a fixed list of questions." },
  { q: "Do I receive feedback after the interview?", a: "Yes. After completing an interview, you receive a scorecard covering areas such as problem solving, communication, code quality, complexity analysis, and more." },
  { q: "Can I choose the difficulty?", a: "Yes. For DSA interviews, users can choose Easy, Medium, or Hard." },
];

/* =========================================================================
   SMALL UI PRIMITIVES
   ========================================================================= */

function GradientButton({ children, onClick, className = "", disabled, type = "button" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white
        bg-gradient-to-r from-[#6D5EF8] to-[#4C3FE0] shadow-[0_8px_20px_-6px_rgba(76,63,224,0.55)]
        hover:shadow-[0_10px_26px_-6px_rgba(76,63,224,0.7)] hover:-translate-y-0.5 active:translate-y-0
        transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none ${className}`}
    >
      {children}
    </button>
  );
}

function GhostButton({ children, onClick, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold
        text-[var(--ink)] bg-[var(--surface)] border border-[var(--ink)]/10 hover:border-[var(--ink)]/25 hover:-translate-y-0.5
        transition-all duration-200 ${className}`}
    >
      {children}
    </button>
  );
}

function Card({ children, className = "" }) {
  return (
    <div className={`rounded-2xl bg-[var(--surface)] border border-[var(--ink)]/8 shadow-[0_1px_0_rgba(18,18,43,0.04)] transition-colors duration-300 ${className}`}>
      {children}
    </div>
  );
}

function Badge({ children, tone = "violet" }) {
  const tones = {
    violet: "bg-[#6D5EF8]/12 text-[#8577FF]",
    green: "bg-[#22C97A]/14 text-[#1FAE6C]",
    amber: "bg-[#F5A623]/14 text-[#D98D0E]",
    red: "bg-[#FF5C7A]/14 text-[#E24468]",
    ink: "bg-[var(--ink)]/6 text-[var(--ink)]/70",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap ${tones[tone]}`}>
      {children}
    </span>
  );
}

/* Signature motif: pulsing listening ring around the AI avatar */
function PulseAvatar({ size = 64, speaking = false, label }) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {speaking && (
        <>
          <span className="absolute inset-0 rounded-full bg-[#6D5EF8]/30 animate-ping" style={{ animationDuration: "1.6s" }} />
          <span className="absolute -inset-2 rounded-full border border-[#6D5EF8]/30 animate-pulse" />
        </>
      )}
      <div
        className="relative rounded-full bg-gradient-to-br from-[#6D5EF8] to-[#4C3FE0] flex items-center justify-center text-white shadow-lg"
        style={{ width: size, height: size }}
      >
        <Sparkles size={size * 0.4} />
      </div>
      {label && (
        <span className="absolute -bottom-1 -right-1 flex items-center justify-center w-5 h-5 rounded-full bg-white shadow border border-black/10">
          <AudioLines size={11} className={speaking ? "text-[#4C3FE0]" : "text-black/30"} />
        </span>
      )}
    </div>
  );
}

function ScoreRing({ score, size = 96 }) {
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

/* Sun/Moon toggle — used in the landing header and the app sidebar */
function ThemeToggle({ dark, onToggle, size = "md" }) {
  const dim = size === "sm" ? "w-8 h-8" : "w-10 h-10";
  return (
    <button
      onClick={onToggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
      className={`relative ${dim} shrink-0 rounded-xl flex items-center justify-center border border-[var(--ink)]/10
        bg-[var(--surface)] text-[var(--ink)]/70 hover:border-[var(--ink)]/25 hover:text-[var(--ink)]
        transition-colors duration-300`}
    >
      <span className="relative w-4 h-4">
        <Sun size={16} className={`absolute inset-0 transition-all duration-300 ${dark ? "opacity-0 rotate-90 scale-50" : "opacity-100 rotate-0 scale-100"}`} />
        <Moon size={16} className={`absolute inset-0 transition-all duration-300 ${dark ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-50"}`} />
      </span>
    </button>
  );
}

/* Rotating hero description — fades between variants, respects reduced-motion,
   pauses on hover, and reserves a fixed height so the layout never jumps. */
function RotatingHeroText({ variants }) {
  const [index, setIndex] = useState(0);
  const [fading, setFading] = useState(false);
  const pausedRef = useRef(false);
  const reducedRef = useRef(false);

  useEffect(() => {
    reducedRef.current = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
  }, []);

  useEffect(() => {
    if (reducedRef.current) return; // static text for users who asked for less motion
    const id = setInterval(() => {
      if (pausedRef.current) return;
      setFading(true);
      setTimeout(() => {
        setIndex((i) => (i + 1) % variants.length);
        setFading(false);
      }, 300);
    }, 5200);
    return () => clearInterval(id);
  }, [variants.length]);

  return (
    <div
      className="mt-5 min-h-[100px] sm:min-h-[76px] max-w-md"
      onMouseEnter={() => { pausedRef.current = true; }}
      onMouseLeave={() => { pausedRef.current = false; }}
    >
      <p
        className={`text-[17px] leading-relaxed text-[var(--ink)]/62 transition-all duration-300 ease-out ${
          fading ? "opacity-0 translate-y-1" : "opacity-100 translate-y-0"
        }`}
      >
        {variants[index]}
      </p>
    </div>
  );
}

/* FAQ accordion */
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

function FAQSection() {
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

/* =========================================================================
   APP SHELL (post-login)
   ========================================================================= */

function AppShell({ active, onNav, onLogout, dark, onToggleDark, children }) {
  const nav = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "history", label: "History", icon: History },
  ];
  return (
    <div
      className="min-h-screen bg-[var(--bg)] flex transition-colors duration-300"
      style={{ ...themeVars(dark), fontFamily: "'Inter', sans-serif" }}
    >
      <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-[var(--ink)]/8 bg-[var(--surface)] p-5 transition-colors duration-300">
        <div className="flex items-center justify-between px-1 mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6D5EF8] to-[#4C3FE0] flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="font-bold text-[17px] text-[var(--ink)]" style={disp}>Intervue</span>
          </div>
          <ThemeToggle dark={dark} onToggle={onToggleDark} size="sm" />
        </div>
        <nav className="flex flex-col gap-1">
          {nav.map((n) => (
            <button
              key={n.id}
              onClick={() => onNav(n.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                active === n.id ? "bg-[#6D5EF8]/12 text-[#8577FF]" : "text-[var(--ink)]/60 hover:bg-[var(--ink)]/5"
              }`}
            >
              <n.icon size={17} /> {n.label}
            </button>
          ))}
        </nav>
        <div className="mt-auto pt-4 border-t border-[var(--ink)]/8">
          <button onClick={onLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[var(--ink)]/50 hover:bg-[var(--ink)]/5 w-full">
            <LogOut size={17} /> Log out
          </button>
        </div>
      </aside>
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}

/* =========================================================================
   LANDING PAGE
   ========================================================================= */

function Landing({ onSchedule, onLogin, dark, onToggleDark }) {
  return (
    <div className="min-h-screen bg-[var(--bg)] transition-colors duration-300" style={{ ...themeVars(dark), fontFamily: "'Inter', sans-serif" }}>
      <header className="max-w-7xl mx-auto flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6D5EF8] to-[#4C3FE0] flex items-center justify-center">
            <Sparkles size={17} className="text-white" />
          </div>
          <span className="font-bold text-xl text-[var(--ink)]" style={disp}>Intervue</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[var(--ink)]/65">
          <a href="#how" className="hover:text-[var(--ink)]">How it works</a>
          <a href="#features" className="hover:text-[var(--ink)]">Features</a>
          <a href="#faq" className="hover:text-[var(--ink)]">FAQs</a>
          <a href="#pricing" className="hover:text-[var(--ink)]">Pricing</a>
        </nav>
        <div className="flex items-center gap-3">
          <ThemeToggle dark={dark} onToggle={onToggleDark} />
          <GhostButton onClick={onLogin} className="hidden sm:inline-flex px-4 py-2">Log in</GhostButton>
          <GradientButton onClick={onSchedule} className="px-4 py-2 text-[13px]">Schedule Interview</GradientButton>
        </div>
      </header>

      {/* HERO */}
      <section className="max-w-7xl mx-auto px-6 pt-10 pb-20 grid lg:grid-cols-2 gap-14 items-center">
        <div>
          <Badge>
            <Sparkles size={12} /> AI-POWERED INTERVIEWS
          </Badge>
          <h1 className="mt-6 text-[44px] sm:text-[54px] leading-[1.05] font-bold text-[var(--ink)]" style={disp}>
            Practice. Prepare.
            <span className="block bg-gradient-to-r from-[#6D5EF8] to-[#4C3FE0] bg-clip-text text-transparent">
              Ace your next interview.
            </span>
          </h1>
          <RotatingHeroText variants={HERO_VARIANTS} />
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <GradientButton onClick={onSchedule} className="px-6 py-3 text-[15px]">
              Schedule DSA Interview <ChevronRight size={16} />
            </GradientButton>
            <GhostButton className="px-6 py-3 text-[15px]"><Play size={15} /> Watch demo</GhostButton>
          </div>
          <div className="mt-9 flex items-center gap-3">
            <div className="flex -space-x-2">
              {["#6D5EF8", "#4C3FE0", "#22C97A", "#F5A623"].map((c, i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-[var(--surface)]" style={{ background: c }} />
              ))}
            </div>
            <div className="flex items-center gap-1 text-[13px] text-[var(--ink)]/60">
              <div className="flex text-[#F5A623]">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={13} fill="currentColor" strokeWidth={0} />)}
              </div>
              <span className="ml-1 font-medium text-[var(--ink)]/70">Built by a solo dev, tested every day</span>
            </div>
          </div>
        </div>

        {/* Hero visual — same pulse-ring language as the actual interview room.
            Kept intentionally dark in both themes: it represents a video call preview. */}
        <Card className="p-4 sm:p-5">
          <div className="rounded-xl bg-[#12122B] aspect-[4/3] relative overflow-hidden flex flex-col items-center justify-center">
            <div className="absolute top-3 left-3 flex items-center gap-1.5 text-[11px] text-white/70 bg-white/10 rounded-full px-2.5 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C97A]" /> Interviewer live
            </div>
            <PulseAvatar size={92} speaking label />
            <p className="mt-5 text-white/50 text-[11px] tracking-wide font-medium">AI INTERVIEWER</p>
            <div className="absolute bottom-4 left-4 right-4 bg-white/10 backdrop-blur rounded-xl px-4 py-3 text-white/90 text-[13px]">
              "Before you write code — walk me through your approach first."
            </div>
            <div className="absolute top-3 right-3 w-16 h-20 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center text-white/60 text-[10px]">
              You
            </div>
          </div>
        </Card>
      </section>

      {/* FEATURES */}
      <section id="features" className="max-w-7xl mx-auto px-6 pb-6">
        <Card className="grid sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[var(--ink)]/8 p-6 gap-6 sm:gap-0">
          {[
            { icon: Code2, title: "DSA interviews", desc: "Coding, problem-solving, and reasoning under real pressure." },
            { icon: Brain, title: "AI that adapts", desc: "Follow-ups and difficulty shift based on how you're doing." },
            { icon: Video, title: "In-browser calls", desc: "Mic + camera, right from your browser, no install." },
            { icon: BarChart3, title: "Real feedback", desc: "A scorecard across nine dimensions, not just pass/fail." },
          ].map((f, i) => (
            <div key={i} className={`px-0 sm:px-6 ${i > 0 ? "pt-6 sm:pt-0" : ""}`}>
              <div className="w-9 h-9 rounded-lg bg-[#6D5EF8]/10 flex items-center justify-center text-[#4C3FE0] mb-3">
                <f.icon size={17} />
              </div>
              <h3 className="font-semibold text-[15px] text-[var(--ink)]">{f.title}</h3>
              <p className="text-[13px] text-[var(--ink)]/55 mt-1 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </Card>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center text-[var(--ink)]" style={disp}>How it works</h2>
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { n: "01", t: "Schedule", d: "Pick a type, difficulty, and time that suits you.", icon: Calendar },
            { n: "02", t: "Join", d: "Open the interview room from your browser.", icon: Video },
            { n: "03", t: "Solve & discuss", d: "Work the problem while the AI probes your thinking.", icon: Code2 },
            { n: "04", t: "Get feedback", d: "Receive a detailed scorecard and next steps.", icon: BarChart3 },
          ].map((s, i) => (
            <Card key={i} className="p-5 relative">
              <span className="text-[11px] font-bold text-[#6D5EF8]/60" style={mono}>{s.n}</span>
              <div className="w-9 h-9 mt-2 rounded-lg bg-[var(--ink)]/5 flex items-center justify-center text-[var(--ink)]/70">
                <s.icon size={16} />
              </div>
              <h3 className="font-semibold text-[15px] mt-3 text-[var(--ink)]">{s.t}</h3>
              <p className="text-[13px] text-[var(--ink)]/55 mt-1 leading-relaxed">{s.d}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
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

      {/* PRICING */}
      <section id="pricing" className="max-w-7xl mx-auto px-6 pb-20">
        <h2 className="text-3xl font-bold text-center text-[var(--ink)]" style={disp}>Simple pricing</h2>
        <div className="mt-10 grid sm:grid-cols-3 gap-5 max-w-4xl mx-auto">
          {[
            { name: "Free", price: "₹0", d: "2 interviews / month", cta: "Start free" },
            { name: "Pro", price: "₹499", d: "Unlimited interviews", cta: "Go Pro", highlight: true },
            { name: "Teams", price: "Custom", d: "For bootcamps & colleges", cta: "Contact us" },
          ].map((p, i) => (
            <Card key={i} className={`p-6 ${p.highlight ? "border-[#6D5EF8]/40 ring-2 ring-[#6D5EF8]/20" : ""}`}>
              {p.highlight && <Badge>Most popular</Badge>}
              <h3 className="font-semibold text-[15px] mt-3 text-[var(--ink)]">{p.name}</h3>
              <p className="text-3xl font-bold mt-2 text-[var(--ink)]" style={disp}>{p.price}<span className="text-sm font-normal text-[var(--ink)]/40">/mo</span></p>
              <p className="text-[13px] text-[var(--ink)]/55 mt-2">{p.d}</p>
              {p.highlight ? <GradientButton className="w-full mt-5">{p.cta}</GradientButton> : <GhostButton className="w-full mt-5">{p.cta}</GhostButton>}
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <FAQSection />

      {/* FINAL CTA */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="rounded-3xl bg-gradient-to-br from-[#6D5EF8] to-[#4C3FE0] px-8 py-14 text-center relative overflow-hidden">
          <h2 className="text-3xl sm:text-4xl font-bold text-white" style={disp}>Ready for a real practice round?</h2>
          <p className="text-white/75 mt-3">No recruiter watching. Just you, a problem, and an interviewer that won't let you off easy.</p>
          <GradientButton onClick={onSchedule} className="mt-7 !bg-white !bg-none !text-[#4C3FE0] px-7 py-3">
            Schedule your interview <ChevronRight size={16} />
          </GradientButton>
        </div>
      </section>

      <footer className="border-t border-[var(--ink)]/8 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] text-[var(--ink)]/50">
          <span>© 2026 Intervue. Practice with pressure, not pretense.</span>
          <div className="flex items-center gap-4">
            <span className="hover:text-[var(--ink)] cursor-pointer">GitHub</span>
            <span className="hover:text-[var(--ink)] cursor-pointer">Twitter</span>
            <span className="hover:text-[var(--ink)] cursor-pointer">LinkedIn</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* =========================================================================
   DASHBOARD
   ========================================================================= */

function Dashboard({ user, history, upcoming, onSchedule, onJoin, onNav }) {
  const avg = Math.round(history.reduce((a, h) => a + h.score, 0) / (history.length || 1));
  return (
    <div className="p-6 sm:p-10 max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--ink)]" style={disp}>Welcome back, {user.name.split(" ")[0]}</h1>
          <p className="text-sm text-[var(--ink)]/50 mt-1">Here's where your practice stands.</p>
        </div>
        <GradientButton onClick={onSchedule}><Calendar size={15} /> Schedule Interview</GradientButton>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <Card className="p-5">
          <div className="flex items-center gap-2 text-[var(--ink)]/50 text-xs font-medium"><TrendingUp size={14} /> Average score</div>
          <p className="text-3xl font-bold mt-2 text-[var(--ink)]" style={disp}>{history.length ? avg : "—"}</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-2 text-[var(--ink)]/50 text-xs font-medium"><Award size={14} /> Interviews done</div>
          <p className="text-3xl font-bold mt-2 text-[var(--ink)]" style={disp}>{history.length}</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-2 text-[var(--ink)]/50 text-xs font-medium"><Target size={14} /> Focus area</div>
          <p className="text-lg font-semibold mt-2 text-[var(--ink)]">{history.length ? "Time complexity" : "Take your first round"}</p>
        </Card>
      </div>

      {upcoming ? (
        <Card className="p-5 mb-6 flex items-center justify-between flex-wrap gap-4 border-[#6D5EF8]/30">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-[#6D5EF8]/10 flex items-center justify-center text-[#4C3FE0]"><Clock size={18} /></div>
            <div>
              <p className="font-semibold text-sm text-[var(--ink)]">{upcoming.type} · {upcoming.difficulty}</p>
              <p className="text-xs text-[var(--ink)]/50 mt-0.5">{upcoming.date} at {upcoming.time} · {upcoming.duration} min</p>
            </div>
          </div>
          <GradientButton onClick={onJoin}>Join now <ChevronRight size={14} /></GradientButton>
        </Card>
      ) : (
        <Card className="p-6 mb-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="font-semibold text-sm text-[var(--ink)]">No upcoming interview</p>
            <p className="text-xs text-[var(--ink)]/50 mt-1">Schedule one, or jump straight into a quick-start round.</p>
          </div>
          <GhostButton onClick={onSchedule}>Quick start <Zap size={14} /></GhostButton>
        </Card>
      )}

      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-[var(--ink)]">Recent interviews</h2>
        <button onClick={() => onNav("history")} className="text-xs font-semibold text-[#4C3FE0]">View all</button>
      </div>
      <Card className="divide-y divide-[var(--ink)]/6">
        {history.length === 0 && <p className="p-6 text-sm text-[var(--ink)]/45">Nothing here yet — your first interview will show up after you finish it.</p>}
        {history.slice(0, 3).map((h) => (
          <div key={h.id} className="p-4 flex items-center gap-4">
            <ScoreRing score={h.score} size={40} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-semibold text-[var(--ink)]">{h.type}</p>
                <Badge tone={diffTone(h.difficulty)}>{h.difficulty}</Badge>
              </div>
              <p className="text-xs text-[var(--ink)]/45 mt-0.5">{h.date} · {h.duration} min</p>
            </div>
            <Badge tone="ink">{h.status}</Badge>
          </div>
        ))}
      </Card>
    </div>
  );
}

/* =========================================================================
   HISTORY
   ========================================================================= */

function HistoryPage({ history, onOpen }) {
  return (
    <div className="p-6 sm:p-10 max-w-5xl">
      <h1 className="text-2xl font-bold text-[var(--ink)]" style={disp}>Interview history</h1>
      <p className="text-sm text-[var(--ink)]/50 mt-1 mb-6">{history.length} interview{history.length !== 1 && "s"} completed</p>
      <Card className="divide-y divide-[var(--ink)]/6">
        {history.length === 0 && <p className="p-6 text-sm text-[var(--ink)]/45">No interviews yet.</p>}
        {history.map((h) => (
          <button key={h.id} onClick={() => onOpen(h)} className="w-full text-left p-4 flex items-center gap-4 hover:bg-[var(--ink)]/3 transition-colors">
            <ScoreRing score={h.score} size={48} />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-semibold text-[var(--ink)]">{h.type}</p>
                <Badge tone={diffTone(h.difficulty)}>{h.difficulty}</Badge>
              </div>
              <p className="text-xs text-[var(--ink)]/45 mt-1">{h.date} · {h.duration} min</p>
            </div>

            {/* Score kept in its own column, well clear of the colored difficulty
                badge above, so nothing competes with it for attention. */}
            <div className="text-right shrink-0 pl-3">
              <p className="text-lg font-bold text-[var(--ink)] leading-none" style={disp}>
                {h.score}<span className="text-xs font-normal text-[var(--ink)]/40">/100</span>
              </p>
              <div className="mt-1.5"><Badge tone="ink">{h.status}</Badge></div>
            </div>

            <ChevronRight size={16} className="text-[var(--ink)]/30 shrink-0" />
          </button>
        ))}
      </Card>
    </div>
  );
}

/* =========================================================================
   SCHEDULE FLOW
   ========================================================================= */

function ScheduleFlow({ onBack, onConfirm }) {
  const [type, setType] = useState("dsa");
  const [difficulty, setDifficulty] = useState("Medium");
  const [duration, setDuration] = useState(30);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [role, setRole] = useState("");
  const [instructions, setInstructions] = useState("");
  const canConfirm = date && time;
  const inputCls = "w-full mt-2 rounded-xl border border-[var(--ink)]/12 bg-[var(--surface)] text-[var(--ink)] px-3 py-2.5 text-sm outline-none focus:border-[#6D5EF8]";

  return (
    <div className="p-6 sm:p-10 max-w-2xl">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-[var(--ink)]/50 mb-6 hover:text-[var(--ink)]">
        <ArrowLeft size={15} /> Back
      </button>
      <h1 className="text-2xl font-bold text-[var(--ink)]" style={disp}>Schedule an interview</h1>
      <p className="text-sm text-[var(--ink)]/50 mt-1 mb-8">Set it up the way you want to be tested.</p>

      <Card className="p-6 space-y-6">
        <div>
          <label className="text-xs font-semibold text-[var(--ink)]/60 uppercase tracking-wide">Interview type</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
            {INTERVIEW_TYPES.map((t) => (
              <button
                key={t.id}
                disabled={!t.live}
                onClick={() => setType(t.id)}
                className={`p-3 rounded-xl border text-left transition-colors ${
                  type === t.id ? "border-[#6D5EF8] bg-[#6D5EF8]/5" : "border-[var(--ink)]/10"
                } ${!t.live && "opacity-40 cursor-not-allowed"}`}
              >
                <t.icon size={15} className="text-[#4C3FE0]" />
                <p className="text-xs font-semibold mt-1.5 text-[var(--ink)]">{t.label}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-[var(--ink)]/60 uppercase tracking-wide">Difficulty</label>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {["Easy", "Medium", "Hard"].map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`py-2.5 rounded-xl border text-sm font-semibold transition-colors ${
                  difficulty === d ? "border-[#6D5EF8] bg-[#6D5EF8]/5 text-[#4C3FE0]" : "border-[var(--ink)]/10 text-[var(--ink)]/60"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-[var(--ink)]/60 uppercase tracking-wide">Duration</label>
          <div className="grid grid-cols-4 gap-2 mt-2">
            {[15, 30, 45, 60].map((d) => (
              <button
                key={d}
                onClick={() => setDuration(d)}
                className={`py-2.5 rounded-xl border text-sm font-semibold transition-colors ${
                  duration === d ? "border-[#6D5EF8] bg-[#6D5EF8]/5 text-[#4C3FE0]" : "border-[var(--ink)]/10 text-[var(--ink)]/60"
                }`}
              >
                {d}m
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-[var(--ink)]/60 uppercase tracking-wide">Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--ink)]/60 uppercase tracking-wide">Time</label>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className={inputCls} />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-[var(--ink)]/60 uppercase tracking-wide">Target role (optional)</label>
          <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Frontend Developer @ a product startup" className={inputCls} />
        </div>

        <div>
          <label className="text-xs font-semibold text-[var(--ink)]/60 uppercase tracking-wide">Custom instructions (optional)</label>
          <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} rows={2}
            placeholder="e.g. Go easy on system design, focus on arrays and strings"
            className={`${inputCls} resize-none`} />
        </div>

        <GradientButton
          className="w-full py-3"
          disabled={!canConfirm}
          onClick={() => onConfirm({ type: "DSA", difficulty, duration, date, time, role })}
        >
          Confirm interview <ChevronRight size={15} />
        </GradientButton>
      </Card>
    </div>
  );
}

/* =========================================================================
   INTERVIEW ROOM — the core AI interviewer engine
   (Kept intentionally dark regardless of site theme — a focus-mode call UI,
   not part of the light/dark toggle scope.)
   ========================================================================= */

function buildScript(difficulty) {
  const q = QUESTION_BANK[difficulty.toLowerCase()];
  const lines = [
    { ai: `Hi, welcome to your ${difficulty.toLowerCase()} DSA interview. We'll work through one problem together, and I'll be asking follow-ups as we go. Ready to start?` },
    { waitUser: true },
    { ai: `Great. Here's the problem: "${q.title}." ${q.statement}` },
    { waitUser: true },
  ];
  q.followUps.forEach((f) => {
    lines.push({ ai: f });
    lines.push({ waitUser: true });
  });
  lines.push({ ai: "Good work — that's a wrap on this problem. Take a breath, we're done here. Click 'End interview' when you're ready to see your feedback." });
  return lines;
}

function speak(text) {
  try {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 1.02;
      u.pitch = 1.0;
      window.speechSynthesis.speak(u);
    }
  } catch (e) {
    /* speech synthesis unavailable — silently degrade to text-only */
  }
}

function InterviewRoom({ config, onEnd }) {
  const q = QUESTION_BANK[config.difficulty.toLowerCase()];
  const scriptRef = useRef(buildScript(config.difficulty));
  const [stepIdx, setStepIdx] = useState(0);
  const [messages, setMessages] = useState([]);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);
  const [waitingForUser, setWaitingForUser] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [seconds, setSeconds] = useState(config.duration * 60);
  const [tab, setTab] = useState("transcript");
  const [lang, setLang] = useState("JavaScript");
  const [code, setCode] = useState(STARTER_CODE.JavaScript);
  const [output, setOutput] = useState(null);
  const [running, setRunning] = useState(false);
  const [ended, setEnded] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const transcriptEndRef = useRef(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (ended) return;
    const t = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [ended]);

  useEffect(() => {
    let active = true;
    if (camOn) {
      navigator.mediaDevices?.getUserMedia?.({ video: true, audio: false })
        .then((stream) => {
          if (!active) return;
          streamRef.current = stream;
          if (videoRef.current) videoRef.current.srcObject = stream;
        })
        .catch(() => { /* no camera access in this environment — fine, tile shows a fallback */ });
    } else {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    }
    return () => { active = false; };
  }, [camOn]);

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    window.speechSynthesis?.cancel();
  }, []);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, aiThinking]);

  const pushAiLine = useCallback((text) => {
    setAiThinking(true);
    setTimeout(() => {
      setAiThinking(false);
      setAiSpeaking(true);
      setMessages((m) => [...m, { from: "ai", text }]);
      speak(text);
      const estMs = Math.min(5200, Math.max(1400, text.length * 42));
      setTimeout(() => setAiSpeaking(false), estMs);
    }, 900 + Math.random() * 700);
  }, []);

  const advance = useCallback((idx) => {
    const script = scriptRef.current;
    if (idx >= script.length) return;
    const step = script[idx];
    if (step.waitUser) {
      setWaitingForUser(true);
    } else {
      pushAiLine(step.ai);
      setStepIdx(idx + 1);
      setTimeout(() => advance(idx + 1), 100);
    }
  }, [pushAiLine]);

  useEffect(() => {
    if (!startedRef.current) {
      startedRef.current = true;
      advance(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submitAnswer = () => {
    if (!userInput.trim()) return;
    setMessages((m) => [...m, { from: "user", text: userInput.trim() }]);
    setUserInput("");
    setWaitingForUser(false);
    const next = stepIdx + 1;
    setStepIdx(next);
    setTimeout(() => advance(next), 200);
  };

  const runCode = () => {
    setRunning(true);
    setOutput(null);
    setTimeout(() => {
      setRunning(false);
      setOutput({
        ok: code.trim().length > STARTER_CODE[lang].length,
        text: code.trim().length > STARTER_CODE[lang].length
          ? "Sample tests passed (2/2). This is a mocked run — wire up a real sandboxed executor in production."
          : "No changes detected from the starter code — write your solution before running.",
      });
    }, 900);
  };

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  const finishInterview = () => {
    setEnded(true);
    window.speechSynthesis?.cancel();
    onEnd({ messages, config, q });
  };

  return (
    <div className="min-h-screen bg-[#0D0D1F] text-white flex flex-col">
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#6D5EF8] to-[#4C3FE0] flex items-center justify-center">
            <Sparkles size={13} />
          </div>
          <span className="text-sm font-semibold" style={disp}>{q.title}</span>
          <Badge tone="violet">{config.difficulty}</Badge>
        </div>
        <div className="flex items-center gap-2 text-sm font-mono bg-white/5 rounded-lg px-3 py-1.5" style={mono}>
          <Clock size={13} /> {mm}:{ss}
        </div>
      </div>

      <div className="flex-1 grid lg:grid-cols-[1fr_400px] min-h-0">
        <div className="flex flex-col min-h-0 border-r border-white/10">
          <div className="p-5 flex items-center gap-4 border-b border-white/10 bg-white/[0.02]">
            <PulseAvatar size={56} speaking={aiSpeaking || aiThinking} label />
            <div>
              <p className="text-sm font-semibold">AI Interviewer</p>
              <p className="text-xs text-white/40">{aiThinking ? "thinking…" : aiSpeaking ? "speaking…" : "listening"}</p>
            </div>
            <div className="ml-auto flex gap-1 bg-white/5 rounded-lg p-1">
              <button onClick={() => setTab("transcript")} className={`px-3 py-1.5 rounded-md text-xs font-semibold ${tab === "transcript" ? "bg-white/15" : "text-white/50"}`}>Transcript</button>
              <button onClick={() => setTab("code")} className={`px-3 py-1.5 rounded-md text-xs font-semibold ${tab === "code" ? "bg-white/15" : "text-white/50"}`}>Code editor</button>
            </div>
          </div>

          {tab === "transcript" ? (
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    m.from === "user" ? "bg-[#6D5EF8] text-white rounded-br-sm" : "bg-white/8 text-white/90 rounded-bl-sm"
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {aiThinking && (
                <div className="flex justify-start">
                  <div className="bg-white/8 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <span key={i} className="w-1.5 h-1.5 rounded-full bg-white/50 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={transcriptEndRef} />
            </div>
          ) : (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="px-5 py-3 border-b border-white/10 text-xs text-white/50 leading-relaxed">{q.statement}</div>
              <div className="flex items-center justify-between px-5 py-2 border-b border-white/10">
                <select value={lang} onChange={(e) => { setLang(e.target.value); setCode(STARTER_CODE[e.target.value]); }}
                  className="bg-white/5 text-xs rounded-lg px-2.5 py-1.5 outline-none border border-white/10">
                  {LANGUAGES.map((l) => <option key={l} value={l} className="text-black">{l}</option>)}
                </select>
                <button onClick={runCode} disabled={running} className="flex items-center gap-1.5 text-xs font-semibold bg-[#22C97A]/20 text-[#4ADE9A] px-3 py-1.5 rounded-lg">
                  {running ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} />} Run
                </button>
              </div>
              <textarea value={code} onChange={(e) => setCode(e.target.value)} spellCheck={false}
                className="flex-1 bg-[#0A0A18] text-[#B8E6D0] text-[13px] p-4 outline-none resize-none" style={mono} />
              {output && (
                <div className={`px-4 py-3 text-xs border-t border-white/10 ${output.ok ? "text-[#4ADE9A]" : "text-[#FF8FA3]"}`} style={mono}>
                  {output.ok ? <CheckCircle2 size={12} className="inline mr-1.5" /> : <XCircle size={12} className="inline mr-1.5" />}
                  {output.text}
                </div>
              )}
            </div>
          )}

          {waitingForUser && (
            <div className="p-4 border-t border-white/10 bg-white/[0.02]">
              <div className="flex items-end gap-2">
                <textarea
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitAnswer(); } }}
                  placeholder={micOn ? "Speak or type your answer…" : "Type your answer…"}
                  rows={2}
                  className="flex-1 bg-white/5 rounded-xl px-3.5 py-2.5 text-sm outline-none resize-none border border-white/10 focus:border-[#6D5EF8]/50"
                />
                <button onClick={submitAnswer} className="p-3 rounded-xl bg-[#6D5EF8]"><Send size={15} /></button>
              </div>
              <p className="text-[10px] text-white/30 mt-1.5">Mic is a UI placeholder in this prototype — type your answer to continue.</p>
            </div>
          )}
        </div>

        <div className="flex flex-col p-5 gap-4">
          <div className="rounded-xl bg-black aspect-video relative overflow-hidden flex items-center justify-center border border-white/10">
            {camOn ? (
              <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
            ) : (
              <div className="text-white/30 text-xs flex flex-col items-center gap-2"><VideoOff size={20} /> Camera off</div>
            )}
            <span className="absolute top-2 left-2 text-[10px] bg-black/50 rounded-full px-2 py-0.5">You</span>
          </div>
          <div className="flex items-center justify-center gap-3">
            <button onClick={() => setMicOn((v) => !v)} className={`p-3 rounded-full ${micOn ? "bg-white/10" : "bg-[#FF5C7A]/20 text-[#FF5C7A]"}`}>
              {micOn ? <Mic size={16} /> : <MicOff size={16} />}
            </button>
            <button onClick={() => setCamOn((v) => !v)} className={`p-3 rounded-full ${camOn ? "bg-white/10" : "bg-[#FF5C7A]/20 text-[#FF5C7A]"}`}>
              {camOn ? <Video size={16} /> : <VideoOff size={16} />}
            </button>
            <button onClick={finishInterview} className="p-3 rounded-full bg-[#FF5C7A] hover:bg-[#FF4568]"><PhoneOff size={16} /></button>
          </div>
          <Card className="!bg-white/[0.03] !border-white/10 p-4">
            <p className="text-xs font-semibold text-white/60 mb-2">Session notes</p>
            <ul className="text-[11px] text-white/40 space-y-1.5 leading-relaxed">
              <li>· {config.type} · {config.difficulty} · {config.duration} min</li>
              <li>· {messages.filter((m) => m.from === "user").length} answers given so far</li>
              {config.role && <li>· Target role: {config.role}</li>}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   FEEDBACK — generated from the transcript with simple, explainable heuristics
   ========================================================================= */

function generateFeedback(session) {
  const userMsgs = session.messages.filter((m) => m.from === "user");
  const totalWords = userMsgs.reduce((a, m) => a + m.text.split(/\s+/).length, 0);
  const avgWords = totalWords / (userMsgs.length || 1);
  const mentionsComplexity = userMsgs.some((m) => /o\(|log|complexity|time|space/i.test(m.text));
  const mentionsEdge = userMsgs.some((m) => /edge|empty|null|zero|duplicate/i.test(m.text));
  const answered = userMsgs.filter((m) => m.text.length > 15).length;

  const clamp = (n) => Math.max(30, Math.min(97, Math.round(n)));
  const base = clamp(45 + avgWords * 1.4 + answered * 4);

  const categories = [
    { label: "Problem solving", score: clamp(base + (answered >= 3 ? 6 : -6)) },
    { label: "Data structures knowledge", score: clamp(base - 2) },
    { label: "Algorithmic thinking", score: clamp(base + (mentionsComplexity ? 8 : -8)) },
    { label: "Code quality", score: clamp(base - 4) },
    { label: "Time complexity", score: clamp(mentionsComplexity ? base + 10 : base - 15) },
    { label: "Space complexity", score: clamp(mentionsComplexity ? base + 4 : base - 12) },
    { label: "Communication", score: clamp(base + (avgWords > 12 ? 8 : -6)) },
    { label: "Confidence", score: clamp(base + (avgWords > 8 ? 4 : -4)) },
    { label: "Handling follow-ups", score: clamp(base + (answered >= 4 ? 6 : -6)) },
  ];
  const overall = clamp(categories.reduce((a, c) => a + c.score, 0) / categories.length);

  const strengths = [];
  const weaknesses = [];
  if (mentionsComplexity) strengths.push("You proactively discussed time/space complexity without being asked twice.");
  else weaknesses.push("Complexity analysis was thin — state Big-O for every approach you propose, even unprompted.");
  if (mentionsEdge) strengths.push("You considered edge cases (empty input, duplicates) on your own.");
  else weaknesses.push("Edge cases weren't addressed — always narrate empty/null/duplicate scenarios before you finish.");
  if (avgWords > 12) strengths.push("Your explanations were detailed enough for an interviewer to follow your reasoning.");
  else weaknesses.push("Answers were quite short — narrate your thinking out loud, not just the final answer.");
  if (answered >= 4) strengths.push("You stayed engaged through every follow-up instead of giving one-line answers.");

  return {
    overall,
    categories,
    strengths: strengths.length ? strengths : ["You completed the full interview flow."],
    weaknesses: weaknesses.length ? weaknesses : ["No major gaps detected in this mock run."],
    summary: `You worked through "${session.q.title}" at ${session.config.difficulty} difficulty. ${
      overall >= 75 ? "Strong round overall — your reasoning was clear and you handled follow-ups well." :
      overall >= 50 ? "A solid attempt with room to tighten up complexity analysis and edge-case coverage." :
      "This one was rough — the fundamentals are there, but slow down and narrate your thinking more."
    }`,
    nextTopics: overall >= 75 ? ["Graphs & BFS/DFS", "Dynamic programming"] : ["Big-O fundamentals", "Two-pointer & sliding window patterns"],
  };
}

function FeedbackPage({ session, onBackToDashboard, onHistory }) {
  const fb = generateFeedback(session);
  return (
    <div className="p-6 sm:p-10 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--ink)]" style={disp}>Interview feedback</h1>
          <p className="text-sm text-[var(--ink)]/50 mt-1">{session.config.type} · {session.config.difficulty} · {session.config.duration} min</p>
        </div>
        <GhostButton onClick={onHistory}>View history</GhostButton>
      </div>

      <Card className="p-6 flex flex-col sm:flex-row items-center gap-6 mb-6">
        <ScoreRing score={fb.overall} size={110} />
        <div className="flex-1">
          <p className="text-sm text-[var(--ink)]/70 leading-relaxed">{fb.summary}</p>
          <div className="flex gap-2 mt-3 flex-wrap">
            {fb.nextTopics.map((t) => <Badge key={t} tone="violet">{t}</Badge>)}
          </div>
        </div>
      </Card>

      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-[var(--ink)] flex items-center gap-2 mb-3"><CheckCircle2 size={15} className="text-[#22C97A]" /> Strengths</h3>
          <ul className="space-y-2">
            {fb.strengths.map((s, i) => <li key={i} className="text-[13px] text-[var(--ink)]/65 leading-relaxed flex gap-2"><span className="text-[#22C97A] mt-0.5">·</span>{s}</li>)}
          </ul>
        </Card>
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-[var(--ink)] flex items-center gap-2 mb-3"><XCircle size={15} className="text-[#FF5C7A]" /> Areas to improve</h3>
          <ul className="space-y-2">
            {fb.weaknesses.map((s, i) => <li key={i} className="text-[13px] text-[var(--ink)]/65 leading-relaxed flex gap-2"><span className="text-[#FF5C7A] mt-0.5">·</span>{s}</li>)}
          </ul>
        </Card>
      </div>

      <Card className="p-5 mb-6">
        <h3 className="text-sm font-semibold text-[var(--ink)] mb-4">Scorecard by category</h3>
        <div className="space-y-3">
          {fb.categories.map((c) => (
            <div key={c.label} className="flex items-center gap-3">
              <span className="text-xs text-[var(--ink)]/60 w-44 shrink-0">{c.label}</span>
              <div className="flex-1 h-2 rounded-full bg-[var(--ink)]/8 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-[#6D5EF8] to-[#4C3FE0]" style={{ width: `${c.score}%` }} />
              </div>
              <span className="text-xs font-semibold text-[var(--ink)] w-8 text-right">{c.score}</span>
            </div>
          ))}
        </div>
      </Card>

      <GradientButton onClick={onBackToDashboard} className="px-6 py-3">Back to dashboard <ChevronRight size={15} /></GradientButton>
    </div>
  );
}

/* =========================================================================
   ROOT APP
   ========================================================================= */

export default function App() {
  useFonts();
  const [dark, setDark] = useState(false);
  const [screen, setScreen] = useState("landing"); // landing | dashboard | schedule | room | feedback | history
  const [user, setUser] = useState(null);
  const [upcoming, setUpcoming] = useState(null);
  const [history, setHistory] = useState(MOCK_HISTORY);
  const [activeConfig, setActiveConfig] = useState(null);
  const [lastSession, setLastSession] = useState(null);

  const toggleDark = () => setDark((d) => !d);

  const mockLogin = () => {
    setUser({ name: "Gagan Sharma", email: "gagan@example.com" });
    setScreen("dashboard");
  };

  const handleScheduleFromLanding = () => {
    if (!user) mockLogin();
    setScreen("schedule");
  };

  const handleConfirmSchedule = (cfg) => {
    setUpcoming(cfg);
    setScreen("dashboard");
  };

  const handleJoin = () => {
    setActiveConfig(upcoming || { type: "DSA", difficulty: "Medium", duration: 30 });
    setScreen("room");
  };

  const handleEndInterview = (session) => {
    const fb = generateFeedback(session);
    const entry = {
      id: `h${Date.now()}`,
      type: session.config.type,
      difficulty: session.config.difficulty,
      duration: session.config.duration,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      score: fb.overall,
      status: "Completed",
    };
    setHistory((h) => [entry, ...h]);
    setUpcoming(null);
    setLastSession(session);
    setScreen("feedback");
  };

  if (screen === "landing") return <Landing onSchedule={handleScheduleFromLanding} onLogin={mockLogin} dark={dark} onToggleDark={toggleDark} />;

  if (screen === "schedule") {
    return (
      <AppShell active="dashboard" onNav={setScreen} onLogout={() => setScreen("landing")} dark={dark} onToggleDark={toggleDark}>
        <ScheduleFlow onBack={() => setScreen(user ? "dashboard" : "landing")} onConfirm={handleConfirmSchedule} />
      </AppShell>
    );
  }

  if (screen === "room" && activeConfig) {
    return <InterviewRoom config={activeConfig} onEnd={handleEndInterview} />;
  }

  if (screen === "feedback" && lastSession) {
    return (
      <AppShell active="history" onNav={setScreen} onLogout={() => setScreen("landing")} dark={dark} onToggleDark={toggleDark}>
        <FeedbackPage session={lastSession} onBackToDashboard={() => setScreen("dashboard")} onHistory={() => setScreen("history")} />
      </AppShell>
    );
  }

  if (screen === "history") {
    return (
      <AppShell active="history" onNav={setScreen} onLogout={() => setScreen("landing")} dark={dark} onToggleDark={toggleDark}>
        <HistoryPage history={history} onOpen={() => {}} />
      </AppShell>
    );
  }

  return (
    <AppShell active="dashboard" onNav={setScreen} onLogout={() => setScreen("landing")} dark={dark} onToggleDark={toggleDark}>
      <Dashboard
        user={user || { name: "Guest" }}
        history={history}
        upcoming={upcoming}
        onSchedule={() => setScreen("schedule")}
        onJoin={handleJoin}
        onNav={setScreen}
      />
    </AppShell>
  );
}