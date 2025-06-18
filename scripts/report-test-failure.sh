#!/usr/bin/env bash
set -euo pipefail

BUCKET="mflash-github-test-reports"
RESULTS_DIR="apps/react/test-results"

# Authenticate for gsutil
gcloud auth activate-service-account --key-file="$GOOGLE_APPLICATION_CREDENTIALS"

# Exit if no results directory or no screenshots
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

# Determine where to upload
COMMIT_SHA="${COMMIT_SHA:-${GITHUB_SHA:-$(git rev-parse HEAD)}}"
TIMESTAMP=$(date +%s)
DEST="gs://$BUCKET/${COMMIT_SHA}-${TIMESTAMP}/"

echo "Uploading screenshots to $DEST"
gsutil -m cp "${files[@]}" "$DEST" >/dev/null

URL_PREFIX="https://storage.googleapis.com/$BUCKET/${COMMIT_SHA}-${TIMESTAMP}/"

# Build the Markdown comment
body="### 🔴 Test Failures Detected\n\n"
body+="The following tests failed. Click the image to view the screenshot, or run it locally:\n\n"

for f in "${files[@]}"; do
  filename="$(basename "$f")"
  test_name="${filename%.png}"
  image_url="${URL_PREFIX}${filename}"

  body+="**${test_name}**\n\n"
  body+="[![${test_name}](${image_url})](${image_url})\n\n"
  body+="\`\`\`bash\n"
  body+="npx jest -t \"${test_name}\"\n"
  body+="open \"$f\"\n"
  body+="\`\`\`\n\n"
done

# Post the comment if we’re in a PR context
if [ -n "${PR_NUMBER:-}" ]; then
  gh pr comment "$PR_NUMBER" --body "$body"
fi
