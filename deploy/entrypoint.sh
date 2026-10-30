#!/bin/sh
# Installs the npm packages the first time (and whenever a package-lock.json changes), then starts the command.
set -e
cd /app
for d in studio magicbolt-reel; do
  want=$(sha1sum "$d/package-lock.json" | cut -d' ' -f1)
  have=$(cat "$d/node_modules/.lockhash" 2>/dev/null || true)
  if [ "$want" != "$have" ]; then
    echo "Installing $d packages..."
    (cd "$d" && npm ci --no-audit --no-fund)
    echo "$want" > "$d/node_modules/.lockhash"
  fi
done
exec "$@"
