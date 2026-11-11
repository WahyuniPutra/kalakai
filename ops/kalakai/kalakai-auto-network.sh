#!/usr/bin/env bash
set -euo pipefail
bridge=kprev0
if ! docker network inspect kalakai-preview >/dev/null 2>&1; then
    docker network create --driver bridge --ipv6=false --opt com.docker.network.bridge.name="$bridge" \
        --opt com.docker.network.bridge.enable_icc=false kalakai-preview >/dev/null
fi
[[ $(docker network inspect --format '{{ index .Options "com.docker.network.bridge.name" }}' kalakai-preview) == "$bridge" ]]
iptables -N KALAKAI-PREVIEW 2>/dev/null || true
iptables -F KALAKAI-PREVIEW
iptables -A KALAKAI-PREVIEW -m conntrack --ctstate ESTABLISHED,RELATED -j RETURN
for address in 0.0.0.0/8 10.0.0.0/8 100.64.0.0/10 127.0.0.0/8 169.254.0.0/16 172.16.0.0/12 192.168.0.0/16 224.0.0.0/4 54.66.196.116/32; do
    iptables -A KALAKAI-PREVIEW -d "$address" -j DROP
done
iptables -A KALAKAI-PREVIEW -p tcp -m multiport --dports 80,443 -j RETURN
iptables -A KALAKAI-PREVIEW -j DROP
iptables -C DOCKER-USER -i "$bridge" -j KALAKAI-PREVIEW 2>/dev/null ||
    iptables -I DOCKER-USER 1 -i "$bridge" -j KALAKAI-PREVIEW
iptables -C INPUT -i "$bridge" -m conntrack --ctstate NEW -j DROP 2>/dev/null ||
    iptables -I INPUT 1 -i "$bridge" -m conntrack --ctstate NEW -j DROP
