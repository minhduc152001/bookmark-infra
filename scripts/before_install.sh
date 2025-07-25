#!/bin/bash

# Stop the application if running
if pm2 list | grep -q "bookmark-app"; then
    pm2 stop bookmark-app || true
fi

# Clean up old application files
rm -rf /var/www/bookmark-app/*

# Create necessary directories
mkdir -p /var/www/bookmark-app
mkdir -p /var/log/bookmark-app

# Set proper permissions
chown -R ec2-user:ec2-user /var/www/bookmark-app
chown -R ec2-user:ec2-user /var/log/bookmark-app