// The candidate's on-screen visual state (visualState.js), driven by the
// same lifecycle events the SSE stream delivers. Run: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { EMPTY_VISUALS, applyVisualEvent, orderedVisuals } from "./visualState.js";

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
