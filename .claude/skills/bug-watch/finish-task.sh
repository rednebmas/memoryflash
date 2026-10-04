#!/bin/bash
# Usage: finish-task.sh   (run from inside a task worktree, after committing)
# Rebases onto origin/main, runs yarn test:codex (plus yarn test:screenshots when apps/react/ or
# packages/ changed), pushes HEAD:main (= deploy), marks the report fixed, waits for the GitHub
# deploy workflows, marks it shipped (or failed). Last line: RESULT: ...
# DRY_RUN=1 stops before pushing. Exit 2 = rebase conflict: resolve, `git rebase --continue`, rerun.
# Exit 3 = test:codex, 4 = Prettier, 5 = screenshot specs failed after rebase.
set -euo pipefail
BRANCH="$(git branch --show-current)"
case "$BRANCH" in task/*) ;; *) echo "Not on a task/* branch" >&2; exit 1 ;; esac
ID="${BRANCH#task/}"
ROOT="$(git rev-parse --show-toplevel)"
REPORTS="$ROOT/.claude/skills/bug-watch/reports.sh"
LOCK="$(git rev-parse --path-format=absolute --git-common-dir)/bug-watch-finish.lock"

git diff --quiet && git diff --cached --quiet || { echo "Uncommitted changes — commit first" >&2; exit 1; }

echo "Waiting for the merge lock (one finish at a time)..." >&2
until mkdir "$LOCK" 2>/dev/null; do sleep 5; done
trap 'rmdir "$LOCK" 2>/dev/null || true' EXIT

pushed=""
for attempt in 1 2 3; do
	git fetch -q origin main
	if ! git rebase origin/main; then
		echo "REBASE CONFLICT: resolve the files, git add them, git rebase --continue, then rerun this script." >&2
		exit 2
	fi
	yarn install >/dev/null 2>&1
	changed="$(git diff --name-only --diff-filter=d origin/main...HEAD | grep -E '\.(ts|tsx|js|json|css|md|yml)$' || true)"
	if [ -n "$changed" ] && ! npx prettier --check $changed >&2; then
		echo "RESULT: FAILED — run npx prettier --write on those files, amend/commit, rerun" >&2
		exit 4
	fi
	yarn test:codex || { echo "RESULT: FAILED — yarn test:codex failed after rebase; fix and rerun" >&2; exit 3; }
	if git diff --name-only origin/main...HEAD | grep -qE '^(apps/react|packages)/' && ! yarn test:screenshots; then
		echo "RESULT: FAILED — screenshot specs failed after rebase; Read the expected/actual/diff PNGs in apps/react/test-results, fix unintended diffs, update baselines only for intentional changes (Read them first), commit, rerun" >&2
		exit 5
	fi
	if [ -n "${DRY_RUN:-}" ]; then echo "DRY_RUN: skipping push" >&2; pushed=dry; break; fi
	if git push origin HEAD:main; then pushed=yes; break; fi
	echo "Push rejected (main moved) — retrying ($attempt/3)" >&2
done
[ -n "$pushed" ] || { echo "RESULT: FAILED — could not push after 3 attempts" >&2; exit 1; }
rmdir "$LOCK"; trap - EXIT

SHA="$(git rev-parse HEAD)"
[ "$pushed" = dry ] && { echo "RESULT: DRY RUN ok at $SHA (not pushed, status unchanged)"; exit 0; }
"$REPORTS" set-status "$ID" fixed "$SHA"
"$(dirname "$0")/watch-deploy.sh" "$SHA" && status=shipped || status=failed
"$REPORTS" set-status "$ID" "$status" "$SHA"
echo "RESULT: pushed $SHA to main; report $ID $status"
