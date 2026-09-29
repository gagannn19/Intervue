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
// Automatic turn-taking: no button. The bot detects when the candidate
// starts and stops speaking (VAD) and owns the real turn state, broadcasting
// it as Daily app-messages ({type: "cuecast-state", state}) — see
// cuecast-pipecat-langchain's orchestrator_client.py. We only ask for it
// ({type: "cuecast-turn", action: "sync"}) until it first arrives.
//
// Barge-in: the mic stays published while the interviewer speaks too, so the
// candidate can talk over it; the bot decides whether that was really the
// candidate (words, not echo/noise) and interrupts itself. Echo protection is
// the browser's echo cancellation (requested explicitly below) plus that
// server-side check. The mic is only closed before the bot has reported a
// state ("waiting") and after the interview ends.
//
// Mic button: a plain mute/unmute on top of that — muted = never published,
// and the bot is told ({type: "cuecast-mic", muted}) so it ignores speech.
//
// Ending: the End button and the timer reaching 00:00 both call
// finishInterview() -> onEnd -> the backend's single end-interview path
// (POST /interviews/:id/report). The backend also enforces the time limit
// on its own, so a closed tab still ends on time.
//
// First pass, audio round-trip only: there is no live transcript/caption
// channel back to this browser, so the coding panel always shows the
// interview's main problem rather than tracking which question the
// conversation has actually advanced to server-side. Revisit if live
// captions are ever added (would need a backend -> frontend channel, e.g.
// Daily app-messages from the orchestrator, which doesn't exist yet).
// ---------------------------------------------------------------------------

const TURN_MESSAGE = "cuecast-turn";
const STATE_MESSAGE = "cuecast-state";
const MIC_MESSAGE = "cuecast-mic";
const BOT_USER_NAME = "Cuecast AI";
// Bot states in which the (unmuted) mic is published: every state the bot
// reports — including the interviewer's own turn, for barge-in.
const MIC_LIVE_STATES = new Set([
  "listening",
  "user_speaking",
  "user_finished",
  "processing",
  "ai_speaking",
  "ai_finished",
]);
// Browser-side processing for the mic. Echo cancellation is what keeps the
// interviewer's voice (played by this page) out of the mic during barge-in;
// these are the browser defaults, requested explicitly so they can't drift.
const MIC_CONSTRAINTS = { echoCancellation: true, noiseSuppression: true, autoGainControl: true };
// Until the bot has told us its state (it may join after us, or a message
// can be lost), keep asking.
const SYNC_RETRY_MS = 3000;

