// ---------------------------------------------------------------------------
// The candidate's on-screen visuals as a map keyed by stable visual id, and
// how each SSE lifecycle event changes it. Pure — no React — so the
// lifecycle can be tested on its own. Any number of visuals can be active;
// nothing here assumes there's only one, and a new visual never replaces
// another unless the AI explicitly removed it.
// ---------------------------------------------------------------------------

export const EMPTY_VISUALS = Object.freeze({});

export function applyVisualEvent(state, event) {
  switch (event.type) {
    case "visual.snapshot": {
      // The authoritative current set (sent on every (re)connect).
      const next = {};
      for (const v of event.visuals ?? []) next[v.id] = v;
      return next;
    }
    case "visual.create":
    case "visual.update": {
      const v = event.visual;
      if (!v?.id) return state;
      // An older version arriving late (e.g. after a reconnect) is ignored.
      if (state[v.id] && (state[v.id].version ?? 0) > (v.version ?? 0)) return state;
      return { ...state, [v.id]: v };
    }
    case "visual.remove": {
      if (!(event.visualId in state)) return state;
      const next = { ...state };
      delete next[event.visualId];
      return next;
    }
    case "reset":
      return EMPTY_VISUALS;
    default:
      return state;
  }
}

// Display order: oldest first.
export function orderedVisuals(state) {
  return Object.values(state).sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)));
}
