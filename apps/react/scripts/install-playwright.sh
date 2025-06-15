#!/usr/bin/env bash

# Skip installing playwright browsers in certain environments
if [ "${SKIP_PLAYWRIGHT:-}" = "true" ]; then
    echo "Skipping playwright install"
else
    npx playwright install
fi
