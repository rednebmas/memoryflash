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

BODY="Screenshot differences detected:
"
COUNT=0
for IMG in "${IMAGES[@]}"; do
  if [ $COUNT -ge 5 ]; then
    break
  fi
  NAME=$(basename "$IMG")
  ENCODED=$(base64 -w0 "$IMG")
  BODY+="
**$NAME**
![$NAME](data:image/png;base64,$ENCODED)
"
  COUNT=$((COUNT + 1))
done

if [ ${#IMAGES[@]} -gt 5 ]; then
  BODY+="
...and $((${#IMAGES[@]} - 5)) more."
fi

PR_NUMBER=$(jq --raw-output .pull_request.number "$GITHUB_EVENT_PATH")

if [ -n "$PR_NUMBER" ] && [ "$PR_NUMBER" != "null" ]; then
  if ! gh api repos/"$GITHUB_REPOSITORY"/issues/"$PR_NUMBER"/comments -f body="$BODY"; then
    echo "Failed to post comment. Possibly due to permissions."
  fi
else
  echo "No pull request context; skipping comment"
fi

