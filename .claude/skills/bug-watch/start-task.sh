#!/bin/bash
# Usage: start-task.sh <report-id>
# Sweeps merged task worktrees, creates ../memoryflash-worktrees/<id> on task/<id> from origin/main,
# installs deps, renders the agent prompt, and prints the prompt file path as its last line.
set -euo pipefail
ID="$1"
MAIN="$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")"
WT_ROOT="$(dirname "$MAIN")/memoryflash-worktrees"
WT="$WT_ROOT/$ID"
LOCK="$(git rev-parse --path-format=absolute --git-common-dir)/bug-watch-worktree.lock"

git -C "$MAIN" fetch -q origin main
until mkdir "$LOCK" 2>/dev/null; do sleep 1; done
trap 'rmdir "$LOCK" 2>/dev/null || true' EXIT

for branch in $(git -C "$MAIN" branch --format='%(refname:short)' --merged origin/main 'task/*'); do
	old="$WT_ROOT/${branch#task/}"
	[ "$old" = "$WT" ] && continue
	[ -d "$old" ] && git -C "$MAIN" worktree remove --force "$old" && echo "swept $old" >&2
	git -C "$MAIN" branch -D "$branch" >/dev/null
done
git -C "$MAIN" worktree prune

if [ ! -d "$WT" ]; then
	mkdir -p "$WT_ROOT"
	git -C "$MAIN" worktree add -q "$WT" -b "task/$ID" origin/main
fi
rmdir "$LOCK"; trap - EXIT

(cd "$WT" && yarn install >/dev/null 2>&1) || { echo "yarn install failed in $WT" >&2; exit 1; }
"$WT/.claude/skills/bug-watch/reports.sh" prompt "$ID" "$WT"
