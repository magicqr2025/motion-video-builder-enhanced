#!/usr/bin/env node
// Manage MotionStudio admins (studio/admins.json). Run from the project folder, for example:
//   node studio/bin/admin.mjs add priya --name "Priya Shah" --days 180
//   node studio/bin/admin.mjs add rahul "My-Password-1" --expires 2027-03-31
//   node studio/bin/admin.mjs list
//   node studio/bin/admin.mjs expire priya --expires 2027-12-31      (or --days 90 from today)
//   node studio/bin/admin.mjs passwd priya                            (new random password; or give one)
//   node studio/bin/admin.mjs disable priya | enable priya | remove priya
// Passwords are saved as salted hashes. If you leave the password out, a strong one is generated and printed once.
import crypto from 'node:crypto';
import {hashPassword, readAdmins, writeAdmins, daysLeft, blocked, ADMINS_FILE} from '../server/auth.mjs';

const args = process.argv.slice(2);
const flag = (name) => { const i = args.indexOf(`--${name}`); if (i < 0) return undefined; const v = args[i + 1]; args.splice(i, v === undefined || v.startsWith('--') ? 1 : 2); return v === undefined || v.startsWith('--') ? true : v; };
const name = flag('name'), expires = flag('expires'), days = flag('days');
const [cmd, rawUser, givenPassword] = args;
const user = String(rawUser ?? '').trim().toLowerCase();

const die = (m) => { console.error(`\n  ${m}\n`); process.exit(1); };
const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const expiry = (fallbackDays) => {
  if (expires) { if (!/^\d{4}-\d{2}-\d{2}$/.test(String(expires)) || Number.isNaN(Date.parse(expires))) die('Use --expires YYYY-MM-DD, for example --expires 2027-03-31'); return String(expires); }
  const n = Number(days ?? fallbackDays);
  if (!Number.isFinite(n) || n <= 0) die('--days must be a positive number.');
  const d = new Date(); d.setDate(d.getDate() + Math.round(n)); return ymd(d);
};
const randomPassword = () => { const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'; return Array.from(crypto.randomBytes(14), (b) => chars[b % chars.length]).join(''); };
const find = (admins) => { const a = admins.find((x) => x.username === user); if (!a) die(`No admin called "${user}". Run "node studio/bin/admin.mjs list" to see them.`); return a; };

const admins = readAdmins().map((a) => ({...a}));
const save = () => writeAdmins(admins);

switch (cmd) {
  case 'add': {
    if (!/^[a-z0-9._-]{3,32}$/.test(user)) die('Username: 3 to 32 letters, numbers, dot, dash or underscore.');
    if (admins.some((a) => a.username === user)) die(`"${user}" already exists. Use "passwd" or "expire" to change it.`);
    const password = givenPassword ?? randomPassword();
    if (password.length < 8) die('The password needs at least 8 characters.');
    admins.push({username: user, name: typeof name === 'string' ? name : user, passwordHash: hashPassword(password), createdAt: new Date().toISOString(), expiresAt: expiry(365), disabled: false});
    save();
    const a = admins.at(-1);
    console.log(`\n  Added admin "${a.username}" (${a.name}), valid until ${a.expiresAt}.${givenPassword ? '' : `\n  Password (shown once, it is stored as a hash): ${password}`}\n`);
    break;
  }
  case 'list': {
    if (!admins.length) { console.log('\n  No admins yet. Add one with: node studio/bin/admin.mjs add <username>\n'); break; }
    console.log('');
    for (const a of admins) { const why = blocked(a); console.log(`  ${a.username.padEnd(20)} ${(a.name ?? '').padEnd(24)} expires ${a.expiresAt ?? 'never set'} ${why ? `[${why}]` : `(${daysLeft(a)} days left)`}`); }
    console.log(`\n  File: ${ADMINS_FILE}\n`);
    break;
  }
  case 'expire': { const a = find(admins); a.expiresAt = expiry(365); save(); console.log(`\n  "${a.username}" now expires on ${a.expiresAt}.\n`); break; }
  case 'passwd': {
    const a = find(admins), password = givenPassword ?? randomPassword();
    if (password.length < 8) die('The password needs at least 8 characters.');
    a.passwordHash = hashPassword(password); save();
    console.log(`\n  New password for "${a.username}"${givenPassword ? ' saved.' : ` (shown once): ${password}`}\n`);
    break;
  }
  case 'disable': { const a = find(admins); a.disabled = true; save(); console.log(`\n  "${a.username}" is disabled.\n`); break; }
  case 'enable': { const a = find(admins); a.disabled = false; save(); console.log(`\n  "${a.username}" is enabled.\n`); break; }
  case 'remove': { const a = find(admins); admins.splice(admins.indexOf(a), 1); save(); console.log(`\n  Removed "${a.username}".\n`); break; }
  default:
    console.log(`\n  MotionStudio admins\n\n  node studio/bin/admin.mjs add <username> [password] [--name "Full Name"] [--days 365 | --expires YYYY-MM-DD]\n  node studio/bin/admin.mjs list\n  node studio/bin/admin.mjs expire <username> [--days N | --expires YYYY-MM-DD]\n  node studio/bin/admin.mjs passwd <username> [password]\n  node studio/bin/admin.mjs disable|enable|remove <username>\n`);
}
