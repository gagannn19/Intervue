import { useEffect } from "react";
import { Lock, Hourglass, X, Loader2 } from "lucide-react";
import { GradientButton } from "../ui/GradientButton";
import { GhostButton } from "../ui/GhostButton";

// Shown when "Join now" is refused because this account isn't on the
// admin's interview-access list. `status` is the candidate's current
// standing: "NONE" (never asked) -> offer to request access;
// "PENDING" (asked, waiting on an admin) -> let them re-check.
export function InterviewAccessModal({ status, email, busy, error, onRequest, onRetry, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const pending = status === "PENDING";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="access-modal-title"
        className="relative w-full max-w-md rounded-2xl bg-[var(--surface)] border border-[var(--ink)]/10 p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 text-[var(--ink)]/40 hover:text-[var(--ink)] transition-colors"
        >
          <X size={18} />
        </button>

        <div className="w-11 h-11 rounded-xl bg-[#FF7A00]/10 flex items-center justify-center text-[#CC5500] mb-4">
          {pending ? <Hourglass size={18} /> : <Lock size={18} />}
        </div>

        <h2 id="access-modal-title" className="text-lg font-semibold text-[var(--ink)]">
          {pending ? "Your request is waiting for approval" : "Permission needed to start the interview"}
        </h2>
        <p className="text-sm text-[var(--ink)]/60 mt-2">
          {pending ? (
            <>An admin hasn't approved <span className="font-medium text-[var(--ink)]">{email}</span> yet. Once they do, you can join right away.</>
          ) : (
            <>Interviews are invite-only right now, and <span className="font-medium text-[var(--ink)]">{email}</span> isn't on the list. Ask an admin for permission to start.</>
          )}
        </p>

        {error && <p className="text-sm text-red-500 mt-3">{error}</p>}

        <div className="flex justify-end gap-2 mt-6">
          <GhostButton onClick={onClose}>Not now</GhostButton>
          <GradientButton onClick={pending ? onRetry : onRequest} disabled={busy}>
            {busy && <Loader2 size={14} className="animate-spin" />}
            {pending ? "Check again" : "Request access"}
          </GradientButton>
        </div>
      </div>
    </div>
  );
}
