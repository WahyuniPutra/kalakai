#!/usr/bin/env bash
set -euo pipefail
image=/var/lib/kalakai/deploy/preview-storage.img
point=/mnt/kalakai-preview-builds
sudo -n install -d -m 0700 /var/lib/kalakai/deploy "$point"
if ! sudo -n test -e "$image"; then
    test "$(df --output=avail -k /var/lib | tail -1)" -gt 12000000
    sudo -n install -m 0600 /dev/null "$image"
    sudo -n fallocate -l 8G "$image"
    sudo -n mkfs.ext4 -q -F -m 0 "$image"
fi
if ! grep -Fq " $point " /etc/fstab; then
    printf '%s %s ext4 loop,nosuid,nodev,nofail 0 0\n' "$image" "$point" | sudo -n tee -a /etc/fstab >/dev/null
fi
swapfile=/var/lib/kalakai/deploy/swapfile
if sudo -n test -f "$swapfile" && ! grep -Fq "$swapfile " /etc/fstab; then
    printf '%s none swap sw,nofail 0 0\n' "$swapfile" | sudo -n tee -a /etc/fstab >/dev/null
fi
if ! findmnt --mountpoint "$point" >/dev/null; then sudo -n mount "$point"; fi
sudo -n chmod 0700 "$point"
sudo -n tee /etc/systemd/system/kalakai-preview.slice >/dev/null <<'UNIT'
[Unit]
Description=Limits for isolated Kalakai preview containers

[Slice]
MemoryHigh=900M
MemoryMax=1500M
MemorySwapMax=1500M
CPUQuota=150%
TasksMax=1024
UNIT
sudo -n systemctl daemon-reload
sudo -n systemctl start kalakai-preview.slice
sudo -n docker info --format '{{.CgroupDriver}}' | grep -qx systemd