export function useInterviewEngine(config, onEnd) {
  const mainProblem = QUESTION_BANK[config.difficulty.toLowerCase()];
  const startedRef = useRef(false);
  const callRef = useRef(null);

  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [questionsError, setQuestionsError] = useState(null);
  const [questionsRetryKey, setQuestionsRetryKey] = useState(0);

  // "connecting" (ensuring questions + starting the backend session) ->
  // "joining" (Daily join in flight) -> "live" -> "finishing" (we ended the
  // interview; results on the way) | "ended" (call dropped) | "error"
  const [callStatus, setCallStatus] = useState("connecting");
  const [callError, setCallError] = useState(null);
  // The interviewer bot's turn state, as it reports it: "waiting" (no
  // state received yet / bot not in the room) | "ai_speaking" |
  // "ai_finished" | "listening" | "user_speaking" | "user_finished" |
  // "processing".
  const [turnState, setTurnState] = useState("waiting");
  // Read inside Daily event handlers, which are registered once.
  const turnStateRef = useRef("waiting");
  // Candidate's own mute toggle (true = not muted by the candidate).
  const [micOn, setMicOn] = useState(true);
  const micOnRef = useRef(true);
  // finishInterview runs once, however many triggers fire (button, timer).
  const endingRef = useRef(false);
  // Backend's persisted LiveSession id for this interview's voice call
  // (see interviewService.js's startInterview). Not shown anywhere in the
  // UI yet — kept available for future use (e.g. reconnect/debugging).
  const [sessionId, setSessionId] = useState(null);

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

  // Publish the mic only when the bot is live in the call and the candidate
  // hasn't muted it.
  const applyMic = useCallback((call) => {
    call?.setLocalAudio(micOnRef.current && MIC_LIVE_STATES.has(turnStateRef.current));
  }, []);

  // Ask the bot for its turn state and tell it our mute state (a bot that
  // just (re)joined knows neither).
  const syncWithBot = useCallback((call) => {
    call?.sendAppMessage({ type: TURN_MESSAGE, action: "sync" }, "*");
    call?.sendAppMessage({ type: MIC_MESSAGE, muted: !micOnRef.current }, "*");
  }, []);

  // Ensure this interview's AI questions exist (so the backend's voice
  // orchestrator has a full question sequence to work through), start the
  // voice session (creates/reuses the Daily room + spawns the pipecat bot,
  // returns this candidate's own join token), then join the call.
  useEffect(() => {
    if (startedRef.current) return;
    // Time already up (e.g. a reload after the deadline): don't rejoin —
    // the timer effect ends the interview straight away.
    if (initialSeconds <= 0) {
      setQuestionsLoading(false);
      return;
    }
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
        setSessionId(session.sessionId ?? null);

        const call = Daily.createCallObject({ inputSettings: { audio: { settings: MIC_CONSTRAINTS } } });
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
          .on("app-message", (ev) => {
            if (ev?.data?.type !== STATE_MESSAGE || typeof ev.data.state !== "string") return;
            // Mic follows the bot's state (live once the bot reports one)
            // and the mute button.
            turnStateRef.current = ev.data.state;
            applyMic(call);
            setTurnState(ev.data.state);
          })
          .on("participant-joined", (ev) => {
            if (ev?.participant?.user_name === BOT_USER_NAME) {
              syncWithBot(call);
            }
          })
          .on("participant-left", (ev) => {
            if (ev?.participant?.user_name === BOT_USER_NAME) {
              turnStateRef.current = "waiting";
              applyMic(call);
              setTurnState("waiting");
            }
          })
          .on("left-meeting", () =>
            setCallStatus((s) => (s === "error" ? s : endingRef.current ? "finishing" : "ended")),
          )
          .on("camera-error", () => setMediaError("denied"))
          .on("error", (ev) => {
            setCallError(ev?.errorMsg || "The call encountered an error.");
            setCallStatus("error");
          });

        setCallStatus("joining");
        await call.join({ url: session.dailyRoomUrl, token: session.dailyToken });
        if (!active) return;
        if (endingRef.current) {
          // The interview ended while we were still joining.
          call.leave().catch(() => {});
          return;
        }
        // Explicitly (re-)apply mic/cam state to the real call object now
        // that it actually exists — the `[camOn]` effect below first runs
        // before callRef.current is assigned and no-ops. The mic stays
        // unpublished until the bot reports the candidate has the floor
        // (the app-message handler above is the only thing that enables it).
        applyMic(call);
        call.setLocalVideo(camOn);
        setCallStatus("live");
        syncWithBot(call);
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
    if (callStatus !== "live" || turnState !== "waiting") return;
    const t = setInterval(() => syncWithBot(callRef.current), SYNC_RETRY_MS);
    return () => clearInterval(t);
  }, [callStatus, turnState, syncWithBot]);

  // Mute/unmute — takes effect immediately, in any bot state (so unmuting
  // while the interviewer speaks lets the candidate barge in).
  const toggleMic = useCallback(() => {
    micOnRef.current = !micOnRef.current;
    setMicOn(micOnRef.current);
    const call = callRef.current;
    applyMic(call);
    call?.sendAppMessage({ type: MIC_MESSAGE, muted: !micOnRef.current }, "*");
  }, [applyMic]);

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

  // One way out for both the End button ("manual") and 00:00 ("timeout").
  const finishInterview = useCallback(
    (reason = "manual") => {
      if (endingRef.current) return;
      endingRef.current = true;
      setEnded(true);
      setCallStatus((s) => (s === "error" ? s : "finishing"));
      turnStateRef.current = "ended";
      setTurnState("ended");
      const call = callRef.current;
      if (call) {
        call.setLocalAudio(false);
        call.leave().catch(() => {});
      }
      // Per-question evaluation happens server-side as the voice
      // conversation progresses (see backend src/ws/orchestrator.ts), and
      // the trailing in-progress question is finalized by the backend's
      // end-interview service — nothing left for the frontend to await.
      onEnd({ config, reason, finalizeEvaluation: () => Promise.resolve() });
    },
    [config, onEnd],
  );

  // Time's up -> end, exactly like the End button (minus the confirm).
  useEffect(() => {
    if (seconds === 0) finishInterview("timeout");
  }, [seconds, finishInterview]);

  const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");

  return {
    question: mainProblem,
    questionsLoading,
    questionsError,
    retryQuestions,
    callStatus,
    callError,
    aiSpeaking: turnState === "ai_speaking",
    turnState,
    micOn,
    toggleMic,
    sessionId,
    audioBlocked,
    unblockAudio,
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
