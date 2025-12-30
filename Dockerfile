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

# Install system + PHP build dependencies
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

# Install PHP extensions (only real ones)
RUN docker-php-ext-install \
    pdo \
    pdo_mysql \
    pdo_pgsql \
    bcmath \
    mbstring \
    xml

# PHP config
RUN echo "memory_limit = 512M" > /usr/local/etc/php/conf.d/memory.ini

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app

# Copy composer files first for caching
COPY composer.json composer.lock ./

# Install PHP dependencies WITHOUT running scripts (fixes package:discover error)
RUN composer install \
    --no-dev \
    --no-interaction \
    --prefer-dist \
    --optimize-autoloader \
    --no-scripts

# Copy the rest of the app
COPY . .

# Clean up build dependencies to reduce image size
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

# Expose port
EXPOSE 3000
ENV APP_ENV=production

# Entrypoint
RUN echo '#!/bin/sh\n\
php artisan key:generate --force\n\
php artisan config:clear\n\
php artisan config:cache\n\
php artisan route:cache\n\
php artisan view:cache\n\
# php artisan migrate --force  # optional, dangerous in production\n\
exec supervisord -c /etc/supervisor/conf.d/supervisord.conf\n\
' > /entrypoint.sh && chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
