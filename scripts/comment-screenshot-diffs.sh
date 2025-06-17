#!/usr/bin/env bash
set -euo pipefail

DIR="apps/react/test-results"

if [ ! -d "$DIR" ]; then
  echo "No screenshot results directory"
  exit 0
fi

mapfile -t IMAGES < <(find "$DIR" -name '*-diff.png')

if [ ${#IMAGES[@]} -eq 0 ]; then
  echo "No screenshot diffs found"
  exit 0
fi

BODY="Screenshot differences detected:\n"
COUNT=0
for IMG in "${IMAGES[@]}"; do
  if [ $COUNT -ge 5 ]; then
    break
  fi
  NAME=$(basename "$IMG")
  ENCODED=$(base64 -w0 "$IMG")
  BODY+="\n**$NAME**\n![$NAME](data:image/png;base64,$ENCODED)\n"
  COUNT=$((COUNT + 1))
done

if [ ${#IMAGES[@]} -gt 5 ]; then
  BODY+="\n...and $((${#IMAGES[@]} - 5)) more."
fi

PR_NUMBER=$(jq --raw-output .pull_request.number "$GITHUB_EVENT_PATH")

if [ -n "$PR_NUMBER" ] && [ "$PR_NUMBER" != "null" ]; then
  gh api repos/"$GITHUB_REPOSITORY"/issues/"$PR_NUMBER"/comments -f body="$BODY"
else
  echo "No pull request context; skipping comment"
fi

