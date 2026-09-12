import { useCallback, useEffect, useRef, useState } from "react";
import Daily from "@daily-co/daily-js";
import { QUESTION_BANK, STARTER_CODE } from "../constants/questions";
import { getQuestions, generateQuestions } from "../services/interviewQuestionService";
import { startInterview } from "../services/interviewService";

// ---------------------------------------------------------------------------
// useInterviewEngine — real-time voice interview room.
//
// The candidate joins a Daily room as the only human participant; the AI
// interviewer is a pipecat bot (cuecast-pipecat-langchain) already in that
// room by the time we join. STT -> LLM -> TTS all happens server-side
// (pipecat <-> the backend's voice orchestrator <-> cuecast's LangChain
// endpoint) — this hook's job is just: get a room + token, join it, and
// reflect basic call state (connecting/live/error, who's speaking, mic/cam
// mute) back to the UI.
//
// First pass, audio round-trip only: there is no live transcript/caption
// channel back to this browser, so the coding panel always shows the
// interview's main problem rather than tracking which question the
// conversation has actually advanced to server-side. Revisit if live
// captions are ever added (would need a backend -> frontend channel, e.g.
// Daily app-messages from the orchestrator, which doesn't exist yet).
// ---------------------------------------------------------------------------

export function useInterviewEngine(config, onEnd) {
  const mainProblem = QUESTION_BANK[config.difficulty.toLowerCase()];
  const startedRef = useRef(false);
  const callRef = useRef(null);

  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [questionsError, setQuestionsError] = useState(null);
  const [questionsRetryKey, setQuestionsRetryKey] = useState(0);

  // "connecting" (ensuring questions + starting the backend session) ->
  // "joining" (Daily join in flight) -> "live" -> "ended" | "error"
  const [callStatus, setCallStatus] = useState("connecting");
  const [callError, setCallError] = useState(null);
  const [aiSpeaking, setAiSpeaking] = useState(false);

  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [mediaError, setMediaError] = useState(null);
  // True if the browser blocked autoplay of the bot's voice (rare, but
  // possible depending on browser/history) — see remoteAudioRef below.
  const [audioBlocked, setAudioBlocked] = useState(false);

  const initialSeconds = config.startedAt
    ? Math.max(0, config.duration * 60 - Math.floor((Date.now() - new Date(config.startedAt).getTime()) / 1000))
    : config.duration * 60;
  const [seconds, setSeconds] = useState(initialSeconds);
  const [ended, setEnded] = useState(false);

  const [tab, setTab] = useState("call");
  const [lang, setLang] = useState("JavaScript");
  const [code, setCode] = useState(STARTER_CODE.JavaScript);
  const [output, setOutput] = useState(null);
  const [running, setRunning] = useState(false);

  const videoRef = useRef(null);
  const localVideoTrackRef = useRef(null);
  // Daily's headless call object (no iframe UI) does NOT auto-create or
  // play an <audio> element for remote participants — unlike its iframe
  // mode, it only fires track-started and leaves playback entirely to us.
  // This element is what actually makes the bot's voice audible.
  const remoteAudioRef = useRef(null);

  // --- countdown timer ---
  useEffect(() => {
    if (ended) return;
    const t = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [ended]);

  // Ensure this interview's AI questions exist (so the backend's voice
  // orchestrator has a full question sequence to work through), start the
  // voice session (creates/reuses the Daily room + spawns the pipecat bot,
  // returns this candidate's own join token), then join the call.
  useEffect(() => {
    if (startedRef.current) return;
    let active = true;

    (async () => {
      setQuestionsLoading(true);
      setQuestionsError(null);
      setCallStatus("connecting");
      setCallError(null);

      try {
        const questions = await getQuestions(config.id);
        if (questions.length === 0) {
          await generateQuestions(config.id);
        }
        if (!active) return;
        startedRef.current = true;
        setQuestionsLoading(false);

        const session = await startInterview(config.id);
        if (!active) return;
        if (!session.dailyRoomUrl || !session.dailyToken) {
          throw new Error("The backend didn't return a room to join.");
        }

        const call = Daily.createCallObject();
        callRef.current = call;

        call
          .on("track-started", (ev) => {
            if (ev.participant?.local && ev.type === "video") {
              localVideoTrackRef.current = ev.track;
              if (videoRef.current) videoRef.current.srcObject = new MediaStream([ev.track]);
              return;
            }
            // The bot's voice. Without this, pipecat's TTS audio arrives
            // over WebRTC but has nowhere to play — dead silence with no
            // error anywhere, since nothing actually failed.
            if (!ev.participant?.local && ev.type === "audio") {
              const audioEl = remoteAudioRef.current ?? document.createElement("audio");
              audioEl.autoplay = true;
              audioEl.srcObject = new MediaStream([ev.track]);
              if (!remoteAudioRef.current) {
                remoteAudioRef.current = audioEl;
                document.body.appendChild(audioEl);
              }
              audioEl.play().catch(() => setAudioBlocked(true));
            }
          })
          .on("active-speaker-change", (ev) => {
            const localId = call.participants().local?.session_id;
            setAiSpeaking(Boolean(ev.activeSpeaker?.peerId) && ev.activeSpeaker.peerId !== localId);
          })
          .on("left-meeting", () => setCallStatus((s) => (s === "error" ? s : "ended")))
          .on("camera-error", () => setMediaError("denied"))
          .on("error", (ev) => {
            setCallError(ev?.errorMsg || "The call encountered an error.");
            setCallStatus("error");
          });

        setCallStatus("joining");
        await call.join({ url: session.dailyRoomUrl, token: session.dailyToken });
        if (!active) return;
        setCallStatus("live");
      } catch (err) {
        if (!active) return;
        setQuestionsLoading(false);
        setCallStatus("error");
        setCallError(err.message || "Couldn't start the interview.");
      }
    })();

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.id, questionsRetryKey]);

  // Leave + tear down the call object on unmount, however the room ends.
  useEffect(() => {
    return () => {
      const call = callRef.current;
      if (call) {
        call.leave().catch(() => {});
        call.destroy();
      }
      remoteAudioRef.current?.remove();
    };
  }, []);

  // Fallback if the browser blocked autoplay of the bot's voice: a real
  // click always satisfies autoplay policy, so retry play() from here.
  const unblockAudio = useCallback(() => {
    remoteAudioRef.current
      ?.play()
      .then(() => setAudioBlocked(false))
      .catch(() => {});
  }, []);

  useEffect(() => {
    callRef.current?.setLocalAudio(micOn);
  }, [micOn]);

  // Toggling camOn unmounts/remounts the <video> element (see
  // UserVideoPanel), so re-attach the already-known local track whenever
  // it comes back — Daily doesn't re-fire track-started for a mute/unmute.
  useEffect(() => {
    callRef.current?.setLocalVideo(camOn);
    if (camOn && videoRef.current && localVideoTrackRef.current) {
      videoRef.current.srcObject = new MediaStream([localVideoTrackRef.current]);
    }
  }, [camOn]);

  const retryQuestions = () => setQuestionsRetryKey((k) => k + 1);

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

  const finishInterview = useCallback(() => {
    setEnded(true);
    const call = callRef.current;
    if (call) {
      call.leave().catch(() => {});
    }
    // Per-question evaluation now happens server-side as the voice
    // conversation progresses (see backend src/ws/orchestrator.ts), and
    // the trailing in-progress question is finalized by the backend
    // itself when the report is requested — nothing left for the
    // frontend to await here.
    onEnd({ config, finalizeEvaluation: () => Promise.resolve() });
  }, [config, onEnd]);

  const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");

  return {
    question: mainProblem,
    questionsLoading,
    questionsError,
    retryQuestions,
    callStatus,
    callError,
    aiSpeaking,
    audioBlocked,
    unblockAudio,
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
    finishInterview,
  };
}
