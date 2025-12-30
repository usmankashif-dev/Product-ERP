#!/bin/bash
set -e

echo "Running Laravel migrations..."
php artisan migrate --force

echo "Clearing and caching configuration..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "Application startup complete!"
