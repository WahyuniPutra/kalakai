#!/usr/bin/env bash
set -Eeuo pipefail
pr=${1:?PR number required}
sha=${2:?commit required}
mode=${3:-deploy}
[[ $pr =~ ^[1-9][0-9]{0,8}$ && $sha =~ ^[a-f0-9]{40}$ ]]
root=/opt/kalakai-auto
state=/var/lib/kalakai-automation
storage=/mnt/kalakai-preview-builds
repo=/srv/kalakai
host=pr-$pr.preview.kalakai.site
name=kprev-$pr-${sha:0:16}
ref=refs/kalakai/automation/pr-$pr
docker() { sudo -n /usr/bin/docker "$@"; }
findmnt --mountpoint "$storage" >/dev/null
git -C "$repo" fetch --quiet --no-tags origin "+refs/pull/$pr/head:$ref"
[[ $(git -C "$repo" rev-parse "$ref") == "$sha" ]]
previous=$(cat "$state/pr-$pr.container" 2>/dev/null || true)
[[ $previous != "$name" ]]
docker rm -fv "$name" >/dev/null 2>&1 || true
sudo -n rm -rf --one-file-system -- "$storage/$name"
sudo -n install -d -o 10001 -g 10001 -m 0750 "$storage/$name"
active=0
cleanup() {
    rc=$?
    if (( ! active )); then
        if (( rc )); then docker logs --tail 45 "$name" 2>&1 | head -c 12000 || true; fi
        docker rm -fv "$name" >/dev/null 2>&1 || true
        sudo -n rm -rf --one-file-system -- "$storage/$name"
    fi
    exit "$rc"
}
trap cleanup EXIT
restrict=(--cap-drop ALL --security-opt no-new-privileges --pids-limit 256 --memory 1350m --memory-swap 2500m --cpus 1.5
    --cgroup-parent kalakai-preview.slice --read-only --tmpfs /tmp:rw,nosuid,nodev,size=128m
    --mount "type=bind,src=$storage/$name,dst=/app")
git -C "$repo" archive "$sha" | docker run --rm -i --network none "${restrict[@]}" \
    kalakai-preview-base:1 tar -x --no-same-owner --no-same-permissions -C /app
docker run -d --name "$name" --network kalakai-preview "${restrict[@]}" --init \
    --label kalakai.preview=true --log-opt max-size=5m --log-opt max-file=2 \
    --mount "type=bind,src=$root/kalakai-auto-container.sh,dst=/run-preview.sh,readonly" \
    -e "PREVIEW_URL=https://$host" -p 127.0.0.1::3000 -p 127.0.0.1::8080 \
    kalakai-preview-base:1 bash /run-preview.sh >/dev/null
web=$(docker port "$name" 3000/tcp)
api=$(docker port "$name" 8080/tcp)
ready=0
for (( i=0; i<180; i++ )); do
    [[ $(docker inspect --format '{{.State.Running}}' "$name") == true ]] || exit 1
    if curl -fsS --max-time 4 "http://$web/login" >/dev/null 2>&1 &&
       curl -fsS --max-time 4 "http://$api/api/health" >/dev/null 2>&1; then ready=1; break; fi
    sleep 4
done
(( ready ))
if [[ $mode == check ]]; then echo "PREVIEW BUILD VERIFIED $pr $sha (no promotion)"; exit 0; fi
docker update --memory 320m --memory-swap 500m --cpus 0.6 "$name" >/dev/null
[[ $(git -C "$repo" ls-remote origin "refs/pull/$pr/head" | cut -f1) == "$sha" ]]
python3 - "$pr" "$sha" <<'PY'
import json, sys, urllib.request
pr, sha = sys.argv[1:]
req = urllib.request.Request(f"https://api.github.com/repos/WahyuniPutra/kalakai/pulls/{pr}",
                             headers={"User-Agent": "kalakai-vps-deploy"})
with urllib.request.urlopen(req, timeout=15) as response:
    info = json.load(response)
assert info["state"] == "open" and info["base"]["ref"] == "main" and info["head"]["sha"] == sha
PY
sudo -n "$root/kalakai-auto-nginx.py" "$pr" "$sha" "${web##*:}" "${api##*:}"
active=1
printf '%s\n' "$name" > "$state/pr-$pr.container.new"
mv -T "$state/pr-$pr.container.new" "$state/pr-$pr.container"
if [[ $previous =~ ^kprev-$pr-[a-f0-9]{16}$ ]]; then
    docker rm -fv "$previous" >/dev/null 2>&1 || true
    sudo -n rm -rf --one-file-system -- "$storage/$previous"
fi
if [[ $pr =~ ^[2-5]$ ]]; then sudo -n systemctl disable --now "kalakai-preview@$pr.service"; fi
echo "PREVIEW DEPLOYED $pr $sha https://$host"
