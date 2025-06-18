#!/usr/bin/env bash
set -euo pipefail
set -x

BUCKET="mflash-github-test-reports"

DIR="apps/react/test-results"

if [ ! -d "$DIR" ]; then
  echo "No screenshot results directory: $DIR"
  exit 0
fi

mapfile -t IMAGES < <(find "$DIR" -name '*-diff.png')
echo "Found diff images: ${IMAGES[*]}"

if [ ${#IMAGES[@]} -eq 0 ]; then
  echo "No screenshot diffs found"
  exit 0
fi

PR_NUMBER=$(jq --raw-output .pull_request.number "$GITHUB_EVENT_PATH")

if [ -n "$PR_NUMBER" ] && [ "$PR_NUMBER" != "null" ]; then
  echo "Creating comment on PR #$PR_NUMBER"
  COMMENT_JSON=$(gh api -X POST repos/"$GITHUB_REPOSITORY"/issues/"$PR_NUMBER"/comments -f body="Screenshot differences detected:") || {
    echo "Failed to post comment. Possibly due to permissions."
    exit 0
  }
  COMMENT_ID=$(echo "$COMMENT_JSON" | jq -r '.id')
  echo "Comment ID: $COMMENT_ID"

  BODY="Screenshot differences detected:\n"
  COUNT=0
  for IMG in "${IMAGES[@]}"; do
    if [ $COUNT -ge 3 ]; then
      break
    fi
    NAME=$(basename "$IMG")
    DEST="pr-${PR_NUMBER}/$NAME"
    echo "Uploading $NAME to gs://$BUCKET/$DEST"
    if gsutil cp "$IMG" "gs://$BUCKET/$DEST"; then
      URL="https://storage.googleapis.com/$BUCKET/$DEST"
      BODY+="\n**$NAME**\n![$NAME]($URL)\n"
      COUNT=$((COUNT + 1))
    else
      echo "Failed to upload $NAME to GCS"
    fi
  done

  if [ ${#IMAGES[@]} -gt 3 ]; then
    BODY+="\n...and $((${#IMAGES[@]} - 3)) more."
  fi

  gh api -X PATCH repos/"$GITHUB_REPOSITORY"/issues/comments/"$COMMENT_ID" -f body="$BODY" || echo "Failed to update comment"
else
  echo "No pull request context; skipping comment"
fi

