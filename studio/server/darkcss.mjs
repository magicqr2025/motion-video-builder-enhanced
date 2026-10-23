// Dark theme, generated from the light stylesheets: every rule that sets a light colour gets a dark twin under
// html[data-theme="dark"]. Regenerated at startup whenever a stylesheet is newer than web/dark.css, so new CSS follows the theme.
import fs from 'node:fs';
import path from 'node:path';
import {WEB} from './paths.mjs';

const OUT = path.join(WEB, 'dark.css');
const OUT_WEIGHTS = path.join(WEB, 'weights.css');
const SKIP_FILES = new Set(['dark.css', 'weights.css']);

// ---------- colour maths ----------
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const toHsl = ([r, g, b]) => {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
  if (!d) return [0, 0, l];
  const s = d / (1 - Math.abs(2 * l - 1));
  const h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [(h * 60 + 360) % 360, s, l];
};
const fromHsl = ([h, s, l]) => {
  const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = l - c / 2;
  const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return [r, g, b].map((v) => Math.round((v + m) * 255));
};
const parseColor = (t) => {
  t = t.trim();
  let m = t.match(/^#([0-9a-f]{3,8})$/i);
  if (m) {
    let h = m[1];
    if (h.length === 3 || h.length === 4) h = [...h].map((c) => c + c).join('');
    if (h.length !== 6 && h.length !== 8) return null;
    return {rgb: [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)), a: h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1};
  }
  m = t.match(/^rgba?\(\s*([\d.]+)[ ,]+([\d.]+)[ ,]+([\d.]+)(?:[ ,/]+([\d.]+%?))?\s*\)$/i);
  if (m) return {rgb: [m[1], m[2], m[3]].map(Number), a: m[4] == null ? 1 : m[4].endsWith('%') ? parseFloat(m[4]) / 100 : Number(m[4])};
  if (/^white$/i.test(t)) return {rgb: [255, 255, 255], a: 1};
  return null;
};
const out = (rgb, a) => (a < 1 ? `rgba(${rgb.join(',')},${+a.toFixed(3)})` : `#${rgb.map((v) => clamp(v, 0, 255).toString(16).padStart(2, '0')).join('')}`);

// How a colour changes depending on what it paints. The dark theme is neutral grey: anything blue (surfaces, borders,
// buttons, links) becomes grey, while green / orange / gold / red keep their hue as status colours.
const NEUTRAL = (s) => s < 0.18;
const isBlue = (h, s) => s >= 0.18 && h >= 185 && h <= 265;
const grey = (l) => [0, 0.03, l];
const greyed = (orig, mapped) => (isBlue(orig[0], orig[1]) || NEUTRAL(orig[1]) ? grey(mapped[2]) : mapped);
const MAPS = {
  bg: (c) => {
    const [h, s, l] = c;
    // light surfaces go dark (keeping their order: lighter stays lighter); bright brand fills are calmed down instead of glaring
    const r = l >= 0.78 ? [h, s * 0.5, 0.075 + (l - 0.78) * 0.4] : l >= 0.5 && s < 0.25 ? [h, s, 1 - l] : s >= 0.5 && l >= 0.3 ? [h, s * 0.7, l * 0.72] : [h, s, l];
    return greyed(c, r);
  },
  fg: (c) => {
    const [h, s, l] = c;
    if (isBlue(h, s)) return grey(0.8); // blue text (links, active tabs) becomes light grey
    return l >= 0.62 ? [h, s, l >= 0.95 ? 0.89 : Math.min(l, 0.78)] : s >= 0.35 ? [h, s * 0.9, 0.66] : [h, Math.min(s, 0.3), 0.84 - l * 0.42];
  },
  line: (c) => {
    const [h, s, l] = c;
    return greyed(c, l >= 0.78 ? [h, s * 0.5, 0.17 + (1 - l) * 0.35] : l >= 0.5 ? [h, s * 0.5, 0.26] : [h, s, l]);
  },
};
const mapColor = (text, kind) => {
  const c = parseColor(text);
  if (!c) return text;
  if (c.a < 0.5 && kind !== 'fg') return text; // see-through glass over a dark area: leave as is
  const [h, s, l] = MAPS[kind](toHsl(c.rgb));
  const rgb = fromHsl([h, clamp(s), clamp(l)]);
  return rgb.every((v, i) => v === c.rgb[i]) ? text : out(rgb, c.a);
};
const COLOR_RE = /#[0-9a-f]{3,8}\b|rgba?\([^)]*\)|\bwhite\b/gi;
const mapValue = (value, kind) => value.replace(COLOR_RE, (c) => mapColor(c, kind));

