import { Code2, LayoutDashboard, MessageSquare, Terminal, Users } from "lucide-react";

// The interview-type catalog lives in the backend (interview_types table,
// GET /interview-types). This file supplies the frontend-only bits the
// API can't carry — the icon per type — plus a static fallback list used
// by the classic SchedulePage, which doesn't fetch.

// slug -> icon. Extend this when a new type is added to the backend.
export const INTERVIEW_TYPE_META = {
  dsa: { icon: Code2 },
  "system-design": { icon: LayoutDashboard },
  behavioral: { icon: MessageSquare },
  frontend: { icon: Terminal },
  hr: { icon: Users },
};

// Static fallback — DSA is the only live round for now. Kept in sync with
// the seed (prisma/seed.ts). The wizard prefers the API; this is what the
// classic SchedulePage renders.
export const INTERVIEW_TYPES = [
  { id: "dsa", label: "DSA", desc: "Data structures & algorithms", icon: Code2, live: true },
  { id: "system-design", label: "System Design", desc: "Architecture & scale", icon: LayoutDashboard, live: false },
  { id: "behavioral", label: "Behavioral", desc: "Situational & story-based", icon: MessageSquare, live: false },
  { id: "frontend", label: "Frontend", desc: "JS, React, CSS internals", icon: Terminal, live: false },
  { id: "hr", label: "HR Round", desc: "Culture fit & expectations", icon: Users, live: false },
];
