#!/bin/bash
# Safe deploy for Plot Ghost
# Stops PM2 first so it doesn't crash-loop during build
cd /home/suareyai/.openclaw/workspace/bookwriter-mvp

echo "Stopping app..."
pm2 stop bookwriter-mvp 2>/dev/null

echo "Building..."
rm -rf .next
npm run build

if [ $? -eq 0 ]; then
  echo "Build succeeded. Starting app..."
  pm2 start bookwriter-mvp
  echo "Deploy complete!"
else
  echo "BUILD FAILED!"
  # Try to restart with old build if available
  pm2 start bookwriter-mvp 2>/dev/null
  exit 1
fi
