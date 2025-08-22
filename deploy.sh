#!/bin/bash

# RunCloud Deployment Script for Waapify-GHL
echo "🚀 Starting RunCloud deployment..."

# Set production environment
export NODE_ENV=production

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --only=production

# Build the application
echo "🔨 Building application..."
npm run build

# Create logs directory
mkdir -p logs

# Create uploads directory if needed
mkdir -p uploads

# Set correct permissions
chmod -R 755 dist/
chmod -R 755 logs/

echo "✅ Deployment preparation complete!"
echo "Next steps:"
echo "1. Setup database tables in phpMyAdmin"
echo "2. Configure environment variables in RunCloud"
echo "3. Start the application with: npm run pm2:start"