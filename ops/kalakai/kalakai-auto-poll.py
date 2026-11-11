#!/usr/bin/env python3
from pathlib import Path
import json
import re
import subprocess
import sys
import time
import urllib.request

ROOT = Path("/opt/kalakai-auto")
STATE = Path("/var/lib/kalakai-automation")
REPO = "/srv/kalakai"
API = "https://api.github.com/repos/WahyuniPutra/kalakai/"
SHA = re.compile(r"[0-9a-f]{40}")
INITIAL = {
    "2": "e9b7ba7bae28ab6378ac4b0bfc2597f4cc931238",
    "3": "d640b999bbcb6a4f7dafe1667dad4bafc933cff4",
    "4": "27f50b8c675f1d5c845b62668ad5ce40d301f5e9",
    "5": "3dac3f6a64afd360d0ad4ed67cfc01814695f7c3",
}

def run(*args, capture=False, check=True):
    result = subprocess.run(args, check=check, text=True,
                            stdout=subprocess.PIPE if capture else None)
    return result.stdout.strip() if capture else result.returncode

def github(path):
    request = urllib.request.Request(API + path, headers={
        "User-Agent": "kalakai-vps-deploy", "Accept": "application/vnd.github+json",
    })
    with urllib.request.urlopen(request, timeout=15) as response:
        return json.load(response), 'rel="next"' in response.headers.get("Link", "")

def head():
    return run("git", "-C", REPO, "ls-remote", "--exit-code", "origin",
               "refs/heads/main", capture=True).split()[0]

def merge_pr(sha):
    associated, _ = github(f"commits/{sha}/pulls?per_page=25")
    for item in associated:
        if item["base"]["ref"] != "main" or item["state"] != "closed":
            continue
        pr, _ = github(f"pulls/{int(item['number'])}")
        if (pr["merged"] and pr["merged_at"] and pr["base"]["ref"] == "main"
                and pr["base"]["repo"]["full_name"].lower() == "wahyuniputra/kalakai"
                and pr["merge_commit_sha"] == sha):
            return pr["number"]
    return None

def live():
    sha = head()
    assert SHA.fullmatch(sha)
    current = run("git", "-C", REPO, "rev-parse", "HEAD", capture=True)
    if current == sha:
        print(f"LIVE CURRENT {sha[:12]}", flush=True)
        return
    number = merge_pr(sha)
    if number is None:
        print(f"LIVE HELD: {sha[:12]} is not a verified PR merge into main", flush=True)
        return
    print(f"LIVE MERGE VERIFIED PR #{number} {sha}", flush=True)
    run(str(ROOT / "kalakai-auto-live.sh"), sha)

def active_previews():
    active = {}
    for file in STATE.glob("pr-*.container"):
        value = file.read_text().strip()
        match = re.fullmatch(r"kprev-([1-9][0-9]{0,8})-([a-f0-9]{16})", value)
        if match and file.name == f"pr-{match[1]}.container":
            active[match[1]] = (match[2], value)
    return active

def previews():
    run("systemctl", "is-active", "--quiet", "kalakai-preview-network.service")
    active = active_previews()
    session_source = run("git", "-C", REPO, "show", "HEAD:frontend/src/lib/auth-proxy.ts", capture=True)
    origin_guard = run("git", "-C", REPO, "cat-file", "-e", "HEAD:frontend/src/proxy.ts", check=False) == 0
    open_to_forks = "__Host-kalakai_session" in session_source and origin_guard
    prs = []
    for page in range(1, 21):
        items, more = github(f"pulls?state=open&base=main&per_page=100&page={page}")
        prs.extend(items)
        if not more:
            break
    for n, (_, name) in active.items():
        # Docker keeps the original loopback ports when an existing container starts.
        if run("sudo", "-n", "docker", "inspect", "-f", "{{.State.Running}}", name, capture=True) != "true":
            run("sudo", "-n", "docker", "start", name)
    for item in sorted(prs, key=lambda p: p["number"]):
        number = str(item["number"])
        sha = item["head"]["sha"]
        if not re.fullmatch(r"[1-9][0-9]{0,8}", number) or not SHA.fullmatch(sha):
            continue
        if number in active and active[number][0] == sha[:16]:
            continue
        if number not in active and INITIAL.get(number) == sha:
            continue
        source_repo = ((item["head"].get("repo") or {}).get("full_name") or "").lower()
        if not open_to_forks and source_repo not in ("jrdrwn/kalakai", "wahyuniputra/kalakai"):
            print(f"PREVIEW HELD PR #{number}: waiting for production session isolation", flush=True)
            continue
        failed = STATE / f"pr-{number}.failed"
        if failed.exists() and failed.read_text().strip() == sha and time.time() - failed.stat().st_mtime < 900:
            continue
        print(f"PREVIEW QUEUED PR #{number} {sha}", flush=True)
        if run(str(ROOT / "kalakai-auto-preview.sh"), number, sha, check=False):
            failed.write_text(sha + "\n")
            print(f"PREVIEW FAILED PR #{number}; retaining last successful version", file=sys.stderr, flush=True)
        else:
            failed.unlink(missing_ok=True)
        break
    else:
        print(f"PREVIEWS CURRENT ({len(prs)} open PRs)", flush=True)

if __name__ == "__main__":
    failures = 0
    for phase in (live, previews):
        try:
            phase()
        except (OSError, ValueError, subprocess.CalledProcessError, AssertionError) as error:
            print(f"{phase.__name__}: {error}", file=sys.stderr, flush=True)
            failures += 1
    sys.exit(bool(failures))
