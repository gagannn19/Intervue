import { useState } from "react";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { Card } from "../components/ui/Card";
import { GradientButton } from "../components/ui/GradientButton";
import { InterviewTypeSelector } from "../components/schedule/InterviewTypeSelector";
import { DifficultyDurationSelector } from "../components/schedule/DifficultyDurationSelector";
import { ScheduleDetailsForm } from "../components/schedule/ScheduleDetailsForm";
import { disp } from "../constants/theme";

export function SchedulePage({ onBack, onConfirm }) {
  const [type, setType] = useState("dsa");
  const [difficulty, setDifficulty] = useState("Medium");
  const [duration, setDuration] = useState(30);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [role, setRole] = useState("");
  const [instructions, setInstructions] = useState("");
  const canConfirm = date && time;

  return (
    <div className="p-6 sm:p-10 max-w-2xl">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-[var(--ink)]/50 mb-6 hover:text-[var(--ink)]">
        <ArrowLeft size={15} /> Back
      </button>
      <h1 className="text-2xl font-bold text-[var(--ink)]" style={disp}>Schedule an interview</h1>
      <p className="text-sm text-[var(--ink)]/50 mt-1 mb-8">Set it up the way you want to be tested.</p>

      <Card className="p-6 space-y-6">
        <InterviewTypeSelector value={type} onChange={setType} />
        <DifficultyDurationSelector
          difficulty={difficulty}
          onDifficultyChange={setDifficulty}
          duration={duration}
          onDurationChange={setDuration}
        />
        <ScheduleDetailsForm
          date={date} onDateChange={setDate}
          time={time} onTimeChange={setTime}
          role={role} onRoleChange={setRole}
          instructions={instructions} onInstructionsChange={setInstructions}
        />

        <GradientButton
          className="w-full py-3"
          disabled={!canConfirm}
          onClick={() => onConfirm({ difficulty, duration, date, time, role })}
        >
          Confirm interview <ChevronRight size={15} />
        </GradientButton>
      </Card>
    </div>
  );
}
