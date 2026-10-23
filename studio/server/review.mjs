// The user's review of a built video: per-scene corrections, scenes to add, a general note. Saved on the project
// (project.review), sent to the AI as one task, and the video can only be rendered once the user has approved it.
const str = (v, n) => String(v ?? '').slice(0, n);

export const emptyReview = () => ({notes: {}, adds: [], general: ''});

export const cleanReview = (raw = {}) => {
  const notes = {};
  for (const [k, v] of Object.entries(raw.notes ?? {})) if (str(v, 2000).trim()) notes[str(k, 40)] = str(v, 2000);
  const adds = (Array.isArray(raw.adds) ? raw.adds : []).slice(0, 30)
    .map((a) => ({id: str(a?.id, 40) || `a${Date.now().toString(36)}`, after: Math.max(0, Math.floor(Number(a?.after) || 0)), text: str(a?.text, 2000), sec: Number(a?.sec) > 0 ? Math.min(120, Number(a.sec)) : null}))
    .filter((a) => a.text.trim());
  return {notes, adds, general: str(raw.general, 2000)};
};

export const pendingCount = (rv = emptyReview()) => Object.keys(rv.notes ?? {}).length + (rv.adds?.length ?? 0) + (String(rv.general ?? '').trim() ? 1 : 0);

export const reviewSummary = (rv) => {
  const n = Object.keys(rv.notes ?? {}).length, a = rv.adds?.length ?? 0;
  return [n && `${n} scene correction${n === 1 ? '' : 's'}`, a && `${a} new scene${a === 1 ? '' : 's'}`, String(rv.general ?? '').trim() && 'general note'].filter(Boolean).join(', ');
};

// remove only what was actually sent (the user may have kept typing while the AI worked)
export const clearSent = (current = emptyReview(), sent) => {
  const notes = {...current.notes};
  for (const [k, v] of Object.entries(sent.notes ?? {})) if (notes[k] === v) delete notes[k];
  const sentAdds = new Map((sent.adds ?? []).map((a) => [a.id, a.text]));
  return {notes, adds: (current.adds ?? []).filter((a) => sentAdds.get(a.id) !== a.text), general: current.general === sent.general ? '' : current.general};
};
