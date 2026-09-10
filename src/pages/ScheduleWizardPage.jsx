import { useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Card } from "../components/ui/Card";
import { GradientButton } from "../components/ui/GradientButton";
import { GhostButton } from "../components/ui/GhostButton";
import { disp } from "../constants/theme";
import { findCompany, DEFAULT_DIFFICULTY } from "../lib/companyTargeting";
import {
  useInterviewTypes,
  useCompanies,
  useCompanyPosition,
} from "../hooks/useScheduleCatalog";

import { SchedulePage } from "./SchedulePage";
import { WizardProgress } from "../components/schedule/WizardProgress";
import { InterviewTypeSelector } from "../components/schedule/InterviewTypeSelector";
import { StepHeading } from "../components/schedule/steps/StepHeading";
import { CompanyStep } from "../components/schedule/steps/CompanyStep";
import { PositionStep } from "../components/schedule/steps/PositionStep";
import { DifficultyStep } from "../components/schedule/steps/DifficultyStep";
import { SalaryStep } from "../components/schedule/steps/SalaryStep";
import { DurationStep } from "../components/schedule/steps/DurationStep";
import { WhenStep } from "../components/schedule/steps/WhenStep";
import { ReviewStep } from "../components/schedule/steps/ReviewStep";

// Step order for the company-targeting path. The "Custom Settings" path
// leaves this wizard entirely and renders the classic <SchedulePage />.
const STEP_LABELS = [
  "Type",
  "Company",
  "Position",
  "Difficulty",
  "Salary",
  "Duration",
  "Schedule",
  "Review",
];
const LAST_STEP = STEP_LABELS.length - 1;

const DEFAULT_FORM = {
  interviewTypes: ["dsa"], // slugs; only DSA is live, matches INTERVIEW_TYPES
  companyId: null,
  positionId: null,
  duration: 30,
  date: "",
  time: "",
};

