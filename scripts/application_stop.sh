#!/bin/bash

# Stop the application gracefully
if pm2 list | grep -q "bookmark-app"; then
    pm2 stop bookmark-app
    pm2 delete bookmark-app
fi