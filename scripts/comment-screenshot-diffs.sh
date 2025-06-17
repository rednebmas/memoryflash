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

PR_NUMBER=$(jq --raw-output .pull_request.number "$GITHUB_EVENT_PATH")

if [ -n "$PR_NUMBER" ] && [ "$PR_NUMBER" != "null" ]; then
  COMMENT_JSON=$(gh api -X POST repos/"$GITHUB_REPOSITORY"/issues/"$PR_NUMBER"/comments -f body="Screenshot differences detected:") || {
    echo "Failed to post comment. Possibly due to permissions."
    exit 0
  }
  COMMENT_ID=$(echo "$COMMENT_JSON" | jq -r '.id')

  BODY="Screenshot differences detected:\n"
  COUNT=0
  for IMG in "${IMAGES[@]}"; do
    if [ $COUNT -ge 3 ]; then
      break
    fi
    NAME=$(basename "$IMG")
    SIZE=$(stat -c%s "$IMG")
  ATTACH=$(gh api -X POST repos/"$GITHUB_REPOSITORY"/issues/comments/"$COMMENT_ID"/attachments -f name="$NAME" -F size="$SIZE") || continue
    UPLOAD_URL=$(echo "$ATTACH" | jq -r '.upload_url')
    URL=$(echo "$ATTACH" | jq -r '.url')
    curl -sSfL -X PUT -H "Content-Type: image/png" --data-binary @"$IMG" "$UPLOAD_URL" || continue
    BODY+="\n**$NAME**\n![$NAME]($URL)\n"
    COUNT=$((COUNT + 1))
  done

  if [ ${#IMAGES[@]} -gt 3 ]; then
    BODY+="\n...and $((${#IMAGES[@]} - 3)) more."
  fi

  gh api -X PATCH repos/"$GITHUB_REPOSITORY"/issues/comments/"$COMMENT_ID" -f body="$BODY" || echo "Failed to update comment"
else
  echo "No pull request context; skipping comment"
fi

