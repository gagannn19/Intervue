import { useInterviewEngine } from "../hooks/useInterviewEngine";
import { useInterviewVisuals } from "../hooks/useInterviewVisuals";
import { InterviewHeader } from "../components/interview/InterviewHeader";
import { AIInterviewerPanel } from "../components/interview/AIInterviewerPanel";
import { CallPanel } from "../components/interview/CallPanel";
import { CodingPanel } from "../components/interview/CodingPanel";
import { UserVideoPanel } from "../components/interview/UserVideoPanel";
import { InterviewControls } from "../components/interview/InterviewControls";
import { TurnIndicator } from "../components/interview/TurnIndicator";
import { SessionNotes } from "../components/interview/SessionNotes";
import { VisualPanel } from "../components/interview/VisualPanel";
import { PulseAvatar } from "../components/ui/PulseAvatar";
import { GradientButton } from "../components/ui/GradientButton";
import { disp } from "../constants/theme";

// Kept intentionally dark regardless of the site's light/dark toggle — a
// focus-mode call UI, not part of that theme's scope (see project README).
export function InterviewPage({ config, onEnd }) {
  const engine = useInterviewEngine(config, onEnd);
  // The interviewer's optional visual explanations (SSE, separate from the
  // call audio) — only while the call is live.
  const visuals = useInterviewVisuals(config.id, engine.callStatus === "live");

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
      <InterviewHeader
        questionTitle={engine.question.title}
        difficulty={config.difficulty}
        timeLabel={engine.timeLabel}
        company={config.company}
        position={config.position}
        type={config.type}
      />

      <div className="flex-1 grid lg:grid-cols-[1fr_400px] min-h-0">
        <div className="flex flex-col min-h-0 border-r border-white/10">
          <AIInterviewerPanel
            speaking={engine.aiSpeaking}
            turnState={engine.turnState}
            tab={engine.tab}
            onTabChange={engine.setTab}
          />

          <VisualPanel
            visuals={visuals.visuals}
            hiddenCount={visuals.hiddenCount}
            onHide={visuals.hide}
            onShowHidden={visuals.showHidden}
          />

          {engine.tab === "call" ? (
            <CallPanel
              status={engine.callStatus}
              error={engine.callError}
              turnState={engine.turnState}
              micOn={engine.micOn}
              audioBlocked={engine.audioBlocked}
              onUnblockAudio={engine.unblockAudio}
            />
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
        </div>

        <div className="flex flex-col p-5 gap-4">
          <UserVideoPanel camOn={engine.camOn} videoRef={engine.videoRef} mediaError={engine.mediaError} />
          <TurnIndicator turnState={engine.turnState} micOn={engine.micOn} />
          <InterviewControls
            micOn={engine.micOn}
            onToggleMic={engine.toggleMic}
            micDisabled={engine.callStatus !== "live"}
            camOn={engine.camOn}
            onToggleCam={() => engine.setCamOn((v) => !v)}
            onEnd={engine.finishInterview}
          />
          <SessionNotes config={config} callStatus={engine.callStatus} />
        </div>
      </div>
    </div>
  );
}
