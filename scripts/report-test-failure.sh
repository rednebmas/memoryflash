#!/usr/bin/env bash
set -euo pipefail

BUCKET="mflash-github-test-reports"
RESULTS_DIR="apps/react/test-results"
REPORT_DIR="apps/react/playwright-report"

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

URL_PREFIX="https://storage.googleapis.com/$BUCKET/${COMMIT_SHA}-${TIMESTAMP}/"

echo "Uploading screenshots to $DEST"
gsutil -m cp "${files[@]}" "$DEST" >/dev/null

# Upload Playwright report if available
REPORT_URL=""
if [ -d "$REPORT_DIR" ]; then
  echo "Uploading Playwright report"
  gsutil -m cp -r "$REPORT_DIR" "$DEST" >/dev/null
  REPORT_URL="${URL_PREFIX}${REPORT_DIR##*/}/index.html"
fi

BRANCH="${GITHUB_HEAD_REF:-${GITHUB_REF#refs/heads/}}"
WORKFLOW_URL="https://github.com/${GITHUB_REPOSITORY}/actions/workflows/update-snapshots.yml?ref=${BRANCH}"

# Build Markdown body using an array for cleaner multi-line assembly
lines=(
  "### 🔴 Test Failures Detected"
  ""
  "Below is a gallery of each test’s **actual** vs **diff**. Click to view full-size or run locally:"
  ""
)

if [ -n "$REPORT_URL" ]; then
  lines+=(
    "View the full Playwright report [here]($REPORT_URL)."
    ""
  )
fi

# Map each prefix to its actual, expected, and diff paths
declare -A actual_paths expected_paths diff_paths
# actual + diff come from uploaded files
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
# expected snapshots live alongside tests
while IFS= read -r -d '' f; do
  base="$(basename "$f")"
  prefix="${base%.png}"
  expected_paths["$prefix"]="$f"
done < <(find apps/react/tests -name '*.png' -print0)

# Render per-test table in rows with images in second column
readarray -t sorted_prefixes < <(printf '%s\n' "${!actual_paths[@]}" | sort)
for prefix in "${sorted_prefixes[@]}"; do
   actual_path="${actual_paths[$prefix]}"
   diff_path="${diff_paths[$prefix]:-}"
   expected_path="${expected_paths[$prefix]:-}"
   actual_file="$(basename "$actual_path")"
   diff_file="$(basename "$diff_path")"
   expected_file="$(basename "$expected_path")"
   actual_url="$URL_PREFIX$actual_file"
   diff_url="$URL_PREFIX$diff_file"
  # if expected file present, upload it too
  if [ -n "$expected_path" ]; then
    gsutil cp "$expected_path" "$DEST" >/dev/null
    expected_url="$URL_PREFIX$expected_file"
  else
    expected_url=""
  fi

  # Append per-test table with rows, images in second column
  lines+=(
    "---"
    ""
    "#### $prefix"
    ""
    "| | Screenshot |"
    "| :- | :-: |"
    "| **Actual** | [![actual]($actual_url)]($actual_url) |"
    "| **Expected** | [![expected]($expected_url)]($expected_url) |"
    "| **Diff** | [![diff]($diff_url)]($diff_url) |"
    ""
    ""
  )
done

lines+=(
  "---"
  "To update all screenshot snapshots, [run the Update Screenshot Test PNGs workflow]($WORKFLOW_URL)."
  ""
)

# Join all lines into the body
body=$(printf "%s\n" "${lines[@]}")

if [ -n "${PR_NUMBER:-}" ]; then
  existing_comment_id=$(gh api \
    "repos/${GITHUB_REPOSITORY}/issues/${PR_NUMBER}/comments" \
    --jq '.[] | select(.user.login=="github-actions[bot]" and .body | contains("Test Failures Detected")) | .id' \
    | head -n 1)

  body_link="### 🔴 Test Failures Detected\n\n"
  if [ -n "$REPORT_URL" ]; then
    body_link+="View the full Playwright report [here]($REPORT_URL)."
  fi

  if [ -n "$existing_comment_id" ]; then
    gh api \
      "repos/${GITHUB_REPOSITORY}/issues/comments/${existing_comment_id}" \
      -X PATCH -F body="$body_link"
  else
    gh pr comment "$PR_NUMBER" --body "$body"
  fi
fi
