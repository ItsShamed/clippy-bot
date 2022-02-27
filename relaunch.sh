#!/usr/bin/env sh

if [ $(id -u) != "0" ]; then
  sudo "$0" "$@"
  exit $?
fi

set -x

echo "Stopping current instance of Clippy..."
(docker stop clippy && echo "Clippy stopped.") || echo "Failed to stop Clippy (already stopped?)"
echo "Removing Clippy container"
(docker rm clippy && echo "Removed Clippy container") || echo "Failed to remove Clippy container (already removed?)"
echo "Rebuilding Docker image..."
(docker build -t clippy-bot . && echo "clippy-bot Docker image built!") || echo "Failed to rebuild Docker image"
echo "Starting a new Clippy container..."
(docker run --env CLIPPY_TOKEN=$CLIPPY_TOKEN -d --name clippy clippy-bot && echo "Everything is good to go!") || echo "Failed to start Clippy container"
