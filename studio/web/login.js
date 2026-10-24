// Sign-in page. Posts to /api/login, then goes on to the page that was asked for.
const $ = (s) => document.querySelector(s);
const form = $('#lg-form'), err = $('#lg-err'), go = $('#lg-go');

// lets the desktop launcher know a window is open (see /api/presence)
try { new EventSource('/api/presence'); } catch { /* not important */ }

$('#lg-eye').addEventListener('click', () => {
  const p = $('#lg-pass'), show = p.type === 'password';
  p.type = show ? 'text' : 'password';
  $('#lg-eye').title = $('#lg-eye').ariaLabel = show ? 'Hide password' : 'Show password';
});

const showError = (m) => { err.textContent = m; err.hidden = !m; };
const next = () => { const n = new URLSearchParams(location.search).get('next'); return n && n.startsWith('/') && !n.startsWith('//') && !n.startsWith('/login') ? n : '/'; };

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  showError('');
  const username = $('#lg-user').value.trim(), password = $('#lg-pass').value;
  if (!username || !password) return showError('Enter your username and password.');
  go.disabled = true; go.textContent = 'Signing in…';
  try {
    const r = await fetch('/api/login', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({username, password})});
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.error || 'Could not sign in.');
    location.replace(next());
  } catch (x) {
    showError(x.message === 'Failed to fetch' ? 'Could not reach MotionStudio. Is it still running?' : x.message);
    go.disabled = false; go.textContent = 'Sign in';
    $('#lg-pass').select();
  }
});
