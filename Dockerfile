# ================================
# Stage 1: Build frontend assets
# ================================
FROM node:20-alpine AS frontend

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build


# ================================
# Stage 2: PHP + Nginx + Laravel
# ================================
FROM php:8.2-fpm-alpine

# Install system + PHP build deps
RUN apk add --no-cache \
    curl \
    git \
    zip \
    unzip \
    supervisor \
    nginx \
    postgresql-client \
    mysql-client \
    libpq-dev \
    oniguruma-dev \
    libxml2-dev \
    autoconf \
    build-base

# Install PHP extensions
RUN docker-php-ext-install \
    pdo \
    pdo_mysql \
    pdo_pgsql \
    bcmath \
    mbstring \
    xml

# Create PHP config
RUN echo "memory_limit = 512M" > /usr/local/etc/php/conf.d/memory.ini

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app

# Copy composer files first
COPY composer.json composer.lock ./

# Install PHP dependencies (before full copy to use Docker cache better)
RUN composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader

# Copy rest of app
COPY . .

# Clean up build deps to reduce image size
RUN apk del --no-cache autoconf build-base

# Copy frontend build
COPY --from=frontend /app/public/build ./public/build

# Permissions
RUN mkdir -p storage/logs \
    && chmod -R 775 storage bootstrap/cache \
    && chown -R www-data:www-data /app

# Nginx config
RUN mkdir -p /etc/nginx/conf.d
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Supervisor config
RUN mkdir -p /etc/supervisor/conf.d
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

EXPOSE 3000
ENV APP_ENV=production

# Entrypoint
RUN echo '#!/bin/sh\n\
php artisan config:clear\n\
php artisan config:cache\n\
php artisan route:cache\n\
php artisan view:cache\n\
php artisan migrate --force\n\
exec supervisord -c /etc/supervisor/conf.d/supervisord.conf\n\
' > /entrypoint.sh && chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
