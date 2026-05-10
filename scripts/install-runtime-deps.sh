#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

if docker info >/dev/null 2>&1; then
  docker_cmd=(docker)
else
  docker_cmd=(sudo docker)
fi

user_args=()
if [ "$(id -u)" != "0" ]; then
  user_args=(-u "$(id -u):$(id -g)" -e HOME=/tmp)
fi

"${docker_cmd[@]}" run --rm \
  "${user_args[@]}" \
  -v "$PWD:/app" \
  -w /app \
  node:22-alpine \
  npm ci --omit=dev
