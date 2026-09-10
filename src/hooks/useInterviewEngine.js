import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { QUESTION_BANK, STARTER_CODE } from "../constants/questions";
import { speak, stopSpeaking } from "../services/aiService";
import { getQuestions, generateQuestions } from "../services/interviewQuestionService";
import { sendConversationTurn } from "../services/interviewConversationService";
import { evaluateQuestion } from "../services/interviewEvaluationService";

// ---------------------------------------------------------------------------
// useInterviewEngine
// All the stateful logic for the interview room: the conversation with the
// AI interviewer, the timer, camera access, the code editor, and the
// transcript. InterviewPage and its child components are purely
// presentational — they just read what this hook returns.
//
// Phase 3.2: the room is now a real back-and-forth. Every candidate
// message is sent to the backend (POST /interviews/:id/conversation),
// which calls Gemini with the current question + trimmed transcript and
// returns { reply, shouldAdvance, ... }. The engine renders the reply and
// only moves to the next question when the backend says so — it never
// walks a fixed script anymore.
// ---------------------------------------------------------------------------

// Opening line. Includes the first (main) DSA problem so the candidate can
// start immediately. Everything after this goes through the backend.
function buildIntroText(difficulty, meta, problem) {
  const { company, position } = meta || {};
  const target = company
    ? ` This one's set up as prep for ${company}${position ? ` (${position})` : ""}, so I'll pitch it at that bar.`
    : "";
  return `Hi, welcome to your ${difficulty.toLowerCase()} DSA interview.${target} Here's the first problem — "${problem.title}." ${problem.statement} Take a moment, then walk me through your first thoughts.`;
}

// Trim the transcript before sending it as context. The current question
// and interview context are always sent fresh, so old chat can be dropped.
// The backend trims again on its side.
function toHistory(messages) {
  return messages.slice(-10).map((m) => ({
    role: m.from === "ai" ? "interviewer" : "candidate",
    text: m.text,
  }));
}

