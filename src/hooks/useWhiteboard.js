import { useCallback, useEffect, useRef, useState } from "react";
import { getWhiteboard, saveWhiteboard } from "../services/whiteboardService";

// How long the board must stay unchanged before it's autosaved. Short,
// because the interviewer reads the saved board at the start of each turn.
const SAVE_DEBOUNCE_MS = 1000;
// flush() never holds up the end of the interview for longer than this.
const FLUSH_TIMEOUT_MS = 3000;

// Only what the backend needs to rebuild and read the board — Excalidraw
// elements as they are, minus deleted ones (kept by Excalidraw for undo).
function liveElements(elements) {
  return elements.filter((el) => !el.isDeleted);
}

// Excalidraw calls onChange for every pointer move and selection change,
// not just edits; the sum of element versions only changes on a real edit.
function sceneSignature(elements) {
  let sum = 0;
  for (const el of elements) sum += el.version || 0;
  return `${elements.length}:${sum}`;
}

// The candidate's whiteboard in a system design interview: loads the saved
// board once (so it survives a refresh), keeps the latest scene in memory
// (so closing and reopening the tab doesn't lose anything), and autosaves
// edits. `flush()` saves anything pending right away — called before the
// interview ends so the evaluator grades the final diagram.
export function useWhiteboard(interviewId, enabled) {
  const [status, setStatus] = useState(enabled ? "loading" : "idle"); // loading | ready | error | idle
  const [saveState, setSaveState] = useState("saved"); // saved | pending | saving | error
  const elementsRef = useRef(null); // latest elements (null until loaded)
  const versionRef = useRef(0);
  const signatureRef = useRef(null);
  const timerRef = useRef(null);
  const inflightRef = useRef(Promise.resolve());

  useEffect(() => {
    if (!enabled || !interviewId) return;
    let cancelled = false;
    setStatus("loading");
    getWhiteboard(interviewId)
      .then((board) => {
        if (cancelled) return;
        elementsRef.current = Array.isArray(board?.elements) ? board.elements : [];
        versionRef.current = Number.isInteger(board?.version) ? board.version : 0;
        signatureRef.current = sceneSignature(elementsRef.current);
        setStatus("ready");
      })
      .catch(() => {
        if (cancelled) return;
        // Start blank rather than block drawing; saves still go through.
        elementsRef.current = [];
        signatureRef.current = sceneSignature([]);
        setStatus("ready");
      });
    return () => {
      cancelled = true;
    };
  }, [interviewId, enabled]);

  const save = useCallback(() => {
    clearTimeout(timerRef.current);
    timerRef.current = null;
    const elements = elementsRef.current;
    if (!elements) return inflightRef.current;
    versionRef.current += 1;
    const version = versionRef.current;
    setSaveState("saving");
    const p = saveWhiteboard(interviewId, liveElements(elements), version)
      .then(() => setSaveState((s) => (s === "saving" ? "saved" : s)))
      .catch(() => setSaveState("error"));
    inflightRef.current = p;
    return p;
  }, [interviewId]);

  const onChange = useCallback(
    (elements) => {
      const signature = sceneSignature(elements);
      elementsRef.current = elements;
      if (signature === signatureRef.current) return;
      signatureRef.current = signature;
      setSaveState("pending");
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(save, SAVE_DEBOUNCE_MS);
    },
    [save],
  );

  const flush = useCallback(async () => {
    if (!enabled) return;
    const pending = timerRef.current ? save() : inflightRef.current;
    await Promise.race([pending, new Promise((r) => setTimeout(r, FLUSH_TIMEOUT_MS))]);
  }, [enabled, save]);

  // Leaving the page with an edit pending: send it (best effort).
  useEffect(() => () => {
    if (timerRef.current) save();
  }, [save]);

  return {
    status,
    saveState,
    // Read on (re)mount of the canvas — the latest scene, not just what
    // was loaded.
    getElements: () => elementsRef.current ?? [],
    onChange,
    flush,
  };
}
