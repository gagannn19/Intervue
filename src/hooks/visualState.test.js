// The candidate's on-screen visual state (visualState.js), driven by the
// same lifecycle events the SSE stream delivers. Run: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { EMPTY_VISUALS, applyVisualEvent, orderedVisuals, pickSlide } from "./visualState.js";

const v = (id, title, createdAt, version = 1) => ({ id, title, createdAt, version, html: "<div></div>", css: "", js: "" });
const titles = (state) => orderedVisuals(state).map((x) => x.title);
const run = (events, start = EMPTY_VISUALS) => events.reduce(applyVisualEvent, start);

test("create, then a second create keeps the first (no implicit replace)", () => {
  const s = run([{ type: "visual.create", visual: v("a", "A", "1") }, { type: "visual.create", visual: v("b", "B", "2") }]);
  assert.deepEqual(titles(s), ["A", "B"]);
});

test("remove A + create B: A gone, B shown — no manual close needed", () => {
  const s = run([{ type: "visual.create", visual: v("a", "A", "1") }, { type: "visual.remove", visualId: "a" }, { type: "visual.create", visual: v("b", "B", "2") }]);
  assert.deepEqual(titles(s), ["B"]);
});

test("remove the middle of three: the other two remain", () => {
  const s = run([
    { type: "visual.create", visual: v("a", "A", "1") },
    { type: "visual.create", visual: v("b", "B", "2") },
    { type: "visual.create", visual: v("c", "C", "3") },
    { type: "visual.remove", visualId: "b" },
  ]);
  assert.deepEqual(titles(s), ["A", "C"]);
});

test("update replaces that visual only; a late older version is ignored", () => {
  let s = run([{ type: "visual.create", visual: v("a", "A", "1") }, { type: "visual.create", visual: v("b", "B", "2") }]);
  s = applyVisualEvent(s, { type: "visual.update", visual: v("a", "A2", "1", 2) });
  s = applyVisualEvent(s, { type: "visual.update", visual: v("a", "A-old", "1", 1) });
  assert.deepEqual(titles(s), ["A2", "B"]);
});

test("snapshot (reconnect) replaces everything with exactly the current set", () => {
  const before = run([{ type: "visual.create", visual: v("a", "A", "1") }, { type: "visual.create", visual: v("x", "Removed meanwhile", "2") }]);
  const s = applyVisualEvent(before, { type: "visual.snapshot", visuals: [v("a", "A", "1"), v("c", "C", "3")] });
  assert.deepEqual(titles(s), ["A", "C"]);
});

test("removing an unknown id or unknown event types change nothing", () => {
  const s = run([{ type: "visual.create", visual: v("a", "A", "1") }]);
  assert.equal(applyVisualEvent(s, { type: "visual.remove", visualId: "nope" }), s);
  assert.equal(applyVisualEvent(s, { type: "something.else" }), s);
});

test("pickSlide: the slide the voice is on, once it has arrived", () => {
  const s = run([{ type: "visual.create", visual: v("a", "A", "1") }, { type: "visual.create", visual: v("b", "B", "2") }]);
  assert.equal(pickSlide(s, "b", "a").title, "B");
  // The voice reached slide c before its code did: keep showing what's showing.
  assert.equal(pickSlide(s, "c", "a").title, "A");
  // Nothing pointed at yet (fresh connection / older bot): the oldest.
  assert.equal(pickSlide(s, null, null).title, "A");
  assert.equal(pickSlide(EMPTY_VISUALS, "b", "a"), null);
});

test("a new deck replaces the old one without a blank screen", () => {
  // Old slide showing; the voice moves to the new deck's first slide before
  // its code arrives, then it's created, then the old one is removed.
  let s = run([{ type: "visual.create", visual: v("old", "Old", "1") }]);
  assert.equal(pickSlide(s, "new", "old").title, "Old");
  s = run([{ type: "visual.create", visual: v("new", "New", "2") }], s);
  assert.equal(pickSlide(s, "new", "old").title, "New");
  s = run([{ type: "visual.remove", visualId: "old" }], s);
  assert.equal(pickSlide(s, "new", "new").title, "New");
});
