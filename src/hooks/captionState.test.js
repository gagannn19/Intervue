// Live subtitle state (captionState.js). Run: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { EMPTY_CAPTIONS, applyCaption, applyTurnState } from "./captionState.js";

const kathy = (...words) => words.reduce((s, text) => applyCaption(s, { role: "interviewer", text }), EMPTY_CAPTIONS);

test("interviewer words build a sentence, and a new sentence starts a new line", () => {
  assert.equal(kathy("Here's", "the", "problem.").interviewer, "Here's the problem.");
  assert.equal(kathy("Here's", "the", "problem.", "Find", "two").interviewer, "Find two");
  assert.equal(kathy("Ready?", "Okay").interviewer, "Okay");
});

test("candidate: each message replaces the last; final marks recognised words", () => {
  let s = applyCaption(EMPTY_CAPTIONS, { role: "candidate", text: "I would", final: false });
  assert.deepEqual([s.candidate, s.candidateFinal], ["I would", false]);
  s = applyCaption(s, { role: "candidate", text: "I would use a hash map.", final: true });
  assert.deepEqual([s.candidate, s.candidateFinal], ["I would use a hash map.", true]);
});

test("turn changes clear the side that lost the floor", () => {
  let s = applyCaption(kathy("How", "would", "you", "start?"), { role: "candidate", text: "With a map", final: true });
  s = applyTurnState(s, "user_speaking");
  assert.equal(s.interviewer, "");
  assert.equal(s.candidate, "With a map");
  s = applyTurnState(s, "ai_speaking");
  assert.equal(s.candidate, "");
});

test("empty or unknown messages change nothing", () => {
  assert.equal(applyCaption(EMPTY_CAPTIONS, { role: "interviewer", text: "  " }), EMPTY_CAPTIONS);
  assert.equal(applyCaption(EMPTY_CAPTIONS, { role: "other", text: "x" }), EMPTY_CAPTIONS);
});
