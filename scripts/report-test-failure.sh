#!/usr/bin/env bash
set -euo pipefail

BUCKET="mflash-github-test-reports"
RESULTS_DIR="apps/react/test-results"

gcloud auth activate-service-account --key-file=$GOOGLE_APPLICATION_CREDENTIALS

if [ ! -d "$RESULTS_DIR" ]; then
echo "No test-results directory"
exit 0
fi

shopt -s globstar nullglob
files=("$RESULTS_DIR"/**/*.png)
if [ ${#files[@]} -eq 0 ]; then
echo "No screenshots to upload"
exit 0
fi

COMMIT_SHA="${COMMIT_SHA:-${GITHUB_SHA:-$(git rev-parse HEAD)}}"
TIMESTAMP=$(date +%s)
DEST="gs://$BUCKET/${COMMIT_SHA}-${TIMESTAMP}/"

# Upload screenshots
printf 'Uploading screenshots to %s\n' "$DEST"
# gsutil prints progress to stderr so we hide it
if ! gsutil -m cp "${files[@]}" "$DEST" >/dev/null; then
echo "gsutil upload failed"
exit 1
fi

URL_PREFIX="https://storage.googleapis.com/$BUCKET/${COMMIT_SHA}-${TIMESTAMP}/"

body="Test failures detected. Screenshots uploaded:\n"
for f in "${files[@]}"; do
base=$(basename "$f")
body+="${URL_PREFIX}${base}\n"
done

if [ -n "${PR_NUMBER:-}" ]; then
gh pr comment "$PR_NUMBER" --body "$body"
fi
