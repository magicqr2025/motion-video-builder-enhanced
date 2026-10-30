# Running MotionStudio on a Linux VPS

Docker runs the studio and a Cloudflare Tunnel. The VPS opens **no web ports**: visitors reach Cloudflare, Cloudflare reaches the
tunnel, and your server's IP never shows. Sign-in is the studio's own admin login.

Two hostnames are used, both pointing at the same tunnel: `studio.example.com` (the app) and `preview.example.com` (the live
Remotion preview shown inside the app). Both must be under the same domain so the sign-in cookie is shared.

## 1. Cloudflare (once)

1. Zero Trust dashboard > Networks > Tunnels > Create a tunnel > Cloudflared. Name it `motionstudio`. Copy the **token**.
2. Add two public hostnames to that tunnel, both with service `HTTP` and URL `localhost:4321`:
   - `studio.example.com`
   - `preview.example.com`
3. Do **not** put Cloudflare Access on `preview.example.com`: the preview is loaded inside the app, and an Access login screen cannot
   show inside it. The studio checks the admin sign-in on that hostname itself.

## 2. VPS (once)

```bash
# Docker (skip if installed)
curl -fsSL https://get.docker.com | sh && sudo usermod -aG docker $USER   # log out and in again

git clone <your repo url> motionstudio && cd motionstudio
cp .env.example .env && nano .env          # PREVIEW_HOST, COOKIE_DOMAIN (.example.com), TUNNEL_TOKEN, PUID/PGID (run `id`)
mkdir -p deploy/state/claude

docker compose build
docker compose run --rm studio claude login      # open the link in your own browser, paste the code back
docker compose run --rm studio node studio/bin/admin.mjs add youname --name "Your Name" --days 365   # prints the password once
docker compose up -d
docker compose logs -f studio                    # first start installs packages (a few minutes)
```

Open `https://studio.example.com` and sign in.

## 3. Daily use

| Task | Command |
| --- | --- |
| Update the code | `git pull && docker compose up -d` (packages reinstall by themselves if a lock file changed) |
| Update the image (Node, Claude CLI) | `docker compose build --pull && docker compose up -d` |
| Logs | `docker compose logs -f studio` |
| Restart | `docker compose restart studio` |
| Status | `docker compose ps` (the studio shows `healthy`) |

Everything starts again by itself after a crash or a reboot (`restart: unless-stopped`, Docker starts on boot).

## 4. Your data

Projects, renders, uploads and `admins.json` live in the repo folder on the VPS (`studio/data`, `magicbolt-reel/public/studio`,
`magicbolt-reel/src/studio`, `magicbolt-reel/out`). Git ignores `studio/data` and `admins.json`, so they do not travel with a clone.

To move your existing work from the PC (run on the PC, in Git Bash or WSL):

```bash
rsync -avz --exclude node_modules --exclude .git ./studio/data/ ./studio/admins.json user@VPS:~/motionstudio/studio/ 
rsync -avz --exclude node_modules ./magicbolt-reel/public/ user@VPS:~/motionstudio/magicbolt-reel/public/
```

Back up the repo folder (and `deploy/state/claude`) nightly, for example with `restic` to any object storage. Renders are large: watch the disk with `df -h`.

## 5. Notes

- **Claude login:** the studio deliberately uses only the Claude Code login (API keys in the environment are ignored). `claude login`
  runs once; the login is kept in `deploy/state/claude`. If it ever expires, run the login command again. Check that your Claude plan's
  terms allow use from a server.
- **Size:** 4 vCPU and 8 GB RAM is comfortable for renders. With less, a render may be killed for lack of memory.
- **Extra lock:** you can also put Cloudflare Access (or a WAF rule limiting to your country) on `studio.example.com` only.
- **Windows files:** `MotionStudio.exe`, `.cmd` and the `launcher/` folder are for the PC and are unused on the server.
- If the preview box stays blank: `docker compose logs studio` and look for the "Remotion preview" lines.
