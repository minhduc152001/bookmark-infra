#!/bin/bash

cd /var/www/bookmark-app

# Install dependencies
npm install --production

# Copy production environment file if it exists
if [ -f /home/ec2-user/.env.production ]; then
    cp /home/ec2-user/.env.production /var/www/bookmark-app/.env
fi

# Generate Prisma client
npx prisma generate

# Run database migrations
npm run prisma:migrate:deploy || true

# Set permissions
chmod +x scripts/*.sh