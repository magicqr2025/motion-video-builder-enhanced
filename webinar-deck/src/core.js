// Deck engine shared by every theme: builds the slides, wires the controls, and hands a canvas to the theme's 3D background.
export const state = { cur: -1, kick: 0 };

export function startDeck(slides, initBackground, { allDark = false } = {}) {
  const stage = document.getElementById('stage');
  const $ = (id) => document.getElementById(id);

  // ---------- slides ----------
  stage.innerHTML = slides.map((s, n) => `<section class="slide ${s.cls || ''} ${s.dark || allDark ? 'dark' : ''}" data-n="${String(n + 1).padStart(2, '0')}">${s.html}</section>`).join('');
  const els = [...stage.children];

  // Headline words animate in one by one. Gradient classes move from the wrapper span onto each word.
  const splitWords = (h) => {
    let n = 0;
    const walk = (node, cls) => [...node.childNodes].forEach((c) => {
      if (c.nodeType === 3) {
        const frag = document.createDocumentFragment();
        c.textContent.split(/(\s+)/).forEach((tok) => {
          if (!tok) return;
          if (!tok.trim()) return frag.append(' ');
          const w = document.createElement('span');
          w.className = `w ${cls}`;
          w.style.setProperty('--w', n++);
          w.textContent = tok;
          frag.append(w);
        });
        c.replaceWith(frag);
      } else if (c.tagName === 'SPAN') { const k = c.className; c.className = ''; walk(c, k); }
    });
    walk(h, '');
  };
  stage.querySelectorAll('h1').forEach(splitWords);

  // A few twinkling four-point stars near the edges of every slide.
  const SPOTS = [[2.5, 48], [96.5, 30], [3, 90], [93, 91], [55, 3], [72, 95.5], [24, 96], [97, 62]];
  const STAR_COLORS = ['var(--gold)', 'var(--blue)', 'var(--pink)', 'var(--orange)'];
  els.forEach((el, n) => {
    for (let k = 0; k < 5; k++) {
      const [x, y] = SPOTS[(n * 3 + k * 5) % SPOTS.length];
      el.insertAdjacentHTML('afterbegin', `<svg class="spark" viewBox="0 0 100 100" style="--x:${x}%;--y:${y}%;--s:${28 + ((n + k) % 3) * 16}px;--c:${STAR_COLORS[(n + k) % 4]};--d:${2.4 + k * 0.5}s;--dl:${-k * 0.7}s"><path d="M50 0C54 34 66 46 100 50C66 54 54 66 50 100C46 66 34 54 0 50C34 46 46 34 50 0Z"/></svg>`);
    }
  });
  const STATIC = location.search.includes('static'); // no entrance animation, all steps shown (for checks and PDF export)
  let cur = -1;
  let step = 0;

  const countUp = (el) => {
    const to = +el.dataset.count;
    const t0 = performance.now() + 350;
    const tick = (now) => {
      const k = Math.min(1, Math.max(0, (now - t0) / 1500));
      el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))).toLocaleString('en-IN');
      if (k < 1 && el.isConnected) requestAnimationFrame(tick);
    };
    el.textContent = '0';
    requestAnimationFrame(tick);
  };

  const applyStep = (animate) => {
    els[cur].querySelectorAll('.f').forEach((f) => {
      const on = +f.dataset.f <= step;
      if (on && !f.classList.contains('on') && animate) f.querySelectorAll('[data-count]').forEach(countUp);
      f.classList.toggle('on', on);
    });
  };

  const show = (n, atEnd = false) => {
    n = Math.max(0, Math.min(slides.length - 1, n));
    if (n === cur) return;
    if (cur >= 0) els[cur].classList.remove('active');
    cur = n;
    state.cur = n;
    step = atEnd ? slides[cur].steps || 0 : 0;
    els[cur].classList.add('active');
    document.body.classList.toggle('dark', allDark || !!slides[cur].dark);
    // videos only play on the slide that is showing
    stage.querySelectorAll('video').forEach((v) => {
      if (els[cur].contains(v)) { v.currentTime = 0; v.play().catch(() => {}); } else v.pause();
    });
    els[cur].querySelectorAll('[data-count]').forEach((c) => {
      const f = c.closest('.f');
      if (!f && !STATIC) countUp(c);
      else if (atEnd) c.textContent = (+c.dataset.count).toLocaleString('en-IN');
    });
    applyStep(false);
    $('count').textContent = `${cur + 1} / ${slides.length}`;
    $('bar').firstElementChild.style.width = `${((cur + 1) / slides.length) * 100}%`;
    $('prev').disabled = cur === 0;
    $('next').disabled = cur === slides.length - 1 && step >= (slides[cur].steps || 0);
    try { history.replaceState(null, '', `#${cur + 1}`); } catch (e) { /* sandboxed viewers may refuse */ }
    state.kick = 1;
  };

  const next = () => {
    if (step < (slides[cur].steps || 0)) { step++; applyStep(true); state.kick = 0.6; $('next').disabled = cur === slides.length - 1 && step >= slides[cur].steps; }
    else show(cur + 1);
  };
  const prev = () => {
    if (step > 0) { step--; applyStep(false); $('next').disabled = false; }
    else show(cur - 1, true);
  };

  const toggleFs = () => { const p = document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen(); if (p && p.catch) p.catch(() => {}); };
  $('next').onclick = next;
  $('prev').onclick = prev;
  $('fs').onclick = toggleFs;
  $('restart').onclick = () => show(0);
  stage.querySelectorAll('.phone .snd').forEach((b) => (b.onclick = () => {
    const v = b.parentElement.querySelector('video');
    v.muted = !v.muted;
    b.parentElement.classList.toggle('loud', !v.muted);
  }));

  // overview of all slides, for jumping around during Q&A
  const ov = $('ov');
  ov.innerHTML = els.map((el, n) => `<button data-n="${n}"><b>${n + 1}</b>${(el.querySelector('h1') || el).textContent.trim().replace(/\s+/g, ' ').slice(0, 60)}</button>`).join('');
  const toggleOv = (open = !ov.classList.contains('open')) => {
    ov.classList.toggle('open', open);
    ov.querySelectorAll('button').forEach((b) => b.classList.toggle('cur', +b.dataset.n === cur));
  };
  ov.onclick = (e) => { const b = e.target.closest('button'); if (b) show(+b.dataset.n); toggleOv(false); };
  $('count').onclick = () => toggleOv();

  // hide the controls and cursor when the mouse rests
  let idleTimer;
  const wake = () => { document.body.classList.remove('idle'); clearTimeout(idleTimer); idleTimer = setTimeout(() => document.body.classList.add('idle'), 3000); };
  addEventListener('pointermove', wake);
  wake();
  addEventListener('keydown', (e) => {
    const k = e.key;
    if (k === 'g' || k === 'G') return toggleOv();
    if (k === 'Escape') return toggleOv(false);
    if (ov.classList.contains('open')) return;
    if (['ArrowRight', 'PageDown', ' ', 'Enter'].includes(k)) { e.preventDefault(); next(); }
    else if (['ArrowLeft', 'PageUp', 'Backspace'].includes(k)) { e.preventDefault(); prev(); }
    else if (k === 'Home') show(0);
    else if (k === 'End') show(slides.length - 1);
    else if (k === 'f' || k === 'F') toggleFs();
  });

  // ---------- layout ----------
  let three = null;
  const fit = () => {
    const k = Math.min(innerWidth / 1920, innerHeight / 1080);
    stage.style.transform = `scale(${k}) translate(-50%, -50%)`;
    if (three) three.resize();
  };
  addEventListener('resize', fit);

  if (STATIC) document.documentElement.classList.add('static');
  try { three = initBackground($('bg'), slides, state); } catch (e) { console.warn('3D background unavailable', e); }
  fit();
  show((parseInt(location.hash.slice(1)) || 1) - 1, STATIC);
}