const KIND = (prop) => {
  if (/^(background|background-color|background-image)$/.test(prop)) return 'bg';
  if (/^(color|fill|caret-color)$/.test(prop)) return 'fg';
  if (/^(border|border-(top|right|bottom|left)(-color)?|border-color|outline|outline-color|box-shadow|text-decoration-color|accent-color)$/.test(prop)) return 'line';
  return null;
};

// ---------- a small CSS reader (the studio's CSS is plain: rules, @media blocks, @keyframes) ----------
const strip = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '');
const splitTop = (s, sep = ',') => { const parts = []; let depth = 0, cur = ''; for (const ch of s) { if ('([{'.includes(ch)) depth++; if (')]}'.includes(ch)) depth--; if (ch === sep && !depth) { parts.push(cur); cur = ''; } else cur += ch; } if (cur.trim()) parts.push(cur); return parts; };
const readBlock = (css, i) => { let depth = 0; for (let j = i; j < css.length; j++) { if (css[j] === '{') depth++; else if (css[j] === '}' && --depth === 0) return j; } return css.length; };

const dark = (sel) => {
  sel = sel.trim();
  if (!sel || sel.startsWith(':root')) return null;
  const P = 'html[data-theme="dark"]';
  if (sel === 'html') return P;
  if (sel.startsWith('html ')) return `${P} ${sel.slice(5)}`;
  return `${P} ${sel}`;
};

