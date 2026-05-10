#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

if docker info >/dev/null 2>&1; then
  docker_cmd=(docker)
else
  docker_cmd=(sudo docker)
fi

"${docker_cmd[@]}" run --rm \
  -v "$PWD:/app" \
  -w /app \
  node:22-alpine \
  npm ci --omit=dev