export function useInterviewEngine(config, onEnd) {
  // The canonical DSA problem for this difficulty — the interview opens
  // with it and it's what generateFeedback() summarises against.
  const mainProblem = QUESTION_BANK[config.difficulty.toLowerCase()];
  const startedRef = useRef(false);
  const lastUserMsgRef = useRef(null);

  // Phase 3.1 question set (still fetched/generated exactly as before).
  const [aiQuestions, setAiQuestions] = useState([]);
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [questionsError, setQuestionsError] = useState(null);
  const [questionsRetryKey, setQuestionsRetryKey] = useState(0);

  // Which question is currently under discussion. 0 = the main problem,
  // 1..N = the generated questions. Only ever moves forward, and only when
  // the backend returns shouldAdvance.
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  // Ref mirror so message-tagging and finishInterview() read the live
  // value without stale closures.
  const currentQIdxRef = useRef(0);
  useEffect(() => { currentQIdxRef.current = currentQuestionIdx; }, [currentQuestionIdx]);
  // Guards against evaluating the same question twice (advance + a later
  // End Interview, a resend, etc.).
  const evaluatedRef = useRef(new Set());
  const [turnLoading, setTurnLoading] = useState(false);
  const [turnError, setTurnError] = useState(null);

  const [messages, setMessages] = useState([]);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);
  const [waitingForUser, setWaitingForUser] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  // If this interview was already started earlier (e.g. resumed after a
  // page refresh), config.startedAt is a real timestamp from the backend —
  // count down the time actually remaining instead of restarting the clock.
  const initialSeconds = config.startedAt
    ? Math.max(0, config.duration * 60 - Math.floor((Date.now() - new Date(config.startedAt).getTime()) / 1000))
    : config.duration * 60;
  const [seconds, setSeconds] = useState(initialSeconds);
  const [tab, setTab] = useState("transcript");
  const [lang, setLang] = useState("JavaScript");
  const [code, setCode] = useState(STARTER_CODE.JavaScript);
  const [output, setOutput] = useState(null);
  const [running, setRunning] = useState(false);
  const [ended, setEnded] = useState(false);
  // Null while permission hasn't been denied/failed; otherwise "denied" or
  // "unavailable" so the UI can show a clear, specific message instead of
  // silently pretending the mic/camera are working.
  const [mediaError, setMediaError] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const transcriptEndRef = useRef(null);

  // The ordered list of questions for this interview. Its ids are what the
  // frontend sends to the backend as `currentQuestionId`.
  const questionSeq = useMemo(() => {
    const seq = [{ id: "main", title: mainProblem.title, statement: mainProblem.statement }];
    aiQuestions.forEach((q) => {
      seq.push({
        id: q.id,
        title: q.skill || q.type || "Follow-up",
        statement: q.question,
      });
    });
    return seq;
  }, [mainProblem, aiQuestions]);

  const safeIdx = Math.min(currentQuestionIdx, questionSeq.length - 1);
  const currentQuestion = questionSeq[safeIdx] || mainProblem;

  // --- countdown timer ---
  useEffect(() => {
    if (ended) return;
    const t = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [ended]);

  // --- camera + mic: request both once on mount, then just enable/disable
  // tracks on the same stream when toggled (no repeated permission
  // prompts). ---
  useEffect(() => {
    let active = true;
    navigator.mediaDevices?.getUserMedia?.({ video: true, audio: true })
      .then((stream) => {
        if (!active) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch((err) => {
        setMediaError(err?.name === "NotAllowedError" ? "denied" : "unavailable");
      });
    return () => {
      active = false;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    streamRef.current?.getVideoTracks().forEach((t) => { t.enabled = camOn; });
  }, [camOn]);

  useEffect(() => {
    streamRef.current?.getAudioTracks().forEach((t) => { t.enabled = micOn; });
  }, [micOn]);

  // --- stop any in-flight speech synthesis on unmount ---
  useEffect(() => () => stopSpeaking(), []);

  // --- autoscroll transcript ---
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, aiThinking]);

  const pushAiLine = useCallback((text, { instant = false } = {}) => {
    const emit = () => {
      setAiThinking(false);
      setAiSpeaking(true);
      setMessages((m) => [...m, { from: "ai", text, qIdx: currentQIdxRef.current }]);
      speak(text);
      const estMs = Math.min(5200, Math.max(1400, text.length * 42));
      setTimeout(() => setAiSpeaking(false), estMs);
    };
    if (instant) {
      emit();
    } else {
      setAiThinking(true);
      setTimeout(emit, 900 + Math.random() * 700);
    }
  }, []);

  // Fetch (or generate) this interview's Phase 3.1 question set, then open
  // the conversation with the intro line. Fetching first is what makes a
  // refresh reuse the same questions.
  useEffect(() => {
    if (startedRef.current) return;
    let active = true;

    (async () => {
      setQuestionsLoading(true);
      setQuestionsError(null);
      try {
        let questions = await getQuestions(config.id);
        if (questions.length === 0) {
          questions = await generateQuestions(config.id);
        }
        if (!active) return;
        setAiQuestions(questions);
        startedRef.current = true;
        setQuestionsLoading(false);
        pushAiLine(
          buildIntroText(config.difficulty, { company: config.company, position: config.position }, mainProblem),
        );
        setWaitingForUser(true);
      } catch (err) {
        if (!active) return;
        setQuestionsError(err.message || "AI interviewer is temporarily unavailable. Please try again.");
        setQuestionsLoading(false);
      }
    })();

    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.id, questionsRetryKey]);

  const retryQuestions = () => setQuestionsRetryKey((k) => k + 1);

  // Phase 3.3 — best-effort, non-blocking AI evaluation of one finished
  // question. Fires when a question is completed (advance) or at End
  // Interview for the last one. The room never reacts to this; any failure
  // is swallowed so the interview is unaffected. Returns a promise that
  // ALWAYS resolves — finishInterview awaits it (with a timeout) so the
  // final report can include this last evaluation.
  const fireEvaluation = useCallback(
    (qEntry, sliceMessages, notes) => {
      if (!qEntry) return Promise.resolve();
      if (evaluatedRef.current.has(qEntry.id)) return Promise.resolve();
      const candidateTurns = sliceMessages.filter((m) => m.from === "user");
      if (candidateTurns.length === 0) return Promise.resolve(); // nothing to evaluate
      evaluatedRef.current.add(qEntry.id);

      const transcript = sliceMessages.map((m) => ({
        role: m.from === "ai" ? "interviewer" : "candidate",
        text: m.text,
      }));

      return evaluateQuestion(config.id, {
        questionRef: qEntry.id,
        questionTitle: qEntry.title,
        transcript,
        assessmentNotes: notes ? [notes] : [],
      }).catch((err) => {
        // Internal, best-effort — log only, never surface to the room.
        evaluatedRef.current.delete(qEntry.id); // allow a later retry (e.g. at End Interview)
        console.warn("Question evaluation failed (non-blocking):", err?.message || err);
      });
    },
    [config.id],
  );

  // One conversational turn: send the candidate's message + which question
  // is under discussion + a trimmed transcript, render the reply, and
  // advance the current question only if the backend says to.
  const runTurn = useCallback(
    async (text, priorMessages) => {
      setTurnError(null);
      setTurnLoading(true);
      setAiThinking(true);
      try {
        const completedIdx = Math.min(currentQuestionIdx, questionSeq.length - 1);
        const cq = questionSeq[completedIdx];
        const res = await sendConversationTurn(config.id, {
          currentQuestionId: cq?.id || "main",
          message: text,
          history: toHistory(priorMessages),
        });
        pushAiLine(res.reply, { instant: true });
        if (res.shouldAdvance && currentQuestionIdx < questionSeq.length - 1) {
          // Evaluate the question we just finished, using its full slice of
          // the conversation (prior turns tagged with this qIdx + the
          // candidate message and reply from this turn).
          const slice = [
            ...priorMessages.filter((m) => m.qIdx === completedIdx),
            { from: "user", text, qIdx: completedIdx },
            { from: "ai", text: res.reply, qIdx: completedIdx },
          ];
          fireEvaluation(cq, slice, res.assessmentNote);
          setCurrentQuestionIdx((i) => i + 1);
        }
      } catch (err) {
        setAiThinking(false);
        setTurnError(err.message || "The AI interviewer didn't respond. Try again.");
      } finally {
        setTurnLoading(false);
      }
    },
    [config.id, currentQuestionIdx, questionSeq, pushAiLine, fireEvaluation],
  );

  const submitAnswer = useCallback(() => {
    const text = userInput.trim();
    if (!text || turnLoading) return;
    const prior = messages;
    setMessages((m) => [...m, { from: "user", text, qIdx: currentQIdxRef.current }]);
    setUserInput("");
    lastUserMsgRef.current = text;
    runTurn(text, prior);
  }, [userInput, turnLoading, messages, runTurn]);

  // Resend the last candidate message after a failed turn — the message is
  // already in the transcript, so don't add it again.
  const retryTurn = useCallback(() => {
    const text = lastUserMsgRef.current;
    if (!text || turnLoading) return;
    runTurn(text, messages.slice(0, -1));
  }, [turnLoading, messages, runTurn]);

  const changeLanguage = (newLang) => {
    setLang(newLang);
    setCode(STARTER_CODE[newLang]);
  };

  const runCode = () => {
    setRunning(true);
    setOutput(null);
    setTimeout(() => {
      setRunning(false);
      const changed = code.trim().length > STARTER_CODE[lang].length;
      setOutput({
        ok: changed,
        text: changed
          ? "Sample tests passed (2/2). This is a mocked run — wire up a real sandboxed executor in production."
          : "No changes detected from the starter code — write your solution before running.",
      });
    }, 900);
  };

  const finishInterview = () => {
    setEnded(true);
    stopSpeaking();
    // Evaluate the question still in progress (it never "advanced"), then
    // hand the pending promise to App so it can wait for it — with its own
    // timeout — before asking the backend for the final report.
    const idx = Math.min(currentQIdxRef.current, questionSeq.length - 1);
    const finalEval = fireEvaluation(
      questionSeq[idx],
      messages.filter((m) => m.qIdx === idx),
    );
    onEnd({ config, finalizeEvaluation: () => finalEval });
  };

  const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");

  return {
    question: currentQuestion,
    questionsLoading,
    questionsError,
    retryQuestions,
    messages,
    aiSpeaking,
    aiThinking,
    waitingForUser,
    userInput,
    setUserInput,
    submitAnswer,
    turnLoading,
    turnError,
    retryTurn,
    micOn,
    setMicOn,
    camOn,
    setCamOn,
    mediaError,
    timeLabel: `${minutes}:${secs}`,
    tab,
    setTab,
    lang,
    changeLanguage,
    code,
    setCode,
    output,
    running,
    runCode,
    videoRef,
    transcriptEndRef,
    answeredCount: messages.filter((m) => m.from === "user").length,
    finishInterview,
  };
}
