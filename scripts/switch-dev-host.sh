#!/usr/bin/env bash
set -e

if [ $# -ne 1 ]; then
    echo "Usage: $0 [localhost|wifi]" >&2
    exit 1
fi

case "$1" in
    localhost)
        HOST="localhost"
        ;;
    wifi)
        HOST="sd-mbpr.local"
        ;;
    *)
        echo "Invalid target: $1" >&2
        echo "Usage: $0 [localhost|wifi]" >&2
        exit 1
        ;;
esac

cat > apps/react/.env <<EOF2
VITE_API_BASE_URL=http://$HOST:3000
EOF2

echo "VITE_API_BASE_URL set to http://$HOST:3000 in apps/react/.env"

cat > apps/server/.env <<EOF2
APP_URL=http://$HOST:5173
PORT=3000
MONGO_URI=mongodb://localhost:27017/memoryflash
SESSION_SECRET_KEY=${HOST}_secret
EOF2

echo "APP_URL set to http://$HOST:5173 in apps/server/.env"
