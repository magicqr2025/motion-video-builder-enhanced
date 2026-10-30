// Admin sign-in for MotionStudio.
// Admins live in studio/admins.json and are added from the command line (studio/bin/admin.mjs); there is no sign-up page.
// Passwords are stored as salted scrypt hashes, never as text. Every admin has an expiry date.
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {STUDIO, WEB, DATA} from './paths.mjs';

export const ADMINS_FILE = path.join(STUDIO, 'admins.json');
const SECRET_FILE = path.join(DATA, 'session-secret');
const COOKIE = 'ms_session';
const SESSION_MS = 12 * 60 * 60 * 1000;

// ---------- passwords ----------
export const hashPassword = (password) => {
  const salt = crypto.randomBytes(16);
  const N = 16384, r = 8, p = 1;
  const hash = crypto.scryptSync(String(password), salt, 64, {N, r, p});
  return `scrypt$${N}$${r}$${p}$${salt.toString('base64')}$${hash.toString('base64')}`;
};
export const verifyPassword = (password, stored) => {
  try {
    const [kind, N, r, p, salt, hash] = String(stored).split('$');
    if (kind !== 'scrypt') return false;
    const want = Buffer.from(hash, 'base64');
    const got = crypto.scryptSync(String(password), Buffer.from(salt, 'base64'), want.length, {N: +N, r: +r, p: +p});
    return crypto.timingSafeEqual(got, want);
  } catch { return false; }
};
const DUMMY = hashPassword('not-a-real-password'); // compared against when the user does not exist, so timing does not reveal who exists

// ---------- the admin file ----------
let cache = {mtime: 0, admins: []};
export const readAdmins = () => {
  try {
    const st = fs.statSync(ADMINS_FILE);
    if (st.mtimeMs !== cache.mtime) cache = {mtime: st.mtimeMs, admins: (JSON.parse(fs.readFileSync(ADMINS_FILE, 'utf8')).admins ?? []).map((a) => ({...a, username: String(a.username).toLowerCase()}))};
  } catch { cache = {mtime: 0, admins: []}; }
  return cache.admins;
};
export const writeAdmins = (admins) => { fs.writeFileSync(ADMINS_FILE, `${JSON.stringify({admins}, null, 2)}\n`); cache.mtime = 0; };

const endOfDay = (ymd) => { const m = String(ymd ?? '').match(/^(\d{4})-(\d{2})-(\d{2})$/); return m ? new Date(+m[1], +m[2] - 1, +m[3], 23, 59, 59, 999).getTime() : NaN; };
export const daysLeft = (a) => Math.ceil((endOfDay(a.expiresAt) - Date.now()) / 86400000);
// null when the admin may sign in, otherwise why not
export const blocked = (a) => {
  if (!a) return 'unknown';
  if (a.disabled) return 'disabled';
  const end = endOfDay(a.expiresAt);
  if (!Number.isFinite(end)) return 'expired'; // an admin without a valid expiry date never gets in
  if (Date.now() > end) return 'expired';
  return null;
};
const publicAdmin = (a) => ({username: a.username, name: a.name || a.username, expiresAt: a.expiresAt, daysLeft: daysLeft(a)});