const convert = (css, wrapIn = null) => {
  const rules = [];
  let i = 0;
  while (i < css.length) {
    const open = css.indexOf('{', i);
    if (open < 0) break;
    const head = css.slice(i, open).trim(), close = readBlock(css, open), body = css.slice(open + 1, close);
    i = close + 1;
    if (head.startsWith('@media') || head.startsWith('@supports') || head.startsWith('@container')) {
      const inner = convert(body);
      if (inner) rules.push(`${head} {\n${inner}\n}`);
      continue;
    }
    if (head.startsWith('@')) continue; // keyframes, font-face, import: nothing to map
    const decls = splitTop(body, ';').map((d) => d.trim()).filter(Boolean).map((d) => { const k = d.indexOf(':'); return k < 0 ? null : [d.slice(0, k).trim().toLowerCase(), d.slice(k + 1).trim()]; }).filter(Boolean);
    const changed = [];
    // a rule whose own background stays bright (gold button, gradients) keeps its dark text
    const brightBg = decls.some(([k, v]) => KIND(k) === 'bg' && COLOR_RE.test(v) && mapValue(v, 'bg') === v);
    COLOR_RE.lastIndex = 0;
    for (const [prop, value] of decls) {
      const kind = KIND(prop);
      if (kind === 'fg' && brightBg) continue;
      // text painted with the dark brand colours would vanish on a dark page
      if (kind === 'fg' && /^var\(--(navy|deep|blue)\)$/.test(value)) { changed.push(`${prop}: ${value.includes('navy') ? 'var(--ink)' : '#cfcfcf'}`); continue; }
      if (!kind || /var\(/.test(value) && !COLOR_RE.test(value)) { COLOR_RE.lastIndex = 0; continue; }
      COLOR_RE.lastIndex = 0;
      const next = mapValue(value, kind);
      // a bright background (brand gradient) is re-stated so it still beats the darker .btn / .card twins that have less specific light rules
      if (next === value && kind === 'bg' && /#|rgb/.test(value)) { changed.push(`${prop}: ${value}`); continue; }
      if (next !== value) changed.push(`${prop}: ${next.replace(/\s*!important$/, '')}`);
    }
    if (!changed.length) continue;
    const sels = splitTop(head).map(dark).filter(Boolean);
    if (sels.length) rules.push(`${sels.join(',\n')} { ${changed.join('; ')}; }`);
  }
  return rules.join('\n');
};

const VARS = `html[data-theme="dark"] {
  color-scheme: dark;
  --ink: #c2c2c2; --slate: #9a9a9a; --muted: #707070; --line: #2e2e2e; --soft: #202020; --bg: #121212; --card: #1b1b1b;
  --deep: #4d4d4d; --blue: #5c5c5c; --navy: #232323;
  --shadow: 0 1px 0 #262626, 0 10px 30px rgba(0,0,0,.4);
}
html[data-theme="dark"] body { background: var(--bg); color: var(--ink); }
html[data-theme="dark"] img, html[data-theme="dark"] video, html[data-theme="dark"] iframe { color-scheme: normal; }
html[data-theme="dark"] ::-webkit-scrollbar-thumb { background: #3a3a3a; }
html[data-theme="dark"] input:focus, html[data-theme="dark"] textarea:focus, html[data-theme="dark"] select:focus { outline-color: #555; border-color: #777; }
`;

// ---------- lighter type: one step down the weight scale, so only real headings read as bold ----------
const WEIGHT = {800: 600, 700: 600, 600: 500, 500: 400};
const convertWeights = (css) => {
  const rules = [];
  let i = 0;
  while (i < css.length) {
    const open = css.indexOf('{', i);
    if (open < 0) break;
    const head = css.slice(i, open).trim(), close = readBlock(css, open), body = css.slice(open + 1, close);
    i = close + 1;
    if (head.startsWith('@media') || head.startsWith('@supports') || head.startsWith('@container')) {
      const inner = convertWeights(body);
      if (inner) rules.push(`${head} {\n${inner}\n}`);
      continue;
    }
    if (head.startsWith('@')) continue;
    const m = body.match(/(?:^|;)\s*font-weight\s*:\s*(\d+)/);
    if (m && WEIGHT[m[1]]) rules.push(`${head} { font-weight: ${WEIGHT[m[1]]}; }`);
  }
  return rules.join('\n');
};

export const buildWeightsCss = () => {
  const order = ['style.css', 'look.css', 'theme.css', 'activity.css', 'tools.css', 'review.css', 'files.css', 'menu.css', 'brief.css'];
  const files = fs.readdirSync(WEB).filter((f) => f.endsWith('.css') && !SKIP_FILES.has(f)).sort((a, b) => (order.indexOf(a) < 0 ? 99 : order.indexOf(a)) - (order.indexOf(b) < 0 ? 99 : order.indexOf(b)));
  const parts = files.map((f) => convertWeights(strip(fs.readFileSync(path.join(WEB, f), 'utf8'))));
  return `/* GENERATED by server/darkcss.mjs from the other stylesheets: every font-weight one step lighter. Do not edit. */\nb, strong, th { font-weight: 600; }\n${parts.join('\n')}\n`;
};

export const buildDarkCss = () => {
  const files = fs.readdirSync(WEB).filter((f) => f.endsWith('.css') && !SKIP_FILES.has(f)).sort();
  const order = ['style.css', 'look.css', 'theme.css', 'activity.css', 'tools.css', 'review.css', 'files.css', 'menu.css', 'brief.css'];
  files.sort((a, b) => (order.indexOf(a) < 0 ? 99 : order.indexOf(a)) - (order.indexOf(b) < 0 ? 99 : order.indexOf(b)));
  const parts = files.map((f) => `/* from ${f} */\n${convert(strip(fs.readFileSync(path.join(WEB, f), 'utf8')))}`);
  return `/* GENERATED by server/darkcss.mjs from the other stylesheets. Do not edit: it is rebuilt when they change. */\n${VARS}\n${parts.join('\n\n')}\n`;
};

export const ensureDarkCss = () => {
  try {
    const newest = Math.max(...fs.readdirSync(WEB).filter((f) => f.endsWith('.css') && !SKIP_FILES.has(f)).map((f) => fs.statSync(path.join(WEB, f)).mtimeMs));
    let rebuilt = false;
    for (const [file, build] of [[OUT, buildDarkCss], [OUT_WEIGHTS, buildWeightsCss]]) {
      if (fs.existsSync(file) && fs.statSync(file).mtimeMs >= newest) continue;
      fs.writeFileSync(file, build()); rebuilt = true;
    }
    return rebuilt;
  } catch (e) { console.log(`  ! Could not build the generated stylesheets: ${e.message}`); return false; }
};
