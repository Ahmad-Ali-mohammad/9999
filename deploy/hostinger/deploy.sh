#!/usr/bin/env bash
set -e
# Usage: Run this on the Hostinger VPS from the project root (e.g., /opt/money-way)

echo "Starting deploy script..."
# Build and run the services
sudo docker compose -f docker-compose.prod.yml pull || true
sudo docker compose -f docker-compose.prod.yml up -d --build

# Wait a bit for services
sleep 5

# Run database migrations for backend
echo "Running Prisma migrations..."
sudo docker compose -f docker-compose.prod.yml exec -T backend npx prisma migrate deploy || true

# Health check
echo "Checking services..."
# Check backend
curl -fsS http://127.0.0.1:4000/ || echo "Backend not responding yet"

echo "Deploy finished. Check logs if anything failed: sudo docker compose -f docker-compose.prod.yml logs -f"
