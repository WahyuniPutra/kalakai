#!/usr/bin/env bash
set -Eeuo pipefail
cd /app
export HOME=/app NEXT_TELEMETRY_DISABLED=1 NODE_OPTIONS=--max-old-space-size=1024
export APP_NAME=KalakaiPreview APP_ENV=production APP_DEBUG=false APP_URL="$PREVIEW_URL"
export FRONTEND_URL="$PREVIEW_URL" DB_CONNECTION=sqlite DB_DATABASE=/app/demo.sqlite
export SESSION_DRIVER=file CACHE_STORE=file QUEUE_CONNECTION=sync MAIL_MAILER=log LOG_CHANNEL=stderr
export KALAKAI_API_URL=http://127.0.0.1:8080 NEXT_PUBLIC_SITE_URL="$PREVIEW_URL" NEXT_PUBLIC_BACKEND_URL=/backend
if [[ ! -f /app/.kalakai-key ]]; then
    umask 077
    php -r 'echo "base64:".base64_encode(random_bytes(32));' >/app/.kalakai-key
    umask 022
fi
export APP_KEY="$(cat /app/.kalakai-key)"
if [[ ! -f /app/.kalakai-built ]]; then
    ( cd backend
      touch /app/demo.sqlite
      composer install --no-dev --prefer-dist --no-interaction --optimize-autoloader --no-progress
      php artisan migrate --force --no-interaction
      if [[ -f database/seeders/EventDemoSeeder.php ]]; then
          php artisan db:seed --class=EventDemoSeeder --force --no-interaction
      fi )
fi
(
    cd backend
    exec php -S 0.0.0.0:8080 -t public public/index.php
) &
backend=$!
trap 'kill "$backend" "${web:-}" 2>/dev/null || true' EXIT
curl -fsS --retry 10 --retry-connrefused --retry-delay 1 http://127.0.0.1:8080/api/health >/dev/null
cd frontend
if [[ ! -f /app/.kalakai-built ]]; then
    npm ci --no-audit --no-fund
    if [[ -d opendesign ]]; then
        pnpm --dir opendesign install --frozen-lockfile
        pnpm --dir opendesign build
        test -s public/opendesign/index.html
        rm -rf opendesign/node_modules
    fi
    node node_modules/next/dist/bin/next build
    test -s .next/BUILD_ID
    touch /app/.kalakai-built
fi
node node_modules/next/dist/bin/next start --hostname 0.0.0.0 --port 3000 &
web=$!
wait -n "$backend" "$web"
