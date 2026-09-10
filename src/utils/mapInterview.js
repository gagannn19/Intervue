// Converts a raw interview record from the backend (enum casing like
// "EASY", "IN_PROGRESS", raw ISO timestamps) into the display shape the
// existing UI components already expect ("Easy", "In progress", separate
// date/time strings). Keeps the backend RESTful and the frontend
// components unchanged.

function titleCase(word) {
  return word.charAt(0) + word.slice(1).toLowerCase();
}

export function mapInterviewRecord(record) {
  const scheduled = new Date(record.scheduledAt);
  return {
    id: record.id,
    type: record.interviewType?.name || "DSA",
    difficulty: titleCase(record.difficulty),
    duration: record.duration,
    date: scheduled.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    time: scheduled.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
    status: titleCase(record.status.replace("_", " ")),
    rawStatus: record.status,
    role: record.role,
    startedAt: record.startedAt,
    // A real score/summary once the backend has persisted one via
    // /complete — null just means "not completed yet", not "zero".
    score: typeof record.score === "number" ? record.score : null,
    feedbackSummary: record.feedbackSummary || null,
    // Company-targeting fields — null for interviews scheduled via the
    // "Custom Settings" path or before that feature existed.
    company: record.targetCompany || null,
    position: record.targetPosition || null,
    salaryMin: typeof record.salaryMin === "number" ? record.salaryMin : null,
    salaryMax: typeof record.salaryMax === "number" ? record.salaryMax : null,
  };
}
