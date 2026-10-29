// Marks where AI is used, so nothing spends your Claude plan (or ElevenLabs credits) without a visible sign.
//   ✦ gold   = the button asks the AI (your Claude plan)
//   ♪ violet = the button uses ElevenLabs credits (not the Claude plan)
// It decorates buttons by selector after every redraw, so the pages themselves do not need to know about it.
const SPARK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 1.5l2.6 7.4 7.4 2.6-7.4 2.6L12 21.5l-2.6-7.4L2 11.5l7.4-2.6z"/></svg>';
const WAVE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M5 9v6M9 5v14M13 8v8M17 4v16M21 10v4"/></svg>';
const TITLE = {ai: 'Uses AI (your Claude plan)', el: 'Uses ElevenLabs credits'};

const RULES = [
  ['ai', '[data-st="write"], [data-st="improve"], [data-st="use"], [data-st="regen"], [data-st="approve"], [data-st="refill"], [data-st="score"], [data-st="hooks"]'], // Story helpers
  ['ai', '[data-bf="gen"], [data-lk="gen"], [data-lk="suggest"], [data-lk="apply"]'], // generate concepts, Look & feel AI
  ['ai', '[data-act="approve"][data-concept], [data-act="revise"], [data-act="send"], [data-act="resume"]'], // concepts, build, review
  ['ai', '[data-act="bg-add"], [data-act="s-ask"], [data-act="a-resync"], [data-act="make-text"], [data-act="make-style"]'], // background, style, audio re-sync, make editable
  ['ai', '[data-dup="adapt"], [data-dup="go"][data-adapt="1"], #dk-send'], // adapt a copy, deck chat
  ['ai', '[data-act="retry"], [data-act="readapt"], [data-act="rebuild"], [data-act="restart"]'], // restart / try again on Build & timing
  ['el', '[data-vo="generate"]'],
];

let queued = false;
const mark = () => {
  queued = false;
  for (const [kind, sel] of RULES) {
    for (const el of document.querySelectorAll(sel)) {
      if (el.dataset.aiMark) continue;
      el.dataset.aiMark = kind;
      const i = document.createElement('i');
      i.className = `aib ${kind}`; i.innerHTML = kind === 'el' ? WAVE : SPARK; i.setAttribute('aria-hidden', 'true');
      el.prepend(i);
      el.title = el.title ? `${el.title}\n${TITLE[kind]}` : TITLE[kind];
    }
  }
};
export const initAiMarks = () => {
  new MutationObserver((records) => {
    if (queued || !records.some((r) => [...r.addedNodes].some((n) => n.nodeType === 1))) return;
    queued = true; requestAnimationFrame(mark);
  }).observe(document.body, {childList: true, subtree: true});
  mark();
};

// the small "AI" badge on a tab whose step the AI has worked on in this video
export const aiTabBadge = (at) => (at ? `<i class="aitab" title="The AI worked on this step${Number.isNaN(Date.parse(at)) ? '' : ` (${new Date(at).toLocaleString()})`}">${SPARK}AI</i>` : '');