// ---------------------------------------------------------------------------
// ScheduleWizardPage
// Replaces the old single-window SchedulePage as the "schedule" screen.
// It owns one `form` object that persists across steps, plus which step is
// showing. The company catalog now lives in the backend: each step calls
// its own endpoint (useScheduleCatalog.js). Difficulty and salary are
// resolved by the backend from company + position — never stored on
// `form`, never computed here.
//
// Props match what App.jsx passed to SchedulePage before:
//   onBack    -> leave the schedule screen (back to dashboard)
//   onConfirm -> async ({ difficulty, duration, date, time, role,
//                instructions, type, company, position, salaryMin,
//                salaryMax }); navigates away on success
//   dark      -> current theme, for the native date/time pickers
// ---------------------------------------------------------------------------
export function ScheduleWizardPage({ onBack, onConfirm, dark }) {
  const [mode, setMode] = useState("wizard"); // "wizard" | "custom"
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const { types, loading: typesLoading, error: typesError } = useInterviewTypes();
  const { companies, loading: companiesLoading, error: companiesError } = useCompanies();
  // Backend-resolved difficulty + salary for the chosen level. Also feeds
  // the Difficulty / Salary / Review steps (they call the same cached
  // hook themselves, so this costs one network request in total).
  const { position, loading: positionLoading } = useCompanyPosition(
    form.companyId,
    form.positionId,
  );

  const update = (patch) => setForm((f) => ({ ...f, ...patch }));

  // Custom Settings path: hand off to the untouched classic scheduler.
  // Back from there returns to the company step so the user can switch to
  // a targeted flow instead.
  if (mode === "custom") {
    return (
      <SchedulePage
        dark={dark}
        onBack={() => {
          setMode("wizard");
          setStep(1);
        }}
        onConfirm={onConfirm}
      />
    );
  }

  const company = findCompany(companies, form.companyId);
  const targeted = Boolean(form.companyId && form.positionId);
  const difficulty = position?.difficulty || DEFAULT_DIFFICULTY;
  const salaryRange = position?.salary || null;
  const positionLabel = position?.label || null;

  const goBack = () => {
    setError(null);
    if (step === 0) {
      onBack();
      return;
    }
    setStep((s) => s - 1);
  };

  const goNext = () => {
    setError(null);
    setStep((s) => Math.min(s + 1, LAST_STEP));
  };

  const canContinue = [
    form.interviewTypes.length > 0, // 0 Type
    Boolean(form.companyId), // 1 Company
    Boolean(form.positionId), // 2 Position
    true, // 3 Difficulty (auto)
    true, // 4 Salary (auto)
    Boolean(form.duration), // 5 Duration
    Boolean(form.date && form.time), // 6 Schedule (date + time)
    !submitting && !positionLoading, // 7 Review (wait for resolved difficulty/salary)
  ][step];

  const handleSchedule = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await onConfirm({
        difficulty,
        duration: form.duration,
        date: form.date,
        time: form.time,
        // Derived target role so the interview room / AI question prompt
        // still get a role string, just like the classic form's field.
        role: positionLabel && company ? `${positionLabel} @ ${company.name}` : "",
        instructions: "",
        type: form.interviewTypes[0],
        company: company?.name || null,
        position: positionLabel || null,
        salaryMin: salaryRange?.min ?? null,
        salaryMax: salaryRange?.max ?? null,
      });
      // onConfirm navigates away on success — nothing else to do.
    } catch (err) {
      setError(err.message || "Couldn't schedule that interview — try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 sm:p-10 max-w-2xl">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-[var(--ink)]/50 mb-6 hover:text-[var(--ink)]"
      >
        <ArrowLeft size={15} /> Back
      </button>

      <h1 className="text-2xl font-bold text-[var(--ink)]" style={disp}>Schedule an interview</h1>
      <p className="text-sm text-[var(--ink)]/50 mt-1 mb-8">
        Target a company step by step — or switch to custom settings.
      </p>

      <Card className="p-6 space-y-6">
        <WizardProgress steps={STEP_LABELS} current={step} />

        {step === 0 && (
          <div>
            <StepHeading
              title="What type of interview do you want to practice?"
              hint="Pick one or more. DSA is the only live type right now — the rest are coming soon."
            />
            <InterviewTypeSelector
              multiple
              types={types}
              loading={typesLoading}
              error={typesError}
              value={form.interviewTypes}
              onChange={(next) => update({ interviewTypes: next })}
            />
          </div>
        )}

        {step === 1 && (
          <CompanyStep
            companies={companies}
            loading={companiesLoading}
            error={companiesError}
            selectedId={form.companyId}
            onSelect={(id) =>
              update({
                companyId: id,
                // Reset the level if the company changed.
                positionId: id === form.companyId ? form.positionId : null,
              })
            }
            onCustom={() => setMode("custom")}
          />
        )}

        {step === 2 && (
          <PositionStep
            companySlug={form.companyId}
            selectedId={form.positionId}
            onSelect={(id) => update({ positionId: id })}
          />
        )}

        {step === 3 && (
          <DifficultyStep
            companySlug={form.companyId}
            positionSlug={form.positionId}
            companyName={company?.name}
          />
        )}

        {step === 4 && (
          <SalaryStep
            companySlug={form.companyId}
            positionSlug={form.positionId}
            companyName={company?.name}
          />
        )}

        {step === 5 && (
          <DurationStep value={form.duration} onChange={(d) => update({ duration: d })} />
        )}

        {step === 6 && (
          <WhenStep
            dark={dark}
            date={form.date}
            onDateChange={(v) => update({ date: v })}
            time={form.time}
            onTimeChange={(v) => update({ time: v })}
          />
        )}

        {step === 7 && (
          <ReviewStep
            interviewTypeIds={form.interviewTypes}
            companyName={company?.name}
            positionLabel={positionLabel}
            difficulty={targeted ? difficulty : "Medium"}
            salaryRange={salaryRange}
            duration={form.duration}
            date={form.date}
            time={form.time}
            loading={positionLoading}
          />
        )}

        {error && <p className="text-[13px] text-[#E24468]">{error}</p>}

        <div className="flex items-center gap-3 pt-1">
          <GhostButton onClick={goBack} className="flex-1">
            <ChevronLeft size={15} /> Back
          </GhostButton>

          {step === LAST_STEP ? (
            <GradientButton className="flex-1 py-3" disabled={!canContinue} onClick={handleSchedule}>
              {submitting ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <>Schedule Interview <ChevronRight size={15} /></>
              )}
            </GradientButton>
          ) : (
            <GradientButton className="flex-1 py-3" disabled={!canContinue} onClick={goNext}>
              Continue <ChevronRight size={15} />
            </GradientButton>
          )}
        </div>
      </Card>
    </div>
  );
}
