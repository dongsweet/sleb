#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

export COMPOSE_PARALLEL_LIMIT=1

if docker info >/dev/null 2>&1; then
  docker_cmd=(docker)
else
  docker_cmd=(sudo docker)
fi

compose=("${docker_cmd[@]}" compose -f docker-compose.server.yml)

git pull --ff-only

# Build once; web/api/worker all reuse the same runtime image.
"${compose[@]}" build api

"${compose[@]}" up -d postgres valkey minio
"${compose[@]}" up -d --no-build api worker web
"${compose[@]}" ps
