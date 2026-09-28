#!/bin/bash
# Usage: watch-deploy.sh <sha> — waits for every GitHub workflow run triggered by <sha> on main.
set -euo pipefail
SHA="$1"
for _ in $(seq 1 24); do
	ids="$(gh run list --commit "$SHA" --json databaseId --jq '.[].databaseId')"
	[ -n "$ids" ] && break
	sleep 5
done
[ -n "$ids" ] || { echo "No workflow runs found for $SHA" >&2; exit 1; }
sleep 10
ok=0
for id in $(gh run list --commit "$SHA" --json databaseId --jq '.[].databaseId'); do
	gh run watch "$id" --exit-status >/dev/null || { echo "Run $id failed: gh run view $id --log-failed" >&2; ok=1; }
done
exit $ok
