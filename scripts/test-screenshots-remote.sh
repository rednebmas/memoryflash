#!/bin/bash
set -e

# Get current branch and create temp branch name
ORIGINAL_BRANCH=$(git rev-parse --abbrev-ref HEAD)
TEMP_BRANCH="screenshot-test-$(date +%s)"

echo "Creating temporary branch: $TEMP_BRANCH"

# Stash any changes (including untracked)
STASH_RESULT=$(git stash push -u -m "temp-screenshot-test" 2>&1) || true
HAS_STASH=false
if [[ "$STASH_RESULT" != *"No local changes"* ]]; then
    HAS_STASH=true
fi

# Create and switch to temp branch
git checkout -b "$TEMP_BRANCH"

# Apply stashed changes if we had any
if [ "$HAS_STASH" = true ]; then
    git stash pop
fi

# Commit everything
git add -A
git commit -m "Screenshot test - temporary commit" --allow-empty

# Push temp branch
git push origin "$TEMP_BRANCH"

# Trigger workflow
echo "Triggering workflow on $TEMP_BRANCH..."
gh workflow run test.yml --ref "$TEMP_BRANCH"

# Stash changes again before switching back (so we can restore them)
if [ "$HAS_STASH" = true ]; then
    git stash push -u -m "restore-to-original"
fi

# Switch back to original branch
git checkout "$ORIGINAL_BRANCH"

# Restore uncommitted changes to original branch
if [ "$HAS_STASH" = true ]; then
    git stash pop
fi

# Delete local temp branch
git branch -D "$TEMP_BRANCH"

echo ""
echo "Workflow triggered on branch: $TEMP_BRANCH"
echo "Run 'gh run watch' to monitor progress"
echo ""
echo "To clean up remote branch after tests complete:"
echo "  git push origin --delete $TEMP_BRANCH"
