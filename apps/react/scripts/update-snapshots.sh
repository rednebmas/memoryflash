#!/bin/bash

# Script to update image snapshots after test failures

cd "$(dirname "$0")/.."
echo "Updating image snapshots..."
yarn test:run -- MusicNotationScreenshot.test.tsx -u
echo "Done updating snapshots" 