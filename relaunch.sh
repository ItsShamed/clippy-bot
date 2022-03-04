#!/usr/bin/env sh

if [ $(id -u) != "0" ]; then
  sudo "$0" "$@"
  exit $?
fi


echo "Stopping current instance of Clippy..."; set -x
(docker stop clippy && set +x; echo "Clippy stopped.") || set +x; echo "Failed to stop Clippy (already stopped?)"
echo "Removing Clippy container"; set -x
(docker rm clippy && set +x; echo "Removed Clippy container") || set +x; echo "Failed to remove Clippy container (already removed?)"
echo "Rebuilding Docker image..."; set -x
(docker build -t clippy-bot . && set +x; echo "clippy-bot Docker image built!") || set +x; echo "Failed to rebuild Docker image"
