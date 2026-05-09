#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

export COMPOSE_PARALLEL_LIMIT=1

compose=(docker compose -f docker-compose.server.yml)

git pull --ff-only

# Build serially so small test servers do not get saturated by concurrent Node builds.
"${compose[@]}" build api
"${compose[@]}" build worker
"${compose[@]}" build web

"${compose[@]}" up -d postgres valkey minio
"${compose[@]}" up -d api worker web
"${compose[@]}" ps

