#!/usr/bin/env bash
set -euo pipefail
sudo -n tee /etc/systemd/system/kalakai-preview-network.service >/dev/null <<'UNIT'
[Unit]
Description=Apply network restrictions for isolated Kalakai previews
Requires=docker.service
After=docker.service
PartOf=docker.service

[Service]
Type=oneshot
ExecStart=/opt/kalakai-auto/kalakai-auto-network.sh
RemainAfterExit=yes
UNIT
sudo -n tee /etc/systemd/system/kalakai-deploy-sync.service >/dev/null <<'UNIT'
[Unit]
Description=Sync Kalakai preview and merged main releases from GitHub
Wants=network-online.target kalakai-preview-network.service
After=network-online.target kalakai-preview-network.service

[Service]
Type=oneshot
User=ubuntu
WorkingDirectory=/srv/kalakai
ExecStart=/opt/kalakai-auto/kalakai-auto-poll.py
TimeoutStartSec=45min
UNIT
sudo -n tee /etc/systemd/system/kalakai-deploy-sync.timer >/dev/null <<'UNIT'
[Unit]
Description=Check GitHub for Kalakai changes every three minutes

[Timer]
OnBootSec=25s
OnUnitInactiveSec=3min
AccuracySec=10s

[Install]
WantedBy=timers.target
UNIT
sudo -n systemctl daemon-reload
sudo -n systemd-analyze verify /etc/systemd/system/kalakai-deploy-sync.service \
    /etc/systemd/system/kalakai-deploy-sync.timer /etc/systemd/system/kalakai-preview-network.service
sudo -n systemctl start kalakai-preview-network.service
sudo -n systemctl start kalakai-deploy-sync.service
sudo -n systemctl enable --now kalakai-deploy-sync.timer
sudo -n journalctl -u kalakai-deploy-sync.service --no-pager -n 8
