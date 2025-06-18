#!/usr/bin/env bash
set -euo pipefail

BUCKET="mflash-github-test-reports"
RESULTS_DIR="apps/react/test-results"

# Authenticate for GCS
gcloud auth activate-service-account --key-file="$GOOGLE_APPLICATION_CREDENTIALS"

# Bail if no screenshots
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

# Prepare upload path
COMMIT_SHA="${COMMIT_SHA:-${GITHUB_SHA:-$(git rev-parse HEAD)}}"
TIMESTAMP=$(date +%s)
DEST="gs://$BUCKET/${COMMIT_SHA}-${TIMESTAMP}/"

echo "Uploading screenshots to $DEST"
gsutil -m cp "${files[@]}" "$DEST" >/dev/null

URL_PREFIX="https://storage.googleapis.com/$BUCKET/${COMMIT_SHA}-${TIMESTAMP}/"

# Build Markdown body
body="### 🔴 Test Failures Detected\n\n"
body+="Below is a gallery of each test’s **actual** vs **diff**. Click to view full-size or run locally:\n\n"

# Map each prefix to its actual and diff paths
declare -A actual_paths diff_paths
for f in "${files[@]}"; do
  base="$(basename "$f")"
  if [[ "$base" == *-actual.png ]]; then
    prefix="${base%-actual.png}"
    actual_paths["$prefix"]="$f"
  elif [[ "$base" == *-diff.png ]]; then
    prefix="${base%-diff.png}"
    diff_paths["$prefix"]="$f"
  fi
done

# Render a two-column table per test
for prefix in "${!actual_paths[@]}"; do
  actual_path="${actual_paths[$prefix]}"
  diff_path="${diff_paths[$prefix]:-}"
  actual_file="$(basename "$actual_path")"
  diff_file="$(basename "$diff_path")"
  actual_url="$URL_PREFIX$actual_file"
  diff_url="$URL_PREFIX$diff_file"

  body+="---\n\n"
  body+="#### ${prefix}\n\n"
  body+="| Actual | Diff |\n"
  body+="| :----: | :---: |\n"
  body+="| [![actual](${actual_url})](${actual_url}) | [![diff](${diff_url})](${diff_url}) |\n\n"
  body+="\`\`\`bash\n"
  body+="npx jest -t \"${prefix}\"\n"
  body+="open \"$actual_path\"\n"
  body+="\`\`\`\n\n"
done

# Post to PR if applicable
if [ -n "${PR_NUMBER:-}" ]; then
  gh pr comment "$PR_NUMBER" --body "$body"
fi
