// Serves the Remotion live preview on its own hostname (PREVIEW_HOST, e.g. preview.example.com) through this server,
// so one Cloudflare Tunnel entry and one sign-in cover both. The preview itself stays on 127.0.0.1 and is never exposed.
import http from 'node:http';
import {adminOf} from './auth.mjs';

const hostOf = (req) => String(req.headers.host ?? '').split(':')[0].toLowerCase();

export const previewHttp = (app, {host, port}) => {
  if (!host) return;
  host = host.toLowerCase();
  const headers = (req) => ({...req.headers, host: `127.0.0.1:${port}`});
  app.use((req, res, next) => {
    if (hostOf(req) !== host) return next();
    if (!adminOf(req)) return res.status(401).type('text').send('Sign in to MotionStudio first, then reload this preview.');
    const up = http.request({host: '127.0.0.1', port, path: req.originalUrl, method: req.method, headers: headers(req)}, (r) => { res.writeHead(r.statusCode ?? 502, r.headers); r.pipe(res); });
    up.on('error', () => { if (!res.headersSent) res.status(502).type('text').send('The Remotion preview is not running yet.'); else res.end(); });
    req.pipe(up);
  });
};

// hot-reload websocket: call once the HTTP server exists
export const previewUpgrade = (server, {host, port}) => {
  if (!host) return;
  host = host.toLowerCase();
  const headers = (req) => ({...req.headers, host: `127.0.0.1:${port}`});
  server.on('upgrade', (req, socket, head) => {
    if (hostOf(req) !== host) return; // the studio itself has no websockets
    if (!adminOf(req)) { socket.write('HTTP/1.1 401 Unauthorized\r\nConnection: close\r\n\r\n'); return socket.destroy(); }
    const up = http.request({host: '127.0.0.1', port, path: req.url, method: req.method, headers: headers(req)});
    up.on('upgrade', (r, upSocket, upHead) => {
      socket.write(`HTTP/1.1 101 Switching Protocols\r\n${Object.entries(r.headers).map(([k, v]) => `${k}: ${v}`).join('\r\n')}\r\n\r\n`);
      if (upHead?.length) socket.write(upHead);
      if (head?.length) upSocket.write(head);
      upSocket.pipe(socket); socket.pipe(upSocket);
      const end = () => { upSocket.destroy(); socket.destroy(); };
      upSocket.on('error', end); socket.on('error', end); upSocket.on('close', end); socket.on('close', end);
    });
    up.on('error', () => socket.destroy());
    up.end();
  });
};
