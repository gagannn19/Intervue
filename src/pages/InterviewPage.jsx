import { useInterviewEngine } from "../hooks/useInterviewEngine";
import { InterviewHeader } from "../components/interview/InterviewHeader";
import { AIInterviewerPanel } from "../components/interview/AIInterviewerPanel";
import { Transcript } from "../components/interview/Transcript";
import { CodingPanel } from "../components/interview/CodingPanel";
import { AnswerInput } from "../components/interview/AnswerInput";
import { UserVideoPanel } from "../components/interview/UserVideoPanel";
import { InterviewControls } from "../components/interview/InterviewControls";
import { SessionNotes } from "../components/interview/SessionNotes";
import { PulseAvatar } from "../components/ui/PulseAvatar";
import { GradientButton } from "../components/ui/GradientButton";
import { disp } from "../constants/theme";

// Kept intentionally dark regardless of the site's light/dark toggle — a
// focus-mode call UI, not part of that theme's scope (see project README).
export function InterviewPage({ config, onEnd }) {
  const engine = useInterviewEngine(config, onEnd);

  if (engine.questionsLoading) {
    return (
      <div className="min-h-screen bg-[#0D0D1F] text-white flex flex-col items-center justify-center gap-4">
        <PulseAvatar size={64} speaking label />
        <p className="text-sm text-white/60" style={disp}>Generating your interview…</p>
      </div>
    );
  }

  if (engine.questionsError) {
    return (
      <div className="min-h-screen bg-[#0D0D1F] text-white flex flex-col items-center justify-center gap-4 px-6 text-center">
        <PulseAvatar size={56} />
        <p className="text-sm font-semibold" style={disp}>Couldn't start the AI interview</p>
        <p className="text-sm text-white/50 max-w-sm">{engine.questionsError}</p>
        <GradientButton onClick={engine.retryQuestions}>Try again</GradientButton>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0D1F] text-white flex flex-col">
      <InterviewHeader questionTitle={engine.question.title} difficulty={config.difficulty} timeLabel={engine.timeLabel} />

      <div className="flex-1 grid lg:grid-cols-[1fr_400px] min-h-0">
        <div className="flex flex-col min-h-0 border-r border-white/10">
          <AIInterviewerPanel
            speaking={engine.aiSpeaking}
            thinking={engine.aiThinking}
            tab={engine.tab}
            onTabChange={engine.setTab}
          />

          {engine.tab === "transcript" ? (
            <Transcript messages={engine.messages} aiThinking={engine.aiThinking} endRef={engine.transcriptEndRef} />
          ) : (
            <CodingPanel
              statement={engine.question.statement}
              lang={engine.lang}
              onLangChange={engine.changeLanguage}
              code={engine.code}
              onCodeChange={engine.setCode}
              onRun={engine.runCode}
              running={engine.running}
              output={engine.output}
            />
          )}

          {engine.waitingForUser && (
            <AnswerInput value={engine.userInput} onChange={engine.setUserInput} onSubmit={engine.submitAnswer} micOn={engine.micOn} />
          )}
        </div>

        <div className="flex flex-col p-5 gap-4">
          <UserVideoPanel camOn={engine.camOn} videoRef={engine.videoRef} mediaError={engine.mediaError} />
          <InterviewControls
            micOn={engine.micOn}
            onToggleMic={() => engine.setMicOn((v) => !v)}
            camOn={engine.camOn}
            onToggleCam={() => engine.setCamOn((v) => !v)}
            onEnd={engine.finishInterview}
          />
          <SessionNotes config={config} answeredCount={engine.answeredCount} />
        </div>
      </div>
    </div>
  );
}
