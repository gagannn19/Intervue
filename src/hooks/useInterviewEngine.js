import { useCallback, useEffect, useRef, useState } from "react";
import { QUESTION_BANK, STARTER_CODE } from "../constants/questions";
import { buildScript, speak, stopSpeaking } from "../services/aiService";

// ---------------------------------------------------------------------------
// useInterviewEngine
// All the stateful logic that used to live directly inside the interview
// room component: the AI script walk-through, the timer, camera access, the
// code editor, and the transcript. InterviewPage and its child components
// are purely presentational — they just read what this hook returns.
// ---------------------------------------------------------------------------
export function useInterviewEngine(config, onEnd) {
  const q = QUESTION_BANK[config.difficulty.toLowerCase()];
  const scriptRef = useRef(buildScript(config.difficulty));
  const startedRef = useRef(false);

  const [stepIdx, setStepIdx] = useState(0);
  const [messages, setMessages] = useState([]);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);
  const [waitingForUser, setWaitingForUser] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [seconds, setSeconds] = useState(config.duration * 60);
  const [tab, setTab] = useState("transcript");
  const [lang, setLang] = useState("JavaScript");
  const [code, setCode] = useState(STARTER_CODE.JavaScript);
  const [output, setOutput] = useState(null);
  const [running, setRunning] = useState(false);
  const [ended, setEnded] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const transcriptEndRef = useRef(null);

  // --- countdown timer ---
  useEffect(() => {
    if (ended) return;
    const t = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [ended]);

  // --- camera (best-effort; degrades quietly if blocked/unavailable) ---
  useEffect(() => {
    let active = true;
    if (camOn) {
      navigator.mediaDevices?.getUserMedia?.({ video: true, audio: false })
        .then((stream) => {
          if (!active) return;
          streamRef.current = stream;
          if (videoRef.current) videoRef.current.srcObject = stream;
        })
        .catch(() => { /* no camera access in this environment — tile shows a fallback */ });
    } else {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    }
    return () => { active = false; };
  }, [camOn]);

  // --- cleanup on unmount ---
  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    stopSpeaking();
  }, []);

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

  // kick off the script once, on mount
  useEffect(() => {
    if (!startedRef.current) {
      startedRef.current = true;
      advance(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
