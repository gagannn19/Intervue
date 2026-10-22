// ---------------------------------------------------------------------------
// Live subtitles, from the bot's Daily app-messages
// ({type: "cuecast-caption", role, text, final?}) — pure, so it's testable.
//
//   interviewer: one word per message, sent as that word is PLAYED (in step
//                with the voice). Shown a sentence at a time: a new line
//                starts after . ? ! (or once a line gets long).
//   candidate:   what the bot heard this turn so far (finals + live words);
//                each message replaces the last. `final` false = still
//                being recognised.
//
// The turn state clears whichever side no longer has the floor: the
// interviewer's line when the candidate starts talking, the candidate's
// when the interviewer starts speaking.
// ---------------------------------------------------------------------------

export const EMPTY_CAPTIONS = Object.freeze({ interviewer: "", candidate: "", candidateFinal: true });

const MAX_LINE = 160;

export function applyCaption(state, message) {
  const text = typeof message?.text === "string" ? message.text.trim() : "";
  if (!text) return state;
  if (message.role === "interviewer") {
    const line = state.interviewer;
    const fresh = !line || /[.?!]["')\]]?$/.test(line) || line.length > MAX_LINE;
    return { ...state, interviewer: fresh ? text : `${line} ${text}` };
  }
  if (message.role === "candidate") {
    return { ...state, candidate: text, candidateFinal: message.final !== false };
  }
  return state;
}

export function applyTurnState(state, turnState) {
  if (turnState === "ai_speaking" && state.candidate) return { ...state, candidate: "", candidateFinal: true };
  if (turnState === "user_speaking" && state.interviewer) return { ...state, interviewer: "" };
  return state;
}
