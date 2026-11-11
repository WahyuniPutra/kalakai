FROM node:24-bookworm-slim AS node
FROM composer:2 AS composer
FROM php:8.5-cli-bookworm
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates curl git unzip && rm -rf /var/lib/apt/lists/* \
    && useradd -u 10001 -m preview && install -d -o preview -g preview /app
COPY --from=node /usr/local/bin/node /usr/local/bin/node
COPY --from=node /usr/local/lib/node_modules/npm /usr/local/lib/node_modules/npm
COPY --from=composer /usr/bin/composer /usr/local/bin/composer
RUN ln -s ../lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
    && ln -s ../lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx \
    && npm install --global --no-audit --no-fund pnpm@11.28.11 \
    && php -m | grep -qx pdo_sqlite
WORKDIR /app
USER 10001:10001
