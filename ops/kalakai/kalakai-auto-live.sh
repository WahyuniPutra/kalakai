#!/usr/bin/env bash
set -Eeuo pipefail
umask 022
live=/srv/kalakai
state=/var/lib/kalakai-automation
sha=${1:?commit required}
mode=${2:-deploy}
[[ $sha =~ ^[a-f0-9]{40}$ ]]
cd "$live"
exec 9>.git/kalakai-deploy.lock
flock -n 9
git fetch --quiet origin refs/heads/main:refs/remotes/origin/main
[[ $(git rev-parse origin/main) == "$sha" ]]
before=$(git rev-parse HEAD)
[[ -z $(git status --porcelain --untracked-files=no) ]]
git merge-base --is-ancestor "$before" "$sha"
if [[ $mode == deploy && $before == "$sha" ]]; then exit 0; fi
stage=$(mktemp -d "$state/release-XXXXXXXX")
chmod 0755 "$stage"
backup=$(mktemp -d "$state/rollback-XXXXXXXX")
cleanup() {
    status=$?
    if [[ $stage == "$state"/release-* ]]; then sudo -n rm -rf -- "$stage"; fi
    rmdir "$backup" 2>/dev/null || true
    exit "$status"
}
trap cleanup EXIT
git archive "$sha" | tar -x -C "$stage"
if git diff --quiet "$before" "$sha" -- backend/composer.lock backend/composer.json; then
    cp -a --reflink=auto backend/vendor "$stage/backend/"
else
    ( cd "$stage/backend"; composer install --no-dev --prefer-dist --no-interaction --optimize-autoloader --no-progress )
fi
if git diff --quiet "$before" "$sha" -- frontend/package-lock.json frontend/package.json; then
    cp -a --reflink=auto frontend/node_modules "$stage/frontend/"
else
    ( cd "$stage/frontend"; npm ci --no-audit --no-fund )
fi
cp frontend/.env.production.local "$stage/frontend/.env.production.local"
chmod 0600 "$stage/frontend/.env.production.local"
if [[ -d $stage/frontend/opendesign ]]; then
    if [[ -s frontend/public/opendesign/index.html ]] && git diff --quiet "$before" "$sha" -- frontend/opendesign; then
        cp -a frontend/public/opendesign "$stage/frontend/public/"
    else
        ( cd "$stage/frontend"
          npm exec --yes --package=pnpm@11.28.11 -- pnpm --dir opendesign install --frozen-lockfile
          npm exec --yes --package=pnpm@11.28.11 -- pnpm --dir opendesign build )
    fi
    test -s "$stage/frontend/public/opendesign/index.html"
fi
( cd "$stage/frontend"
  NEXT_TELEMETRY_DISABLED=1 NODE_OPTIONS=--max-old-space-size=1200 node node_modules/next/dist/bin/next build )
test -s "$stage/frontend/.next/BUILD_ID"
if [[ $mode == check ]]; then echo "LIVE BUILD VERIFIED $sha (no promotion)"; exit 0; fi

git fetch --quiet origin refs/heads/main:refs/remotes/origin/main
[[ $(git rev-parse origin/main) == "$sha" ]]
printf '%s\n' "$before" > "$backup/commit"
sudo -n python3 - "$backup/database.sqlite" <<'PY'
import sqlite3, sys
with sqlite3.connect('file:/var/lib/kalakai/backend/database.sqlite?mode=ro', uri=True) as source:
    with sqlite3.connect(sys.argv[1]) as target:
        source.backup(target)
        assert target.execute('pragma integrity_check').fetchone()[0] == 'ok'
PY
sudo -n chmod 0600 "$backup/database.sqlite"
chmod -R a+rX "$stage/frontend/.next"
sudo -n cp -a --update=none frontend/.next/static/. "$stage/frontend/.next/static/"
sudo -n chown -R kalakai-web:kalakai-web "$stage/frontend/.next"
changed=()
restore() {
    rc=$?
    trap - ERR
    set +e
    sudo -n systemctl stop kalakai-web
    git reset --hard "$before"
    for path in "${changed[@]}"; do
        if [[ -e $path ]]; then sudo -n mv -- "$path" "$backup/failed-${path//\//-}"; fi
        if sudo -n test -e "$backup/${path//\//-}"; then
            sudo -n mv -- "$backup/${path//\//-}" "$path"
        fi
    done
    sudo -n -u www-data php backend/artisan route:cache
    sudo -n -u www-data php backend/artisan up
    sudo -n systemctl reload php8.5-fpm
    sudo -n systemctl start kalakai-web
    echo "LIVE PROMOTION FAILED; previous code restored. Database snapshot: $backup/database.sqlite" >&2
    exit "$rc"
}
trap restore ERR
sudo -n -u www-data php backend/artisan down --retry=30
sudo -n systemctl stop kalakai-web
git merge --ff-only --quiet "$sha"
for path in frontend/.next frontend/node_modules backend/vendor frontend/public/opendesign; do
    if [[ -e $path ]]; then sudo -n mv -- "$path" "$backup/${path//\//-}"; fi
    changed+=("$path")
    if [[ -e $stage/$path ]]; then sudo -n mv -- "$stage/$path" "$path"; fi
done
sudo -n -u www-data php backend/artisan migrate --force --no-interaction
sudo -n -u www-data php backend/artisan route:cache
sudo -n systemctl reload php8.5-fpm
sudo -n -u www-data php backend/artisan up
sudo -n systemctl start kalakai-web
curl -fsS --retry 10 --retry-connrefused --retry-delay 1 http://127.0.0.1:3000/ >/dev/null
for path in / /login /api/health /ads.txt; do
    curl -fsS --resolve kalakai.site:443:127.0.0.1 "https://kalakai.site$path" >/dev/null
done
trap - ERR
echo "LIVE DEPLOYED $sha; rollback snapshot $backup"
mapfile -t snapshots < <(find "$state" -maxdepth 1 -type d -name 'rollback-*' -printf '%T@ %p\n' | sort -nr | cut -d' ' -f2-)
for expired in "${snapshots[@]:2}"; do
    if [[ $expired =~ ^/var/lib/kalakai-automation/rollback-[A-Za-z0-9]{8}$ ]]; then
        sudo -n rm -rf --one-file-system -- "$expired"
    fi
done
