import { useCallback, useEffect, useRef, useState } from "react";
import { QUESTION_BANK, STARTER_CODE } from "../constants/questions";
import { buildScript, speak, stopSpeaking } from "../services/aiService";
import { getQuestions, generateQuestions } from "../services/interviewQuestionService";

// ---------------------------------------------------------------------------
// useInterviewEngine
// All the stateful logic that used to live directly inside the interview
// room component: the AI script walk-through, the timer, camera access, the
// code editor, and the transcript. InterviewPage and its child components
// are purely presentational — they just read what this hook returns.
// ---------------------------------------------------------------------------
export function useInterviewEngine(config, onEnd) {
  const q = QUESTION_BANK[config.difficulty.toLowerCase()];
  const scriptRef = useRef(null);
  const startedRef = useRef(false);
  // Phase 3.1: the follow-up question TEXT now comes from Gemini (see
  // interviewQuestionService) instead of the hardcoded QUESTION_BANK
  // follow-ups — the walkthrough mechanism itself (one at a time, wait
  // for the user, etc.) is unchanged, that's Phase 3.2's job.
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [questionsError, setQuestionsError] = useState(null);
  const [questionsRetryKey, setQuestionsRetryKey] = useState(0);

  const [stepIdx, setStepIdx] = useState(0);
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

  // --- countdown timer ---
  useEffect(() => {
    if (ended) return;
    const t = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [ended]);

  // --- camera + mic: request both once on mount, then just enable/disable
  // tracks on the same stream when toggled (no repeated permission
  // prompts). Previously this only ever requested video — the mic toggle
  // was purely cosmetic and never actually asked for microphone access. ---
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

  // Fetch (or generate, if none exist yet) this interview's AI question
  // set, then build and kick off the script. Fetching first — rather than
  // always generating — is what makes a page refresh mid-interview show
  // the same questions again instead of a fresh, different set.
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
        scriptRef.current = buildScript(config.difficulty, questions);
        startedRef.current = true;
        setQuestionsLoading(false);
        advance(0);
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

  const submitAnswer = () => {
    if (!userInput.trim()) return;
    setMessages((m) => [...m, { from: "user", text: userInput.trim() }]);
    setUserInput("");
    setWaitingForUser(false);
    const next = stepIdx + 1;
    setStepIdx(next);
    setTimeout(() => advance(next), 200);
  };

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
    onEnd({ messages, config, q });
  };

  const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");

  return {
    question: q,
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
