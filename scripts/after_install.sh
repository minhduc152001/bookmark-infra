#!/bin/bash

cd /var/www/bookmark-app

# Install all dependencies (including devDependencies needed for Prisma)
npm install

# Copy production environment file if it exists
if [ -f /home/ec2-user/.env.production ]; then
    cp /home/ec2-user/.env.production /var/www/bookmark-app/.env
fi

# Generate Prisma client explicitly
npx prisma generate

# Run database migrations
npm run prisma:migrate:deploy || true

# Remove devDependencies after build to save space
npm prune --production

# Set permissions
chmod +x scripts/*.sh