#!/bin/bash

# Exit on any error
set -e

echo "================================================="
echo "   Grekam-OS VPS Deployment Script"
echo "================================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker and Docker Compose first."
    echo "Run: curl -fsSL https://get.docker.com -o get-docker.sh && sudo sh get-docker.sh"
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found!"
    echo "Creating one from .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "✅ Created .env. Please update it with your production secrets and run this script again."
        exit 1
    else
        echo "❌ .env.example not found either. Please create a .env file manually."
        exit 1
    fi
fi

echo "✅ Environment checks passed."

# Pull latest changes from git
echo "📥 Pulling latest changes from Git..."
if [ -d ".git" ]; then
    git pull
else
    echo "⚠️ Not a git repository, skipping git pull."
fi

echo "🔄 Building and starting Docker containers..."

# Run docker-compose using the production config
docker compose -f docker-compose.prod.yml up -d --build

echo "================================================="
echo "✅ Deployment Successful!"
echo "Your application should now be running."
echo "API is available on port 4000"
echo "Web is available on port 3000"
echo "================================================="
echo "To view logs, run: docker compose -f docker-compose.prod.yml logs -f"
echo "================================================="
