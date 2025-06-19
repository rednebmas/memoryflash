#!/usr/bin/env bash
set -euo pipefail

BUCKET="mflash-github-test-reports"
RESULTS_DIR="apps/react/test-results"

# Authenticate for GCS
if [ -n "${GOOGLE_APPLICATION_CREDENTIALS:-}" ]; then
gcloud auth activate-service-account --key-file="$GOOGLE_APPLICATION_CREDENTIALS"
fi

if [ ! -d "$RESULTS_DIR" ]; then
echo "No test-results directory"
exit 0
fi

shopt -s globstar nullglob
files=("$RESULTS_DIR"/**/*.png "$RESULTS_DIR"/*.png)
if [ ${#files[@]} -eq 0 ]; then
echo "No screenshots to upload"
exit 0
fi

COMMIT_SHA="${COMMIT_SHA:-${GITHUB_SHA:-$(git rev-parse HEAD)}}"
TIMESTAMP=$(date +%s)
DEST="gs://$BUCKET/${COMMIT_SHA}-${TIMESTAMP}/"
URL_PREFIX="https://storage.googleapis.com/$BUCKET/${COMMIT_SHA}-${TIMESTAMP}/"

echo "Uploading screenshots to $DEST"
# Use gsutil to upload
gsutil -m cp "${files[@]}" "$DEST" >/dev/null

# Build comment body
lines=(
"### 📸 UI Plan Screenshots"
""
"Screenshots generated from \`ui-plan.md\`."
""
)
for f in "${files[@]}"; do
file="$(basename "$f")"
url="$URL_PREFIX$file"
lines+=("![]($url)")
lines+=("")

done

body=$(printf "%s\n" "${lines[@]}")

if [ -n "${PR_NUMBER:-}" ]; then
gh pr comment "$PR_NUMBER" --body "$body"
fi
