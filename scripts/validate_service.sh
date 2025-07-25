#!/bin/bash

# Wait for the application to start
sleep 10

# Check if the application is responding
curl -f http://localhost:3000/health || exit 1

# Check if PM2 process is running
pm2 list | grep -q "bookmark-app" || exit 1

echo "Application is running successfully"