// ---------- signed session cookie ----------
const secret = (() => {
  try { return fs.readFileSync(SECRET_FILE, 'utf8').trim(); } catch { /* first run */ }
  const s = crypto.randomBytes(32).toString('hex');
  try { fs.mkdirSync(DATA, {recursive: true}); fs.writeFileSync(SECRET_FILE, s); } catch { /* sessions then last until the next restart */ }
  return s;
})();
const sign = (body) => crypto.createHmac('sha256', secret).update(body).digest('base64url');
const makeToken = (username) => { const body = Buffer.from(JSON.stringify({u: username, exp: Date.now() + SESSION_MS})).toString('base64url'); return `${body}.${sign(body)}`; };
const readToken = (token) => {
  const [body, sig] = String(token ?? '').split('.');
  if (!body || !sig) return null;
  const a = Buffer.from(sig), b = Buffer.from(sign(body));
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try { const t = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')); return t.exp > Date.now() ? t : null; } catch { return null; }
};
const cookieOf = (req) => { const m = String(req.headers.cookie ?? '').match(new RegExp(`(?:^|; )${COOKIE}=([^;]+)`)); return m ? decodeURIComponent(m[1]) : ''; };
// On a server: COOKIE_DOMAIN=.example.com shares the sign-in with the preview hostname, COOKIE_SECURE=1 when served over https
const cookieExtra = `${process.env.COOKIE_DOMAIN ? `; Domain=${process.env.COOKIE_DOMAIN}` : ''}${process.env.COOKIE_SECURE ? '; Secure' : ''}`;
const setCookie = (res, token, maxAgeMs) => res.append('Set-Cookie', `${COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${Math.floor(maxAgeMs / 1000)}${cookieExtra}`);

export const adminOf = (req) => {
  const t = readToken(cookieOf(req));
  if (!t) return null;
  const a = readAdmins().find((x) => x.username === t.u);
  return a && !blocked(a) ? a : null; // removing or expiring an admin signs them out on their next request
};

// ---------- too many wrong passwords ----------
const fails = new Map(); // "ip|user" -> {n, until}
const throttleKey = (req, user) => `${req.ip}|${user}`;
const lockedFor = (key) => { const f = fails.get(key); return f && f.until > Date.now() ? Math.ceil((f.until - Date.now()) / 1000) : 0; };
const fail = (key) => { const f = fails.get(key) ?? {n: 0, until: 0}; f.n += 1; if (f.n >= 5) { f.until = Date.now() + 60_000; f.n = 0; } fails.set(key, f); };

// ---------- wiring ----------
const PUBLIC = new Set(['/login', '/login.html', '/login.css', '/login.js', '/api/login', '/api/logout', '/api/presence', '/api/health', '/favicon.ico']);
const page = (file) => (req, res) => res.set('Cache-Control', 'no-cache').sendFile(path.join(WEB, file));

export const mountAuth = (app, {log = () => {}} = {}) => {
  app.get('/login', (req, res) => (adminOf(req) ? res.redirect('/') : page('login.html')(req, res)));
  app.get('/login.css', page('login.css'));
  app.get('/login.js', page('login.js'));

  app.post('/api/login', (req, res) => {
    const username = String(req.body?.username ?? '').trim().toLowerCase(), password = String(req.body?.password ?? '');
    const key = throttleKey(req, username), wait = lockedFor(key);
    if (wait) return res.status(429).json({error: `Too many wrong attempts. Try again in ${wait} seconds.`, retryAfter: wait});
    const admin = readAdmins().find((a) => a.username === username);
    const ok = verifyPassword(password, admin?.passwordHash ?? DUMMY) && !!admin;
    if (!ok) { fail(key); log(`Sign-in failed for “${username || '(empty)'}”`, 'warn'); return res.status(401).json({error: 'Wrong username or password.'}); }
    const why = blocked(admin);
    if (why) log(`Sign-in refused for “${admin.username}” (${why})`, 'warn');
    if (why === 'expired') return res.status(403).json({error: `This account expired on ${admin.expiresAt}. Contact MagicBolt.ai to renew access.`});
    if (why) return res.status(403).json({error: 'This account is disabled. Contact MagicBolt.ai.'});
    fails.delete(key);
    log(`${admin.name || admin.username} signed in`, 'ok');
    setCookie(res, makeToken(admin.username), SESSION_MS);
    res.json({ok: true, user: publicAdmin(admin)});
  });
  app.post('/api/logout', (req, res) => { setCookie(res, '', 0); res.json({ok: true}); });
  app.get('/api/session', (req, res) => { const a = adminOf(req); res.json({user: a ? publicAdmin(a) : null}); });

  // everything else needs a signed-in admin: pages go to the login page, the API answers 401
  app.use((req, res, next) => {
    if (PUBLIC.has(req.path)) return next();
    const a = adminOf(req);
    if (a) { req.admin = a; return next(); }
    if (req.path.startsWith('/api') || req.path.startsWith('/data') || req.path.startsWith('/public')) return res.status(401).json({error: 'Sign in required.', login: true});
    return res.redirect(`/login${req.path !== '/' ? `?next=${encodeURIComponent(req.originalUrl)}` : ''}`);
  });
};
