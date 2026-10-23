// Download / upload buttons for the places that lacked them. They are added after a page draws (so the page code stays untouched):
//   every frame or still  -> download the image            uploaded media  -> download the file, and a voiceover's transcript
//   Text tab              -> download / upload text.json   Audio tab       -> download the current sound file
//   Brief script box      -> load the script from a .txt / .md / .srt / .vtt file
//   Reference snapshots   -> download a snapshot
const $ = (s, el = document) => el.querySelector(s);
let C = {api: null, toast: () => {}, reload: async () => {}};
export const initFiles = (ctx) => { C = ctx; };

const pid = () => location.hash.match(/^#\/p\/([^/]+)/)?.[1] ?? null;
const base = (u) => decodeURIComponent(String(u).split('?')[0].split('/').pop() || 'file');
const link = (href, name, text, cls, title) => {
  const a = document.createElement('a');
  a.href = href; a.download = name; a.className = cls; a.textContent = text; if (title) a.title = title;
  return a;
};
const fileInput = (accept, onFile) => {
  const i = document.createElement('input');
  i.type = 'file'; i.accept = accept; i.hidden = true;
  i.addEventListener('change', () => { if (i.files[0]) onFile(i.files[0]); i.value = ''; });
  document.body.appendChild(i);
  i.click();
  setTimeout(() => i.remove(), 60000);
};

const decorate = () => {
  const id = pid();
  const main = $('#main');
  if (!main) return;

  // any image with a zoom (concept stills, scene frames, check frames)
  main.querySelectorAll('.shot[data-zoom]:not([data-fdl])').forEach((el) => {
    el.dataset.fdl = '1';
    const href = el.dataset.zoom.split('?')[0];
    el.appendChild(link(href, base(href), '⬇', 'dl', 'Download this image'));
  });

  // reference snapshots
  main.querySelectorAll('.planner-frame:not([data-fdl])').forEach((el) => {
    el.dataset.fdl = '1';
    const img = $('img', el), row = $('.spread', el);
    if (img && row) { const a = link(img.src, base(img.src), '⬇', 'btn ghost sm', 'Download this snapshot'); row.insertBefore(a, row.lastElementChild); }
  });

  // uploaded media: the file itself, and the transcript of a voiceover
  if (id) main.querySelectorAll('.asset:not([data-fdl])').forEach((el) => {
    const sel = $('select[data-role]', el);
    if (!sel) return;
    el.dataset.fdl = '1';
    const file = sel.dataset.role, row = $('.meta .row', el), name = $('.name', el)?.textContent?.trim() || file;
    if (!row) return;
    row.appendChild(link(`/public/studio/${encodeURIComponent(id)}/${encodeURIComponent(file)}`, name, '⬇ File', 'btn ghost sm', 'Download this file'));
    if (/transcribed/i.test(el.textContent)) row.appendChild(link(`/api/projects/${encodeURIComponent(id)}/transcript/${encodeURIComponent(file)}.txt`, `${name.replace(/\.[^.]+$/, '')}-transcript.txt`, '⬇ Transcript', 'btn ghost sm', 'Download the transcript as text'));
  });

  // Audio tab: the sound file in use
  main.querySelectorAll('audio.aud-player[src]:not([data-fdl])').forEach((el) => {
    el.dataset.fdl = '1';
    el.insertAdjacentElement('afterend', link(el.getAttribute('src'), base(el.getAttribute('src')), '⬇ Download', 'btn sm', 'Download this sound file'));
  });

  // Text tab: take the text out, edit it anywhere, put it back
  const save = $('#save-text');
  if (id && save && !$('[data-fl="text-up"]')) {
    const bar = save.parentElement;
    const up = document.createElement('button');
    up.type = 'button'; up.className = 'btn'; up.dataset.fl = 'text-up'; up.textContent = '⬆ Upload text.json'; up.title = 'Replace the texts with an edited text.json (existing texts only)';
    bar.insertBefore(up, bar.firstChild);
    bar.insertBefore(link(`/api/projects/${encodeURIComponent(id)}/text.json`, 'text.json', '⬇ Download text.json', 'btn', 'Download every on-screen text to edit it anywhere'), bar.firstChild);
  }

  // Brief: load the script from a file
  const script = $('textarea[name="script"]');
  if (script && !script.dataset.fdl) {
    script.dataset.fdl = '1';
    const span = script.closest('label.f')?.querySelector('span');
    if (span) {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'fl-load'; b.dataset.fl = 'script-up'; b.textContent = '⬆ Load from file'; b.title = 'Fill this box from a .txt, .md, .srt or .vtt file';
      span.appendChild(b);
    }
  }

  // Build & timing: the scene list as a document or spreadsheet
  const intro = $('.rv-intro');
  if (id && intro && !$('[data-fl-board]')) {
    const row = document.createElement('div');
    row.className = 'row fl-board'; row.dataset.flBoard = '1';
    row.innerHTML = '<span class="small muted">Take the scene list out:</span>';
    for (const [ext, label] of [['md', 'Storyboard (.md)'], ['csv', 'Spreadsheet (.csv)']]) row.appendChild(link(`/api/projects/${encodeURIComponent(id)}/storyboard.${ext}`, `storyboard.${ext}`, `⬇ ${label}`, 'btn ghost sm'));
    row.appendChild(link(`/data/${encodeURIComponent(id)}/storyboard.json`, 'storyboard.json', '⬇ JSON', 'btn ghost sm'));
    intro.appendChild(row);
  }
};

// subtitle files: drop the numbers and the time lines, keep the words
const plainText = (name, text) => (/\.(srt|vtt)$/i.test(name)
  ? text.replace(/^﻿/, '').replace(/^WEBVTT.*$/m, '').split(/\r?\n/).filter((l) => l.trim() && !/^\d+$/.test(l.trim()) && !/-->/.test(l)).join('\n')
  : text.replace(/^﻿/, ''));

document.addEventListener('click', (ev) => {
  const dl = ev.target.closest('a.dl');
  if (dl) { ev.stopPropagation(); return; } // downloading must not also open the zoom view
  const b = ev.target.closest('[data-fl]');
  if (!b) return;
  if (b.dataset.fl === 'script-up') {
    fileInput('.txt,.md,.srt,.vtt,text/plain', async (f) => {
      const ta = $('textarea[name="script"]');
      if (!ta) return;
      if (f.size > 1024 * 1024) { C.toast('That file is too big for a script (limit 1 MB).'); return; }
      ta.value = plainText(f.name, await f.text()).trim();
      ta.dispatchEvent(new Event('input', {bubbles: true})); // the Brief page saves it like typed text
      C.toast(`Script loaded from ${f.name}.`);
    });
  } else if (b.dataset.fl === 'text-up') {
    fileInput('.json,application/json', async (f) => {
      const id = pid();
      try {
        const fd = new FormData(); fd.append('file', f);
        const r = await C.api(`/api/projects/${encodeURIComponent(id)}/text/import`, {method: 'POST', body: fd});
        C.toast(r.changed ? `${r.changed} text${r.changed === 1 ? '' : 's'} updated from ${f.name}.` : 'No texts were different, nothing changed.');
        await C.reload();
      } catch (e) { C.toast(e.message); }
    });
  }
}, true);

let raf = 0;
const schedule = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; try { decorate(); } catch {} }); };
new MutationObserver(schedule).observe(document.body, {childList: true, subtree: true});
schedule();
