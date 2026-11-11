#!/usr/bin/env python3
from pathlib import Path
import os
import re
import subprocess
import sys

n, sha, web, api = sys.argv[1:]
assert re.fullmatch(r"[1-9][0-9]{0,8}", n)
assert re.fullmatch(r"[a-f0-9]{40}", sha)
assert all(p.isascii() and p.isdecimal() and 1024 <= int(p) <= 65535 for p in (web, api))
assert web != api
host = f"pr-{n}.preview.kalakai.site"
directory = Path("/etc/nginx/sites-available")
legacy = directory / "kalakai-previews"
destination = directory / f"kalakai-preview-pr-{n}"
enabled = Path("/etc/nginx/sites-enabled") / destination.name
previous_legacy = legacy.read_text()
previous = destination.read_text() if destination.exists() else None

def run(*args):
    subprocess.run(args, check=True)

def put(path, contents):
    temp = path.with_suffix(".new")
    temp.write_text(contents)
    os.chmod(temp, 0o644)
    temp.replace(path)

def reload():
    run("nginx", "-t")
    run("systemctl", "reload", "nginx")

legacy_http = re.search(r"server_name ([^;]+);", previous_legacy.split("listen 80;")[1]).group(1).split()
http = "" if host in legacy_http else f"""
server {{
    listen 80;
    server_name {host};
    location ^~ /.well-known/acme-challenge/ {{
        root /var/www/kalakai-acme;
        try_files $uri =404;
    }}
    location / {{ return 308 https://$host$request_uri; }}
}}
"""
cert = "kalakai-previews" if host in legacy_http else f"kalakai-pr-{n}"
certpath = Path("/etc/letsencrypt/live") / cert
try:
    if not (certpath / "fullchain.pem").exists():
        put(destination, http)
        enabled.symlink_to(destination)
        reload()
        run("/opt/kalakai-certbot/bin/certbot", "certonly", "--non-interactive", "--agree-tos",
            "--webroot", "--webroot-path", "/var/www/kalakai-acme", "--cert-name", cert, "-d", host)
    trimmed = re.sub(r"(?m)^server \{\n    listen 443 ssl;\n    server_name " + re.escape(host)
                     + r";\n[\s\S]*?^\}\n", "", previous_legacy)
    put(legacy, trimmed)
    put(destination, http + f"""
server {{
    listen 443 ssl;
    server_name {host};
    ssl_certificate {certpath}/fullchain.pem;
    ssl_certificate_key {certpath}/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    add_header X-Robots-Tag "noindex, nofollow" always;
    add_header X-Kalakai-Preview "PR #{n}" always;
    add_header X-Kalakai-Revision "{sha}" always;
    add_header Content-Security-Policy "script-src 'self' 'unsafe-inline'; object-src 'none'; base-uri 'self'" always;
    add_header Referrer-Policy "same-origin" always;
    limit_req zone=kalakai_preview burst=60 nodelay;
    limit_req_status 429;
    location = /robots.txt {{
        default_type text/plain;
        return 200 "User-agent: *\\nDisallow: /\\n";
    }}
    location = /ads.txt {{ return 404; }}
    location = /sitemap.xml {{ return 404; }}
    location = /api/health {{ proxy_pass http://127.0.0.1:{api}; }}
    location ^~ /backend/api/events/ {{
        proxy_pass http://127.0.0.1:{api}/api/events/;
    }}
    location / {{
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header X-Forwarded-For $remote_addr;
        proxy_buffering off;
        proxy_pass http://127.0.0.1:{web};
    }}
}}
""")
    if not enabled.is_symlink():
        enabled.symlink_to(destination)
    reload()
    run("curl", "-fsS", "--max-time", "10", "--resolve", f"{host}:443:127.0.0.1",
        "-o", "/dev/null", f"https://{host}/api/health")
    run("curl", "-fsS", "--max-time", "10", "--resolve", f"{host}:443:127.0.0.1",
        "-o", "/dev/null", f"https://{host}/")
except BaseException:
    put(legacy, previous_legacy)
    if previous is None:
        enabled.unlink(missing_ok=True)
        destination.unlink(missing_ok=True)
    else:
        put(destination, previous)
    reload()
    raise
