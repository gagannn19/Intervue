import { Code2, LayoutDashboard, MessageSquare, Terminal, Users } from "lucide-react";

// DSA is the only live round for now — the rest are placeholders so the UI
// (and the architecture) already supports more interview types later.
export const INTERVIEW_TYPES = [
  { id: "dsa", label: "DSA", desc: "Data structures & algorithms", icon: Code2, live: true },
  { id: "system-design", label: "System Design", desc: "Architecture & scale", icon: LayoutDashboard, live: false },
  { id: "behavioral", label: "Behavioral", desc: "Situational & story-based", icon: MessageSquare, live: false },
  { id: "frontend", label: "Frontend", desc: "JS, React, CSS internals", icon: Terminal, live: false },
  { id: "hr", label: "HR Round", desc: "Culture fit & expectations", icon: Users, live: false },
];
