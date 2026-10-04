#!/bin/bash
# Bug-report task state CLI (prod Mongo). Usage: reports.sh <watch|list|claim|show|create|query|prompt|comment|set-status> ...
# Runs this checkout's code against the MONGO_URI in the primary checkout's gitignored apps/server/.env.autofix.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
MAIN="$(dirname "$(git -C "$ROOT" rev-parse --path-format=absolute --git-common-dir)")"
ENV_FILE="${BUG_WATCH_ENV:-$MAIN/apps/server/.env.autofix}"
[ -f "$ENV_FILE" ] || { echo "Missing $ENV_FILE — add MONGO_URI=<prod Atlas URI>" >&2; exit 1; }
cd "$ROOT/apps/server"
exec env DOTENV_CONFIG_PATH="$ENV_FILE" npx ts-node --transpile-only -r dotenv/config \
	src/scripts/bugWatch/bugReports.ts "$@"
