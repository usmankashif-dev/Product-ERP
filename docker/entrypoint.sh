#!/bin/bash
set -e

echo "========================================"
echo "Laravel Application Startup"
echo "========================================"

# Set APP_URL if not already set
if [ -z "$APP_URL" ]; then
    echo "APP_URL not set, using default: https://product-erp-1.onrender.com"
    export APP_URL="https://product-erp-1.onrender.com"
fi

echo "APP_URL: $APP_URL"
echo "APP_ENV: $APP_ENV"

# Update .env with current APP_URL
echo "Updating .env file with APP_URL..."
sed -i "s|^APP_URL=.*|APP_URL=$APP_URL|" /var/www/.env
if [ -n "$APP_ENV" ]; then
    sed -i "s|^APP_ENV=.*|APP_ENV=$APP_ENV|" /var/www/.env
fi
if [ -n "$APP_DEBUG" ]; then
    sed -i "s|^APP_DEBUG=.*|APP_DEBUG=$APP_DEBUG|" /var/www/.env
fi

# Show updated .env
echo "Current .env configuration:"
head -6 /var/www/.env

# Run database migrations
echo ""
echo "Running database migrations..."
cd /var/www
php artisan migrate --force

# Clear all Laravel caches with the correct environment
echo ""
echo "Clearing Laravel caches..."
php artisan config:clear
php artisan view:clear
php artisan route:clear
php artisan optimize:clear

echo ""
echo "========================================"
echo "Starting supervisord..."
echo "========================================"
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
